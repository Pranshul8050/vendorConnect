import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage, hasValidConfig } from "./firebase"

// Enhanced Types
export interface BuyingGroup {
  id: string
  name: string
  description?: string
  location: string
  address: string
  category: string
  ownerId: string
  ownerName: string
  ownerPhone: string
  members: string[]
  memberDetails: { [uid: string]: { name: string; phone: string; joinedAt: any; role: string } }
  maxMembers: number
  status: "active" | "inactive" | "full" | "archived"
  nextOrderDate?: any
  orderFrequency: "weekly" | "biweekly" | "monthly"
  minimumOrder: number
  totalOrders: number
  totalSavings: number
  averageSavings: number
  rules: string[]
  tags: string[]
  images: string[]
  coordinates?: { lat: number; lng: number }
  deliveryRadius: number
  preferredSuppliers: string[]
  paymentTerms: string
  createdAt: any
  updatedAt: any
  lastOrderAt?: any
  isVerified: boolean
  rating: number
  reviewCount: number
}

export interface Order {
  id: string
  orderNumber: string
  groupId: string
  groupName: string
  vendorId: string
  vendorName: string
  vendorPhone: string
  supplierId?: string
  supplierName?: string
  supplierPhone?: string
  items: OrderItem[]
  status:
    | "draft"
    | "pending"
    | "quoted"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "returned"
  priority: "low" | "medium" | "high" | "urgent"
  totalAmount: number
  quotedAmount?: number
  finalAmount?: number
  advanceAmount?: number
  balanceAmount?: number
  deliveryDate: any
  deliveryLocation: string
  deliveryAddress: string
  deliveryInstructions?: string
  notes?: string
  supplierNotes?: string
  internalNotes?: string
  paymentStatus: "pending" | "advance_paid" | "partially_paid" | "paid" | "refunded"
  paymentMethod?: "cash" | "upi" | "bank_transfer" | "card"
  invoiceNumber?: string
  invoiceUrl?: string
  packingSlipUrl?: string
  deliveryProofUrl?: string
  qualityRating?: number
  deliveryRating?: number
  supplierRating?: number
  feedback?: string
  createdAt: any
  updatedAt: any
  estimatedDeliveryTime?: any
  actualDeliveryTime?: any
  timeline: OrderTimeline[]
  attachments: string[]
  tags: string[]
  isUrgent: boolean
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: any
}

export interface OrderItem {
  id: string
  name: string
  description?: string
  category: string
  subcategory?: string
  brand?: string
  variety?: string
  quality: "premium" | "standard" | "economy"
  quantity: number
  unit: string
  estimatedPrice: number
  quotedPrice?: number
  finalPrice?: number
  discount?: number
  tax?: number
  specifications?: string
  images?: string[]
  alternatives?: string[]
  isSubstitutable: boolean
  minQuantity?: number
  maxQuantity?: number
  packingType?: string
  storageRequirements?: string
  shelfLife?: string
  origin?: string
  certifications?: string[]
}

export interface OrderTimeline {
  id: string
  status: string
  timestamp: any
  note?: string
  updatedBy: string
  updatedByName: string
  updatedByRole: string
  attachments?: string[]
  location?: string
  estimatedTime?: any
  actualTime?: any
  cost?: number
  isPublic: boolean
  notificationSent: boolean
}

export interface SurplusItem {
  id: string
  vendorId: string
  vendorName: string
  vendorPhone: string
  vendorLocation: string
  vendorAddress: string
  name: string
  description?: string
  category: string
  subcategory?: string
  brand?: string
  variety?: string
  quality: "premium" | "standard" | "economy"
  quantity: number
  unit: string
  originalQuantity: number
  remainingQuantity: number
  expiryDate: any
  manufacturingDate?: any
  batchNumber?: string
  price: number
  originalPrice: number
  discountPercentage: number
  minQuantity: number
  maxQuantity: number
  location: string
  address: string
  coordinates?: { lat: number; lng: number }
  pickupInstructions?: string
  images: string[]
  status: "available" | "reserved" | "partially_sold" | "sold" | "expired" | "withdrawn"
  interestedBuyers: string[]
  reservations: { buyerId: string; buyerName: string; quantity: number; reservedAt: any; expiresAt: any }[]
  tags: string[]
  storageConditions?: string
  packingType?: string
  certifications?: string[]
  reasonForSurplus?: string
  isNegotiable: boolean
  deliveryAvailable: boolean
  deliveryCharge?: number
  deliveryRadius?: number
  paymentMethods: string[]
  createdAt: any
  updatedAt: any
  expiresAt: any
  viewCount: number
  inquiryCount: number
  rating: number
  reviewCount: number
  isVerified: boolean
  isFeatured: boolean
  promotionEndDate?: any
}

