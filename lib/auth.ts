import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  signOut as firebaseSignOut,
  type User,
  updateProfile,
} from "firebase/auth"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore"
import { auth, db, hasValidConfig } from "./firebase"

export interface UserProfile {
  uid: string
  phone: string
  role: "vendor" | "supplier" | "admin"
  name?: string
  email?: string
  location?: string
  address?: string
  category?: string
  businessName?: string
  gstNumber?: string
  panNumber?: string
  bankDetails?: {
    accountNumber: string
    ifscCode: string
    bankName: string
    accountHolderName: string
  }
  isVerified: boolean
  isActive: boolean
  createdAt: any
  updatedAt: any
  lastLoginAt: any
  profileCompleteness: number
  preferences?: {
    notifications: boolean
    whatsappUpdates: boolean
    emailUpdates: boolean
    language: string
  }
  stats?: {
    totalOrders: number
    totalSavings: number
    groupsJoined: number
    surplusShared: number
  }
}

// Mock storage for demo mode
const mockUsers: { [key: string]: UserProfile } = {}
let mockCurrentUser: User | null = null

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

const checkRateLimit = (identifier: string, maxAttempts = 3, windowMs = 15 * 60 * 1000): boolean => {
  const now = Date.now()
  const record = rateLimiter.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

export const setupRecaptcha = (containerId: string): RecaptchaVerifier | null => {
  if (!hasValidConfig || !auth) {
    console.log("Demo mode: reCAPTCHA not required")
    return null
  }

  try {
    // Clear any existing reCAPTCHA
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ""
    }

    const recaptcha = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response: any) => {
        console.log("reCAPTCHA solved:", response)
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired")
      },
    })

    return recaptcha
  } catch (error) {
    console.error("Error setting up reCAPTCHA:", error)
    return null
  }
}

