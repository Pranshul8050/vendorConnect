"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { useAuth } from "@/components/providers/auth-provider"
import { setupRecaptcha, sendOTP, verifyOTP, createUserProfile } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Phone, Shield, User, AlertCircle, CheckCircle } from "lucide-react"
import type { RecaptchaVerifier, ConfirmationResult } from "firebase/auth"
import { hasValidConfig } from "@/lib/firebase"

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp" | "role">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [selectedRole, setSelectedRole] = useState<"vendor" | "supplier" | "admin">("vendor")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  // Get role from URL params if provided
  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam && ["vendor", "supplier", "admin"].includes(roleParam)) {
      setSelectedRole(roleParam as "vendor" | "supplier" | "admin")
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      router.push(`/dashboard/${userProfile.role}`)
    }
  }, [user, userProfile, router])

  // Setup reCAPTCHA when component mounts
  useEffect(() => {
    if (step === "phone") {
      const timer = setTimeout(() => {
        try {
          const recaptchaVerifier = setupRecaptcha("recaptcha-container")
          setRecaptcha(recaptchaVerifier)
        } catch (error) {
          console.error("Error setting up reCAPTCHA:", error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [step])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number")
      return
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (
      cleanPhone.length !== 10 ||
      (!cleanPhone.startsWith("6") &&
        !cleanPhone.startsWith("7") &&
        !cleanPhone.startsWith("8") &&
        !cleanPhone.startsWith("9"))
    ) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setLoading(true)

    try {
      const confirmationResult = await sendOTP(phoneNumber, recaptcha)
      setConfirmation(confirmationResult)
      setStep("otp")
      toast({
        title: "OTP Sent Successfully!",
        description: hasValidConfig
          ? "Please check your phone for the verification code."
          : "Demo mode: Use OTP 123456 to continue",
      })
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      setError(error.message || "Failed to send OTP. Please try again.")

      // Reset reCAPTCHA on error
      if (recaptcha) {
        try {
          recaptcha.clear()
        } catch (e) {
          console.log("Error clearing reCAPTCHA:", e)
        }
      }

      // Reinitialize reCAPTCHA
      setTimeout(() => {
        try {
          const newRecaptcha = setupRecaptcha("recaptcha-container")
          setRecaptcha(newRecaptcha)
        } catch (e) {
          console.error("Error reinitializing reCAPTCHA:", e)
        }
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp.trim()) {
      setError("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      return
    }

    if (!confirmation) {
      setError("Session expired. Please request a new OTP.")
      setStep("phone")
      return
    }

    setLoading(true)

    try {
      const user = await verifyOTP(confirmation, otp)

      // Check if user already has a profile
      const existingProfile = await import("@/lib/auth").then((module) => module.getUserProfile(user.uid))

      if (existingProfile) {
        // User exists, redirect to dashboard
        router.push(`/dashboard/${existingProfile.role}`)
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
      } else {
        // New user, show role selection
        setStep("role")
        toast({
          title: "Phone verified successfully!",
          description: "Please select your role to continue.",
        })
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      setError(error.message || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelection = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("Session expired. Please login again.")
      setStep("phone")
      return
    }

    setLoading(true)

    try {
      await createUserProfile(user, selectedRole)
      router.push(`/dashboard/${selectedRole}`)
      toast({
        title: "Profile created successfully!",
        description: `Welcome to VendorConnect as a ${selectedRole}!`,
      })
    } catch (error: any) {
      console.error("Error creating profile:", error)
      setError(error.message || "Failed to create profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Demo Notice */}
          {!hasValidConfig && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Demo Mode:</strong> Use any phone number and OTP <strong>123456</strong> to test the
                application.
              </AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {step === "phone" && "Enter Phone Number"}
                {step === "otp" && "Verify OTP"}
                {step === "role" && "Select Your Role"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {step === "phone" && "We'll send you a verification code"}
                {step === "otp" && "Enter the 6-digit code sent to your phone"}
                {step === "role" && "Choose how you want to use VendorConnect"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === "phone" && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                          setPhoneNumber(value)
                          setError("")
                        }}
                        className="pl-10 text-lg"
                        disabled={loading}
                        autoComplete="tel"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter your 10-digit mobile number (without +91)</p>
                  </div>

                  <div id="recaptcha-container"></div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                    disabled={loading || phoneNumber.length !== 10}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-5 w-5" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                      Verification Code
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                          setOtp(value)
                          setError("")
                        }}
                        className="pl-10 text-center text-xl tracking-widest font-mono"
                        disabled={loading}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Code sent to +91{phoneNumber}
                      {!hasValidConfig && " (Demo: Use 123456)"}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Verify OTP
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setStep("phone")
                      setOtp("")
                      setError("")
                    }}
                    disabled={loading}
                  >
                    Change Phone Number
                  </Button>
                </form>
              )}

              {step === "role" && (
                <form onSubmit={handleRoleSelection} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">Select Your Role</Label>

                    <div className="space-y-3">
                      {[
                        {
                          value: "vendor",
                          title: "🛒 Vendor",
                          description: "I sell food/products and want to buy raw materials",
                          color: "green",
                        },
                        {
                          value: "supplier",
                          title: "🚚 Supplier",
                          description: "I supply raw materials to vendors",
                          color: "blue",
                        },
                        {
                          value: "admin",
                          title: "👨‍💼 Admin",
                          description: "I manage the platform and oversee operations",
                          color: "purple",
                        },
                      ].map((role) => (
                        <div
                          key={role.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedRole === role.value
                              ? `border-${role.color}-500 bg-${role.color}-50 shadow-md`
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                          onClick={() => {
                            setSelectedRole(role.value as any)
                            setError("")
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={selectedRole === role.value}
                              onChange={() => setSelectedRole(role.value as any)}
                              className={`text-${role.color}-500 focus:ring-${role.color}-500`}
                            />
                            <div className="flex-1">
                              <h3 className={`font-semibold text-${role.color}-700`}>{role.title}</h3>
                              <p className="text-sm text-gray-600">{role.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-5 w-5" />
                        Create Profile & Continue
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              <br />
              Your phone number is used only for authentication and order updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