export interface Notification {
  id: string
  userId: string
  userRole: string
  type: "order" | "group" | "surplus" | "payment" | "system" | "promotion" | "alert" | "reminder"
  category: "info" | "success" | "warning" | "error" | "urgent"
  title: string
  message: string
  shortMessage?: string
  data?: any
  actionUrl?: string
  actionText?: string
  imageUrl?: string
  read: boolean
  archived: boolean
  priority: "low" | "medium" | "high" | "urgent"
  channels: ("app" | "email" | "sms" | "whatsapp" | "push")[]
  scheduledFor?: any
  sentAt?: any
  readAt?: any
  createdAt: any
  expiresAt?: any
  tags: string[]
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface Supplier {
  id: string
  userId: string
  businessName: string
  ownerName: string
  phone: string
  email?: string
  address: string
  location: string
  coordinates?: { lat: number; lng: number }
  categories: string[]
  subcategories: string[]
  specializations: string[]
  serviceAreas: string[]
  deliveryRadius: number
  minimumOrderValue: number
  paymentTerms: string[]
  deliveryMethods: string[]
  operatingHours: { [day: string]: { open: string; close: string; isOpen: boolean } }
  certifications: string[]
  licenses: string[]
  gstNumber?: string
  panNumber?: string
  bankDetails?: {
    accountNumber: string
    ifscCode: string
    bankName: string
    accountHolderName: string
  }
  images: string[]
  documents: string[]
  description?: string
  website?: string
  socialMedia?: { platform: string; url: string }[]
  isVerified: boolean
  isActive: boolean
  isPremium: boolean
  rating: number
  reviewCount: number
  totalOrders: number
  completedOrders: number
  cancelledOrders: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
  qualityRating: number
  responseTime: number
  lastActiveAt: any
  joinedAt: any
  updatedAt: any
  tags: string[]
  preferredVendors: string[]
  blacklistedVendors: string[]
  priceList?: { [item: string]: { price: number; unit: string; lastUpdated: any } }
  inventory?: { [item: string]: { quantity: number; unit: string; lastUpdated: any } }
  promotions: {
    id: string
    title: string
    description: string
    discountType: "percentage" | "fixed"
    discountValue: number
    minOrderValue?: number
    validFrom: any
    validTo: any
    isActive: boolean
  }[]
}

export interface Analytics {
  userId: string
  userRole: string
  period: "daily" | "weekly" | "monthly" | "yearly"
  date: string
  metrics: {
    // Vendor metrics
    ordersPlaced?: number
    orderValue?: number
    savingsAchieved?: number
    groupsJoined?: number
    surplusShared?: number
    surplusEarnings?: number

    // Supplier metrics
    ordersReceived?: number
    ordersCompleted?: number
    revenue?: number
    newCustomers?: number
    repeatCustomers?: number
    averageOrderValue?: number

    // Platform metrics
    activeUsers?: number
    newRegistrations?: number
    totalTransactions?: number
    platformRevenue?: number

    // Engagement metrics
    appOpens?: number
    sessionDuration?: number
    pageViews?: number
    featureUsage?: { [feature: string]: number }
  }
  createdAt: any
}

// Mock data storage for demo mode
const mockGroups: BuyingGroup[] = []
const mockOrders: Order[] = []
const mockSurplus: SurplusItem[] = []
const mockNotifications: Notification[] = []
const mockSuppliers: Supplier[] = []
const mockAnalytics: Analytics[] = []

// Utility functions
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
const generateOrderNumber = () => `ORD${Date.now().toString().slice(-8)}`

// API Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500,
  ) {
    super(message)
    this.name = "APIError"
  }
}

// Groups API
export const createGroup = async (
  groupData: any,
  userId: string,
  userName: string,
  userPhone: string,
): Promise<string> => {
  const group: Omit<BuyingGroup, "id"> = {
    name: groupData.name,
    description: groupData.description || "",
    location: groupData.location,
    address: groupData.address || groupData.location,
    category: groupData.category,
    ownerId: userId,
    ownerName: userName,
    ownerPhone: userPhone,
    members: [userId],
    memberDetails: {
      [userId]: {
        name: userName,
        phone: userPhone,
        joinedAt: hasValidConfig ? serverTimestamp() : new Date(),
        role: "owner",
      },
    },
    maxMembers: groupData.maxMembers || 10,
    status: "active",
    orderFrequency: groupData.orderFrequency || "weekly",
    minimumOrder: groupData.minimumOrder || 500,
    totalOrders: 0,
    totalSavings: 0,
    averageSavings: 0,
    rules: groupData.rules || [
      "Minimum order value: ₹500",
      "Payment within 24 hours of delivery",
      "Quality issues to be reported within 2 hours",
      "Respect delivery timings",
    ],
    tags: groupData.tags || [],
    images: groupData.images || [],
    deliveryRadius: groupData.deliveryRadius || 5,
    preferredSuppliers: [],
    paymentTerms: groupData.paymentTerms || "Cash on Delivery",
    createdAt: hasValidConfig ? serverTimestamp() : new Date(),
    updatedAt: hasValidConfig ? serverTimestamp() : new Date(),
    isVerified: false,
    rating: 0,
    reviewCount: 0,
  }

  if (!hasValidConfig || !db) {
    const id = generateId()
    mockGroups.push({ ...group, id })
    return id
  }

  try {
    const docRef = await addDoc(collection(db, "groups"), group)
    return docRef.id
  } catch (error: any) {
    console.error("Error creating group:", error)
    throw new APIError("Failed to create group", "CREATE_GROUP_FAILED", 500)
  }
}