export const sendOTP = async (
  phoneNumber: string,
  recaptcha: RecaptchaVerifier | null,
): Promise<ConfirmationResult | any> => {
  // Rate limiting
  if (!checkRateLimit(`otp_${phoneNumber}`, 3, 15 * 60 * 1000)) {
    throw new Error("Too many OTP requests. Please try again after 15 minutes.")
  }

  // Format phone number
  const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`

  if (!hasValidConfig || !auth) {
    // Demo mode
    console.log(`Demo mode: OTP sent to ${formattedPhone}`)

    return {
      confirm: async (otp: string) => {
        if (otp === "123456") {
          const mockUser = {
            uid: `demo-${Date.now()}`,
            phoneNumber: formattedPhone,
            displayName: null,
            email: null,
          } as User
          mockCurrentUser = mockUser
          return { user: mockUser }
        } else {
          throw new Error("Invalid OTP. Use 123456 for demo.")
        }
      },
    }
  }

  try {
    // Validate phone number
    const phoneRegex = /^\+91[6-9]\d{9}$/
    if (!phoneRegex.test(formattedPhone)) {
      throw new Error("Please enter a valid Indian mobile number")
    }

    if (!recaptcha) {
      throw new Error("Security verification failed. Please refresh and try again.")
    }

    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptcha)
    return confirmation
  } catch (error: any) {
    console.error("Error sending OTP:", error)

    // Handle specific Firebase errors
    if (error.code === "auth/invalid-phone-number") {
      throw new Error("Invalid phone number format")
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many requests. Please try again later.")
    } else if (error.code === "auth/quota-exceeded") {
      throw new Error("SMS quota exceeded. Please try again later.")
    } else if (error.code === "auth/captcha-check-failed") {
      throw new Error("Security verification failed. Please refresh and try again.")
    }

    throw new Error(error.message || "Failed to send OTP. Please try again.")
  }
}

export const verifyOTP = async (confirmation: ConfirmationResult | any, otp: string): Promise<User> => {
  if (!checkRateLimit(`verify_${otp}`, 5, 5 * 60 * 1000)) {
    throw new Error("Too many verification attempts. Please try again after 5 minutes.")
  }

  try {
    const result = await confirmation.confirm(otp)

    // Update last login time if user exists
    if (result.user && hasValidConfig && db) {
      try {
        const userRef = doc(db, "users", result.user.uid)
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } catch (error) {
        // Ignore if user doesn't exist yet
        console.log("User profile not found, will be created")
      }
    }

    return result.user
  } catch (error: any) {
    console.error("Error verifying OTP:", error)

    if (error.code === "auth/invalid-verification-code") {
      throw new Error("Invalid verification code")
    } else if (error.code === "auth/code-expired") {
      throw new Error("Verification code has expired")
    } else if (error.code === "auth/session-expired") {
      throw new Error("Session has expired. Please request a new code.")
    }

    throw new Error("Invalid verification code")
  }
}

export const createUserProfile = async (user: User, role: string, additionalData: any = {}): Promise<void> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    phone: user.phoneNumber || "",
    role: role as "vendor" | "supplier" | "admin",
    name: additionalData.name || "",
    email: additionalData.email || "",
    location: additionalData.location || "",
    businessName: additionalData.businessName || "",
    isVerified: false,
    isActive: true,
    createdAt: hasValidConfig ? serverTimestamp() : new Date(),
    updatedAt: hasValidConfig ? serverTimestamp() : new Date(),
    lastLoginAt: hasValidConfig ? serverTimestamp() : new Date(),
    profileCompleteness: calculateProfileCompleteness({
      name: additionalData.name,
      email: additionalData.email,
      location: additionalData.location,
      businessName: additionalData.businessName,
    }),
    preferences: {
      notifications: true,
      whatsappUpdates: true,
      emailUpdates: true,
      language: "en",
    },
    stats: {
      totalOrders: 0,
      totalSavings: 0,
      groupsJoined: 0,
      surplusShared: 0,
    },
    ...additionalData,
  }

  if (!hasValidConfig || !db) {
    mockUsers[user.uid] = userProfile
    console.log("Demo mode: User profile created", userProfile)
    return
  }

  try {
    const batch = writeBatch(db)

    // Create user profile
    const userRef = doc(db, "users", user.uid)
    batch.set(userRef, userProfile)

    // Initialize platform stats if they don't exist
    const statsRef = doc(db, "platform_stats", "counters")
    const statsDoc = await getDoc(statsRef)

    if (!statsDoc.exists()) {
      batch.set(statsRef, {
        total_users: 1,
        vendor_count: role === "vendor" ? 1 : 0,
        supplier_count: role === "supplier" ? 1 : 0,
        admin_count: role === "admin" ? 1 : 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      batch.update(statsRef, {
        [`${role}_count`]: increment(1),
        total_users: increment(1),
        updatedAt: serverTimestamp(),
      })
    }

    await batch.commit()

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: additionalData.name || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
    })
  } catch (error: any) {
    console.error("Error creating user profile:", error)
    throw new Error("Failed to create user profile")
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!hasValidConfig || !db) {
    return mockUsers[uid] || null
  }

  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  if (!hasValidConfig || !db) {
    if (mockUsers[uid]) {
      mockUsers[uid] = { ...mockUsers[uid], ...updates, updatedAt: new Date() }
    }
    return
  }

  try {
    const userRef = doc(db, "users", uid)
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(userRef, updateData)
  } catch (error: any) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update profile")
  }
}

export const signOut = async (): Promise<void> => {
  if (!hasValidConfig || !auth) {
    mockCurrentUser = null
    console.log("Demo mode: User signed out")
    return
  }

  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error("Error signing out:", error)
    throw new Error("Failed to sign out")
  }
}

// Utility functions
const calculateProfileCompleteness = (profile: any): number => {
  const fields = ["name", "email", "location", "businessName"]
  const completedFields = fields.filter((field) => profile[field] && profile[field].trim() !== "")
  return Math.round((completedFields.length / fields.length) * 100)
}

export const getMockCurrentUser = () => mockCurrentUser

// Get users by role for admin
export const getUsersByRole = async (role: string): Promise<UserProfile[]> => {
  if (!hasValidConfig || !db) {
    return Object.values(mockUsers).filter((user) => user.role === role)
  }

  try {
    const q = query(collection(db, "users"), where("role", "==", role), where("isActive", "==", true))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => doc.data() as UserProfile)
  } catch (error) {
    console.error("Error getting users by role:", error)
    return []
  }
}

export const getPlatformStats = async () => {
  if (!hasValidConfig || !db) {
    const mockStats = {
      total_users: Object.keys(mockUsers).length,
      vendor_count: Object.values(mockUsers).filter((u) => u.role === "vendor").length,
      supplier_count: Object.values(mockUsers).filter((u) => u.role === "supplier").length,
      admin_count: Object.values(mockUsers).filter((u) => u.role === "admin").length,
    }
    return mockStats
  }

  try {
    const statsRef = doc(db, "platform_stats", "counters")
    const statsSnap = await getDoc(statsRef)

    if (statsSnap.exists()) {
      return statsSnap.data()
    }

    return {
      total_users: 0,
      vendor_count: 0,
      supplier_count: 0,
      admin_count: 0,
    }
  } catch (error) {
    console.error("Error getting platform stats:", error)
    return null
  }
}