export const joinGroup = async (
  groupId: string,
  userId: string,
  userName: string,
  userPhone: string,
): Promise<void> => {
  if (!hasValidConfig || !db) {
    const group = mockGroups.find((g) => g.id === groupId)
    if (group && !group.members.includes(userId) && group.members.length < group.maxMembers) {
      group.members.push(userId)
      group.memberDetails[userId] = {
        name: userName,
        phone: userPhone,
        joinedAt: new Date(),
        role: "member",
      }
    }
    return
  }

  try {
    const groupRef = doc(db, "groups", groupId)
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      throw new APIError("Group not found", "GROUP_NOT_FOUND", 404)
    }

    const groupData = groupSnap.data() as BuyingGroup

    if (groupData.members.includes(userId)) {
      throw new APIError("Already a member of this group", "ALREADY_MEMBER", 400)
    }

    if (groupData.members.length >= groupData.maxMembers) {
      throw new APIError("Group is full", "GROUP_FULL", 400)
    }

    await updateDoc(groupRef, {
      members: [...groupData.members, userId],
      [`memberDetails.${userId}`]: {
        name: userName,
        phone: userPhone,
        joinedAt: serverTimestamp(),
        role: "member",
      },
      status: groupData.members.length + 1 >= groupData.maxMembers ? "full" : "active",
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error("Error joining group:", error)
    if (error instanceof APIError) throw error
    throw new APIError("Failed to join group", "JOIN_GROUP_FAILED", 500)
  }
}

export const getGroups = async (filters?: {
  location?: string
  category?: string
  status?: string
  userId?: string
  limit?: number
  offset?: number
}): Promise<{ groups: BuyingGroup[]; hasMore: boolean; total: number }> => {
  if (!hasValidConfig || !db) {
    let filtered = [...mockGroups]

    if (filters?.location) {
      filtered = filtered.filter((g) => g.location.toLowerCase().includes(filters.location!.toLowerCase()))
    }
    if (filters?.category) {
      filtered = filtered.filter((g) => g.category === filters.category)
    }
    if (filters?.status) {
      filtered = filtered.filter((g) => g.status === filters.status)
    }
    if (filters?.userId) {
      filtered = filtered.filter((g) => g.members.includes(filters.userId!))
    }

    const start = filters?.offset || 0
    const limit = filters?.limit || 20
    const paginatedGroups = filtered.slice(start, start + limit)

    return {
      groups: paginatedGroups,
      hasMore: start + limit < filtered.length,
      total: filtered.length,
    }
  }

  try {
    let q = query(collection(db, "groups"))

    if (filters?.location) {
      q = query(q, where("location", ">=", filters.location), where("location", "<=", filters.location + "\uf8ff"))
    }
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status))
    }
    if (filters?.userId) {
      q = query(q, where("members", "array-contains", filters.userId))
    }

    q = query(q, orderBy("createdAt", "desc"), limit(filters?.limit || 20))

    const querySnapshot = await getDocs(q)
    const groups = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BuyingGroup)

    return {
      groups,
      hasMore: querySnapshot.docs.length === (filters?.limit || 20),
      total: groups.length, // This would need a separate count query in production
    }
  } catch (error: any) {
    console.error("Error getting groups:", error)
    throw new APIError("Failed to fetch groups", "FETCH_GROUPS_FAILED", 500)
  }
}

// Orders API
export const createOrder = async (
  orderData: any,
  userId: string,
  userName: string,
  userPhone: string,
): Promise<string> => {
  const order: Omit<Order, "id"> = {
    orderNumber: generateOrderNumber(),
    groupId: orderData.groupId,
    groupName: orderData.groupName,
    vendorId: userId,
    vendorName: userName,
    vendorPhone: userPhone,
    items: orderData.items.map((item: any, index: number) => ({
      id: `item_${index + 1}`,
      ...item,
      quality: item.quality || "standard",
      isSubstitutable: item.isSubstitutable !== false,
    })),
    status: "draft",
    priority: orderData.priority || "medium",
    totalAmount: orderData.items.reduce((sum: number, item: any) => sum + item.estimatedPrice * item.quantity, 0),
    deliveryDate: orderData.deliveryDate,
    deliveryLocation: orderData.deliveryLocation,
    deliveryAddress: orderData.deliveryAddress || orderData.deliveryLocation,
    deliveryInstructions: orderData.deliveryInstructions || "",
    notes: orderData.notes || "",
    paymentStatus: "pending",
    isUrgent: orderData.isUrgent || false,
    requiresApproval: orderData.requiresApproval || false,
    createdAt: hasValidConfig ? serverTimestamp() : new Date(),
    updatedAt: hasValidConfig ? serverTimestamp() : new Date(),
    timeline: [
      {
        id: "timeline_1",
        status: "draft",
        timestamp: hasValidConfig ? serverTimestamp() : new Date(),
        note: "Order created",
        updatedBy: userId,
        updatedByName: userName,
        updatedByRole: "vendor",
        isPublic: true,
        notificationSent: false,
      },
    ],
    attachments: [],
    tags: orderData.tags || [],
  }

  if (!hasValidConfig || !db) {
    const id = generateId()
    mockOrders.push({ ...order, id })
    return id
  }

  try {
    const docRef = await addDoc(collection(db, "orders"), order)
    return docRef.id
  } catch (error: any) {
    console.error("Error creating order:", error)
    throw new APIError("Failed to create order", "CREATE_ORDER_FAILED", 500)
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  userId: string,
  userName: string,
  userRole: string,
  options?: {
    note?: string
    quotedAmount?: number
    attachments?: string[]
    location?: string
    estimatedTime?: any
    isPublic?: boolean
  },
): Promise<void> => {
  if (!hasValidConfig || !db) {
    const order = mockOrders.find((o) => o.id === orderId)
    if (order) {
      order.status = status as any
      order.updatedAt = new Date()
      if (options?.quotedAmount) order.quotedAmount = options.quotedAmount

      order.timeline.push({
        id: `timeline_${order.timeline.length + 1}`,
        status,
        timestamp: new Date(),
        note: options?.note,
        updatedBy: userId,
        updatedByName: userName,
        updatedByRole: userRole,
        attachments: options?.attachments,
        location: options?.location,
        estimatedTime: options?.estimatedTime,
        isPublic: options?.isPublic !== false,
        notificationSent: false,
      })
    }
    return
  }

  try {
    const orderRef = doc(db, "orders", orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      throw new APIError("Order not found", "ORDER_NOT_FOUND", 404)
    }

    const orderData = orderSnap.data() as Order
    const newTimelineEntry = {
      id: `timeline_${orderData.timeline.length + 1}`,
      status,
      timestamp: serverTimestamp(),
      note: options?.note,
      updatedBy: userId,
      updatedByName: userName,
      updatedByRole: userRole,
      attachments: options?.attachments || [],
      location: options?.location,
      estimatedTime: options?.estimatedTime,
      isPublic: options?.isPublic !== false,
      notificationSent: false,
    }

    const updateData: any = {
      status,
      timeline: [...orderData.timeline, newTimelineEntry],
      updatedAt: serverTimestamp(),
    }

    if (options?.quotedAmount) {
      updateData.quotedAmount = options.quotedAmount
    }

    await updateDoc(orderRef, updateData)

    // Create notification for relevant parties
    if (status === "quoted" && orderData.vendorId !== userId) {
      await createNotification({
        userId: orderData.vendorId,
        userRole: "vendor",
        type: "order",
        category: "info",
        title: "Order Quote Received",
        message: `Your order #${orderData.orderNumber} has been quoted at ₹${options?.quotedAmount}`,
        data: { orderId, quotedAmount: options?.quotedAmount },
        priority: "medium",
        channels: ["app", "whatsapp"],
      })
    }
  } catch (error: any) {
    console.error("Error updating order status:", error)
    if (error instanceof APIError) throw error
    throw new APIError("Failed to update order", "UPDATE_ORDER_FAILED", 500)
  }
}

export const getOrders = async (filters?: {
  userId?: string
  role?: string
  status?: string
  groupId?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}): Promise<{ orders: Order[]; hasMore: boolean; total: number }> => {
  if (!hasValidConfig || !db) {
    let filtered = [...mockOrders]

    if (filters?.userId && filters?.role === "vendor") {
      filtered = filtered.filter((o) => o.vendorId === filters.userId)
    }
    if (filters?.userId && filters?.role === "supplier") {
      filtered = filtered.filter((o) => o.supplierId === filters.userId)
    }
    if (filters?.status) {
      filtered = filtered.filter((o) => o.status === filters.status)
    }
    if (filters?.groupId) {
      filtered = filtered.filter((o) => o.groupId === filters.groupId)
    }

    const start = filters?.offset || 0
    const limit = filters?.limit || 20
    const paginatedOrders = filtered.slice(start, start + limit)

    return {
      orders: paginatedOrders,
      hasMore: start + limit < filtered.length,
      total: filtered.length,
    }
  }

  try {
    let q = query(collection(db, "orders"))

    if (filters?.userId && filters?.role === "vendor") {
      q = query(q, where("vendorId", "==", filters.userId))
    }
    if (filters?.userId && filters?.role === "supplier") {
      q = query(q, where("supplierId", "==", filters.userId))
    }
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status))
    }
    if (filters?.groupId) {
      q = query(q, where("groupId", "==", filters.groupId))
    }

    q = query(q, orderBy("createdAt", "desc"), limit(filters?.limit || 20))

    const querySnapshot = await getDocs(q)
    const orders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)

    return {
      orders,
      hasMore: querySnapshot.docs.length === (filters?.limit || 20),
      total: orders.length,
    }
  } catch (error: any) {
    console.error("Error getting orders:", error)
    throw new APIError("Failed to fetch orders", "FETCH_ORDERS_FAILED", 500)
  }
}

// Surplus API
export const createSurplusItem = async (
  itemData: any,
  userId: string,
  userName: string,
  userPhone: string,
  userLocation: string,
): Promise<string> => {
  const item: Omit<SurplusItem, "id"> = {
    vendorId: userId,
    vendorName: userName,
    vendorPhone: userPhone,
    vendorLocation: userLocation,
    vendorAddress: itemData.vendorAddress || userLocation,
    name: itemData.name,
    description: itemData.description || "",
    category: itemData.category,
    subcategory: itemData.subcategory || "",
    brand: itemData.brand || "",
    variety: itemData.variety || "",
    quality: itemData.quality || "standard",
    quantity: itemData.quantity,
    unit: itemData.unit,
    originalQuantity: itemData.quantity,
    remainingQuantity: itemData.quantity,
    expiryDate: itemData.expiryDate,
    manufacturingDate: itemData.manufacturingDate,
    batchNumber: itemData.batchNumber || "",
    price: itemData.price,
    originalPrice: itemData.originalPrice || itemData.price,
    discountPercentage: itemData.originalPrice
      ? Math.round(((itemData.originalPrice - itemData.price) / itemData.originalPrice) * 100)
      : 0,
    minQuantity: itemData.minQuantity || 1,
    maxQuantity: itemData.maxQuantity || itemData.quantity,
    location: itemData.location,
    address: itemData.address || itemData.location,
    pickupInstructions: itemData.pickupInstructions || "",
    images: itemData.images || [],
    status: "available",
    interestedBuyers: [],
    reservations: [],
    tags: itemData.tags || [],
    storageConditions: itemData.storageConditions || "",
    packingType: itemData.packingType || "",
    certifications: itemData.certifications || [],
    reasonForSurplus: itemData.reasonForSurplus || "",
    isNegotiable: itemData.isNegotiable !== false,
    deliveryAvailable: itemData.deliveryAvailable || false,
    deliveryCharge: itemData.deliveryCharge || 0,
    deliveryRadius: itemData.deliveryRadius || 5,
    paymentMethods: itemData.paymentMethods || ["cash", "upi"],
    createdAt: hasValidConfig ? serverTimestamp() : new Date(),
    updatedAt: hasValidConfig ? serverTimestamp() : new Date(),
    expiresAt: itemData.expiryDate,
    viewCount: 0,
    inquiryCount: 0,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    isFeatured: false,
  }

  if (!hasValidConfig || !db) {
    const id = generateId()
    mockSurplus.push({ ...item, id })
    return id
  }

  try {
    const docRef = await addDoc(collection(db, "surplus_items"), item)
    return docRef.id
  } catch (error: any) {
    console.error("Error creating surplus item:", error)
    throw new APIError("Failed to create surplus item", "CREATE_SURPLUS_FAILED", 500)
  }
}

export const getSurplusItems = async (filters?: {
  location?: string
  category?: string
  status?: string
  vendorId?: string
  priceRange?: { min: number; max: number }
  expiryDays?: number
  limit?: number
  offset?: number
}): Promise<{ items: SurplusItem[]; hasMore: boolean; total: number }> => {
  if (!hasValidConfig || !db) {
    let filtered = [...mockSurplus]

    if (filters?.location) {
      filtered = filtered.filter((s) => s.location.toLowerCase().includes(filters.location!.toLowerCase()))
    }
    if (filters?.category) {
      filtered = filtered.filter((s) => s.category === filters.category)
    }
    if (filters?.status) {
      filtered = filtered.filter((s) => s.status === filters.status)
    }
    if (filters?.vendorId) {
      filtered = filtered.filter((s) => s.vendorId === filters.vendorId)
    }

    const start = filters?.offset || 0
    const limit = filters?.limit || 20
    const paginatedItems = filtered.slice(start, start + limit)

    return {
      items: paginatedItems,
      hasMore: start + limit < filtered.length,
      total: filtered.length,
    }
  }

  try {
    let q = query(collection(db, "surplus_items"))

    if (filters?.location) {
      q = query(q, where("location", ">=", filters.location), where("location", "<=", filters.location + "\uf8ff"))
    }
    if (filters?.category) {
      q = query(q, where("category", "==", filters.category))
    }
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status))
    }
    if (filters?.vendorId) {
      q = query(q, where("vendorId", "==", filters.vendorId))
    }

    q = query(q, orderBy("createdAt", "desc"), limit(filters?.limit || 20))

    const querySnapshot = await getDocs(q)
    const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SurplusItem)

    return {
      items,
      hasMore: querySnapshot.docs.length === (filters?.limit || 20),
      total: items.length,
    }
  } catch (error: any) {
    console.error("Error getting surplus items:", error)
    throw new APIError("Failed to fetch surplus items", "FETCH_SURPLUS_FAILED", 500)
  }
}

// Notifications API
export const createNotification = async (
  notificationData: Omit<Notification, "id" | "read" | "archived" | "createdAt">,
): Promise<void> => {
  const notification: Omit<Notification, "id"> = {
    ...notificationData,
    read: false,
    archived: false,
    createdAt: hasValidConfig ? serverTimestamp() : new Date(),
  }

  if (!hasValidConfig || !db) {
    mockNotifications.push({ ...notification, id: generateId() })
    return
  }

  try {
    await addDoc(collection(db, "notifications"), notification)
  } catch (error: any) {
    console.error("Error creating notification:", error)
    throw new APIError("Failed to create notification", "CREATE_NOTIFICATION_FAILED", 500)
  }
}

export const getUserNotifications = async (
  userId: string,
  filters?: {
    type?: string
    read?: boolean
    limit?: number
    offset?: number
  },
): Promise<{ notifications: Notification[]; hasMore: boolean; unreadCount: number }> => {
  if (!hasValidConfig || !db) {
    let filtered = mockNotifications.filter((n) => n.userId === userId)

    if (filters?.type) {
      filtered = filtered.filter((n) => n.type === filters.type)
    }
    if (filters?.read !== undefined) {
      filtered = filtered.filter((n) => n.read === filters.read)
    }

    const unreadCount = mockNotifications.filter((n) => n.userId === userId && !n.read).length
    const start = filters?.offset || 0
    const limit = filters?.limit || 50
    const paginatedNotifications = filtered.slice(start, start + limit)

    return {
      notifications: paginatedNotifications,
      hasMore: start + limit < filtered.length,
      unreadCount,
    }
  }

  try {
    let q = query(collection(db, "notifications"), where("userId", "==", userId))

    if (filters?.type) {
      q = query(q, where("type", "==", filters.type))
    }
    if (filters?.read !== undefined) {
      q = query(q, where("read", "==", filters.read))
    }

    q = query(q, orderBy("createdAt", "desc"), limit(filters?.limit || 50))

    const querySnapshot = await getDocs(q)
    const notifications = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)

    // Get unread count
    const unreadQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
    )
    const unreadSnapshot = await getDocs(unreadQuery)
    const unreadCount = unreadSnapshot.size

    return {
      notifications,
      hasMore: querySnapshot.docs.length === (filters?.limit || 50),
      unreadCount,
    }
  } catch (error: any) {
    console.error("Error getting notifications:", error)
    throw new APIError("Failed to fetch notifications", "FETCH_NOTIFICATIONS_FAILED", 500)
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (!hasValidConfig || !db) {
    const notification = mockNotifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = new Date()
    }
    return
  }

  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error("Error marking notification as read:", error)
    throw new APIError("Failed to mark notification as read", "MARK_NOTIFICATION_READ_FAILED", 500)
  }
}

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  if (!hasValidConfig || !db) {
    mockNotifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true
        n.readAt = new Date()
      }
    })
    return
  }

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))
    const querySnapshot = await getDocs(q)

    const batch = writeBatch(db)
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp(),
      })
    })

    await batch.commit()
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error)
    throw new APIError("Failed to mark all notifications as read", "MARK_ALL_NOTIFICATIONS_READ_FAILED", 500)
  }
}

// Suppliers API
export const getSuppliers = async (filters?: {
  location?: string
  category?: string
  rating?: number
  isVerified?: boolean
  limit?: number
  offset?: number
}): Promise<{ suppliers: Supplier[]; hasMore: boolean; total: number }> => {
  if (!hasValidConfig || !db) {
    let filtered = [...mockSuppliers]

    if (filters?.location) {
      filtered = filtered.filter((s) => s.location.toLowerCase().includes(filters.location!.toLowerCase()))
    }
    if (filters?.category) {
      filtered = filtered.filter((s) => s.categories.includes(filters.category!))
    }
    if (filters?.rating) {
      filtered = filtered.filter((s) => s.rating >= filters.rating!)
    }
    if (filters?.isVerified !== undefined) {
      filtered = filtered.filter((s) => s.isVerified === filters.isVerified)
    }

    const start = filters?.offset || 0
    const limit = filters?.limit || 20
    const paginatedSuppliers = filtered.slice(start, start + limit)

    return {
      suppliers: paginatedSuppliers,
      hasMore: start + limit < filtered.length,
      total: filtered.length,
    }
  }

  try {
    let q = query(collection(db, "suppliers"))

    if (filters?.location) {
      q = query(q, where("location", ">=", filters.location), where("location", "<=", filters.location + "\uf8ff"))
    }
    if (filters?.category) {
      q = query(q, where("categories", "array-contains", filters.category))
    }
    if (filters?.rating) {
      q = query(q, where("rating", ">=", filters.rating))
    }
    if (filters?.isVerified !== undefined) {
      q = query(q, where("isVerified", "==", filters.isVerified))
    }

    q = query(q, orderBy("rating", "desc"), limit(filters?.limit || 20))

    const querySnapshot = await getDocs(q)
    const suppliers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Supplier)

    return {
      suppliers,
      hasMore: querySnapshot.docs.length === (filters?.limit || 20),
      total: suppliers.length,
    }
  } catch (error: any) {
    console.error("Error getting suppliers:", error)
    throw new APIError("Failed to fetch suppliers", "FETCH_SUPPLIERS_FAILED", 500)
  }
}

// File upload API
export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!hasValidConfig || !storage) {
    // Return mock URL for demo
    return `https://demo-storage.com/${path}/${file.name}`
  }

  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error: any) {
    console.error("Error uploading file:", error)
    throw new APIError("Failed to upload file", "FILE_UPLOAD_FAILED", 500)
  }
}

export const deleteFile = async (url: string): Promise<void> => {
  if (!hasValidConfig || !storage) {
    console.log("Demo mode: File deletion simulated")
    return
  }

  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch (error: any) {
    console.error("Error deleting file:", error)
    throw new APIError("Failed to delete file", "FILE_DELETE_FAILED", 500)
  }
}

// Real-time subscriptions
export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
): (() => void) => {
  if (!hasValidConfig || !db) {
    // Mock subscription for demo
    const interval = setInterval(() => {
      const userNotifications = mockNotifications.filter((n) => n.userId === userId && !n.read)
      callback(userNotifications)
    }, 5000)

    return () => clearInterval(interval)
  }

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
    limit(10),
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)
    callback(notifications)
  })
}

export const subscribeToOrderUpdates = (orderId: string, callback: (order: Order | null) => void): (() => void) => {
  if (!hasValidConfig || !db) {
    // Mock subscription for demo
    const interval = setInterval(() => {
      const order = mockOrders.find((o) => o.id === orderId)
      callback(order || null)
    }, 3000)

    return () => clearInterval(interval)
  }

  const orderRef = doc(db, "orders", orderId)
  return onSnapshot(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Order)
    } else {
      callback(null)
    }
  })
}

// AI Prediction API
export const getAIPredictions = async (
  businessType: string,
  location: string,
  additionalContext?: {
    previousOrders?: any[]
    seasonality?: string
    budget?: number
    preferences?: string[]
  },
): Promise<any[]> => {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const baseItems = {
    "street-food": [
      {
        name: "Onions",
        category: "vegetables",
        predictedQuantity: "15-20 kg",
        reason: "High demand expected due to upcoming festival season and weather conditions",
        confidence: 92,
        priceRange: "₹25-30/kg",
        emoji: "🧅",
        trend: "increasing",
        alternatives: ["Shallots", "Spring Onions"],
        suppliers: ["Fresh Mart", "Veggie Direct"],
        qualityTips: "Look for firm, dry outer skin without soft spots",
        storageAdvice: "Store in cool, dry place. Avoid refrigeration.",
        seasonalNote: "Peak season pricing, good quality available",
      },
      {
        name: "Tomatoes",
        category: "vegetables",
        predictedQuantity: "10-12 kg",
        reason: "Weather forecast shows good conditions, stable prices expected",
        confidence: 88,
        priceRange: "₹35-40/kg",
        emoji: "🍅",
        trend: "stable",
        alternatives: ["Cherry Tomatoes", "Roma Tomatoes"],
        suppliers: ["Garden Fresh", "Farm Direct"],
        qualityTips: "Choose firm tomatoes with good color, avoid overripe ones",
        storageAdvice: "Store at room temperature, refrigerate only when fully ripe",
        seasonalNote: "Good quality available, prices stable this week",
      },
      {
        name: "Green Chilies",
        category: "vegetables",
        predictedQuantity: "2-3 kg",
        reason: "Consistent demand, monsoon season approaching may affect supply",
        confidence: 85,
        priceRange: "₹80-100/kg",
        emoji: "🌶️",
        trend: "increasing",
        alternatives: ["Red Chilies", "Jalapeños"],
        suppliers: ["Spice Garden", "Hot & Fresh"],
        qualityTips: "Select bright green, firm chilies without wrinkles",
        storageAdvice: "Wrap in paper towel and refrigerate for longer freshness",
        seasonalNote: "Pre-monsoon stocking recommended",
      },
      {
        name: "Cooking Oil",
        category: "oil",
        predictedQuantity: "5 liters",
        reason: "Monthly requirement, bulk buying saves 15%, prices expected to rise",
        confidence: 95,
        priceRange: "₹120-130/L",
        emoji: "🛢️",
        trend: "increasing",
        alternatives: ["Sunflower Oil", "Mustard Oil"],
        suppliers: ["Oil Depot", "Bulk Oils"],
        qualityTips: "Check manufacturing date and packaging integrity",
        storageAdvice: "Store in cool, dark place away from heat sources",
        seasonalNote: "Stock up now before price increase next month",
      },
    ],
    tiffin: [
      {
        name: "Basmati Rice",
        category: "grains",
        predictedQuantity: "25 kg",
        reason: "High demand for quality rice, harvest season offers good prices",
        confidence: 94,
        priceRange: "₹80-90/kg",
        emoji: "🍚",
        trend: "decreasing",
        alternatives: ["Sona Masoori", "Jasmine Rice"],
        suppliers: ["Rice Mills Direct", "Grain Traders"],
        qualityTips: "Look for long grains, minimal broken rice",
        storageAdvice: "Store in airtight containers to prevent pest infestation",
        seasonalNote: "Harvest season - best time to buy in bulk",
      },
      {
        name: "Dal (Mixed)",
        category: "pulses",
        predictedQuantity: "10 kg",
        reason: "Protein staple, prices stable, good quality available",
        confidence: 90,
        priceRange: "₹100-120/kg",
        emoji: "🫘",
        trend: "stable",
        alternatives: ["Moong Dal", "Chana Dal", "Masoor Dal"],
        suppliers: ["Pulse Market", "Dal Direct"],
        qualityTips: "Check for uniform size, no insect damage",
        storageAdvice: "Store in dry containers with bay leaves to prevent insects",
        seasonalNote: "Good quality available from recent harvest",
      },
    ],
    restaurant: [
      {
        name: "Chicken (Fresh)",
        category: "meat",
        predictedQuantity: "20 kg",
        reason: "Weekend demand spike expected, fresh supply available",
        confidence: 87,
        priceRange: "₹180-200/kg",
        emoji: "🐔",
        trend: "stable",
        alternatives: ["Mutton", "Fish"],
        suppliers: ["Fresh Meat Co", "Poultry Direct"],
        qualityTips: "Ensure freshness, check color and smell",
        storageAdvice: "Use within 24 hours or freeze immediately",
        seasonalNote: "Good supply this week, quality assured",
      },
    ],
  }

  const locationFactors = {
    delhi: { priceFactor: 1.1, availabilityFactor: 1.2 },
    mumbai: { priceFactor: 1.15, availabilityFactor: 1.1 },
    bangalore: { priceFactor: 1.05, availabilityFactor: 1.0 },
    chennai: { priceFactor: 1.0, availabilityFactor: 0.9 },
    kolkata: { priceFactor: 0.95, availabilityFactor: 0.95 },
  }

  let predictions = baseItems[businessType as keyof typeof baseItems] || baseItems["street-food"]

  // Apply location-based adjustments
  const locationKey = location.toLowerCase().split(",")[0].trim()
  const locationFactor = locationFactors[locationKey as keyof typeof locationFactors] || {
    priceFactor: 1.0,
    availabilityFactor: 1.0,
  }

  predictions = predictions.map((item) => ({
    ...item,
    priceRange: item.priceRange.replace(/₹(\d+)-(\d+)/, (match, min, max) => {
      const adjustedMin = Math.round(Number.parseInt(min) * locationFactor.priceFactor)
      const adjustedMax = Math.round(Number.parseInt(max) * locationFactor.priceFactor)
      return `₹${adjustedMin}-${adjustedMax}`
    }),
    confidence: Math.min(95, Math.round(item.confidence * locationFactor.availabilityFactor)),
  }))

  // Add market insights
  const marketInsights = {
    overallTrend: "stable",
    priceVolatility: "low",
    supplyStatus: "good",
    demandForecast: "increasing",
    weatherImpact: "minimal",
    festivalImpact: "moderate",
    recommendations: [
      "Stock up on non-perishables before price increases",
      "Consider bulk buying for frequently used items",
      "Monitor weather forecasts for supply disruptions",
      "Build relationships with multiple suppliers",
    ],
    alerts: [
      "Onion prices may increase by 10-15% next week",
      "Good time to buy oil in bulk",
      "Festival season approaching - plan inventory accordingly",
    ],
  }

  return {
    predictions,
    insights: marketInsights,
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    confidence: 89,
    dataSource: "Market Analysis + Weather Data + Historical Trends",
  }
}

// Analytics API
export const recordAnalytics = async (userId: string, userRole: string, event: string, data?: any): Promise<void> => {
  if (!hasValidConfig || !db) {
    console.log(`Analytics recorded: ${event}`, { userId, userRole, data })
    return
  }

  try {
    await addDoc(collection(db, "analytics_events"), {
      userId,
      userRole,
      event,
      data: data || {},
      timestamp: serverTimestamp(),
      sessionId: `session_${Date.now()}`,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      platform: typeof window !== "undefined" ? window.navigator.platform : "",
    })
  } catch (error: any) {
    console.error("Error recording analytics:", error)
    // Don't throw error for analytics failures
  }
}

export const getDashboardAnalytics = async (
  userId: string,
  userRole: string,
  period: "week" | "month" | "quarter" | "year" = "month",
): Promise<any> => {
  // Mock analytics data
  const mockData = {
    vendor: {
      totalOrders: 45,
      totalSavings: 12500,
      averageOrderValue: 850,
      groupsJoined: 8,
      surplusShared: 15,
      surplusEarnings: 2300,
      topCategories: [
        { name: "Vegetables", value: 35, savings: 4200 },
        { name: "Spices", value: 25, savings: 3100 },
        { name: "Oil", value: 20, savings: 2800 },
        { name: "Grains", value: 15, savings: 1900 },
        { name: "Others", value: 5, savings: 500 },
      ],
      monthlyTrend: [
        { month: "Jan", orders: 12, savings: 2800 },
        { month: "Feb", orders: 15, savings: 3200 },
        { month: "Mar", orders: 18, savings: 3800 },
        { month: "Apr", orders: 22, savings: 4500 },
        { month: "May", orders: 25, savings: 5200 },
        { month: "Jun", orders: 28, savings: 5800 },
      ],
      recentActivity: [
        { date: "2024-01-15", action: "Joined Karol Bagh Vegetable Group", type: "group" },
        { date: "2024-01-14", action: "Placed order for ₹1,200", type: "order" },
        { date: "2024-01-13", action: "Shared 5kg surplus tomatoes", type: "surplus" },
        { date: "2024-01-12", action: "Received AI prediction report", type: "ai" },
      ],
    },
    supplier: {
      totalOrders: 156,
      totalRevenue: 245000,
      averageOrderValue: 1570,
      completionRate: 94,
      customerSatisfaction: 4.6,
      responseTime: 2.3,
      topProducts: [
        { name: "Fresh Vegetables", orders: 45, revenue: 67500 },
        { name: "Spices & Masalas", orders: 38, revenue: 52000 },
        { name: "Cooking Oil", orders: 32, revenue: 48000 },
        { name: "Rice & Grains", orders: 28, revenue: 42000 },
        { name: "Dairy Products", orders: 13, revenue: 35500 },
      ],
      monthlyRevenue: [
        { month: "Jan", revenue: 35000, orders: 22 },
        { month: "Feb", revenue: 38000, orders: 25 },
        { month: "Mar", revenue: 42000, orders: 28 },
        { month: "Apr", revenue: 45000, orders: 32 },
        { month: "May", revenue: 48000, orders: 35 },
        { month: "Jun", revenue: 52000, orders: 38 },
      ],
      recentOrders: [
        { id: "ORD001", vendor: "Raj's Chaat", amount: 1200, status: "delivered", date: "2024-01-15" },
        { id: "ORD002", vendor: "Sunita's Tiffin", amount: 2800, status: "in_transit", date: "2024-01-15" },
        { id: "ORD003", vendor: "Amit's Juice", amount: 950, status: "confirmed", date: "2024-01-14" },
        { id: "ORD004", vendor: "Delhi Street Food", amount: 1650, status: "delivered", date: "2024-01-14" },
      ],
    },
    admin: {
      totalUsers: 2847,
      totalVendors: 1923,
      totalSuppliers: 456,
      totalOrders: 8934,
      totalRevenue: 1245000,
      platformGrowth: 23.5,
      userGrowth: [
        { month: "Jan", vendors: 1200, suppliers: 280, total: 1480 },
        { month: "Feb", vendors: 1350, suppliers: 310, total: 1660 },
        { month: "Mar", vendors: 1520, suppliers: 340, total: 1860 },
        { month: "Apr", vendors: 1680, suppliers: 380, total: 2060 },
        { month: "May", vendors: 1820, suppliers: 420, total: 2240 },
        { month: "Jun", vendors: 1923, suppliers: 456, total: 2379 },
      ],
      topLocations: [
        { city: "Delhi", users: 856, orders: 2340 },
        { city: "Mumbai", users: 743, orders: 2100 },
        { city: "Bangalore", users: 512, orders: 1450 },
        { city: "Chennai", users: 398, orders: 1120 },
        { city: "Kolkata", users: 338, orders: 924 },
      ],
      recentActivity: [
        { date: "2024-01-15", event: "New supplier verified: Fresh Mart Delhi", type: "verification" },
        { date: "2024-01-15", event: "Order dispute resolved: ORD12345", type: "support" },
        { date: "2024-01-14", event: "Platform maintenance completed", type: "system" },
        { date: "2024-01-14", event: "New feature launched: AI Predictions", type: "feature" },
      ],
    },
  }

  return mockData[userRole as keyof typeof mockData] || mockData.vendor
}

// Payment integration (mock)
export const initiatePayment = async (
  orderId: string,
  amount: number,
  paymentMethod = "upi",
): Promise<{ paymentId: string; status: string; paymentUrl?: string }> => {
  // Simulate payment processing
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Mock different payment outcomes
  const outcomes = ["success", "success", "success", "pending", "failed"] // 60% success rate
  const status = outcomes[Math.floor(Math.random() * outcomes.length)]

  return {
    paymentId,
    status,
    paymentUrl: status === "pending" ? `https://payments.vendorconnect.com/pay/${paymentId}` : undefined,
  }
}

export const verifyPayment = async (
  paymentId: string,
): Promise<{ status: string; amount?: number; orderId?: string }> => {
  // Simulate payment verification
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    status: "success",
    amount: 1250,
    orderId: "ORD12345",
  }
}

// WhatsApp integration (mock)
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string,
  templateName?: string,
  templateParams?: any[],
): Promise<{ messageId: string; status: string }> => {
  // Simulate WhatsApp API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  console.log(`WhatsApp to ${phoneNumber}: ${message}`)

  return {
    messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: "sent",
  }
}

export const sendBulkWhatsAppMessages = async (
  messages: { phoneNumber: string; message: string; templateName?: string; templateParams?: any[] }[],
): Promise<{ sent: number; failed: number; results: any[] }> => {
  // Simulate bulk WhatsApp sending
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const results = messages.map((msg, index) => ({
    phoneNumber: msg.phoneNumber,
    messageId: `wa_bulk_${Date.now()}_${index}`,
    status: Math.random() > 0.1 ? "sent" : "failed", // 90% success rate
  }))

  const sent = results.filter((r) => r.status === "sent").length
  const failed = results.filter((r) => r.status === "failed").length

  return { sent, failed, results }
}

// Location and mapping utilities
export const getLocationSuggestions = async (query: string): Promise<string[]> => {
  // Mock location suggestions
  const locations = [
    "Karol Bagh, Delhi",
    "Connaught Place, Delhi",
    "Lajpat Nagar, Delhi",
    "Chandni Chowk, Delhi",
    "Sarojini Nagar, Delhi",
    "Khan Market, Delhi",
    "Nehru Place, Delhi",
    "Rajouri Garden, Delhi",
    "Janakpuri, Delhi",
    "Dwarka, Delhi",
  ]

  return locations.filter((loc) => loc.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
}

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Export all functions
export { generateId, generateOrderNumber }
