"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useAuth } from "@/components/providers/auth-provider"
import { getDashboardAnalytics, recordAnalytics } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Brain,
  ShoppingCart,
  MessageCircle,
  Recycle,
  Plus,
  Clock,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function VendorDashboard() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "vendor")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  useEffect(() => {
    if (user && userProfile?.role === "vendor") {
      loadDashboardData()
      recordAnalytics(user.uid, "vendor", "dashboard_view")
    }
  }, [user, userProfile])

  const loadDashboardData = async () => {
    try {
      setLoadingAnalytics(true)
      const data = await getDashboardAnalytics(user!.uid, "vendor", "month")
      setAnalytics(data)

      // Mock notifications
      setNotifications([
        {
          id: "1",
          title: "Order Quote Received",
          message: "Your vegetable order has been quoted at ₹1,250",
          type: "order",
          time: "2 hours ago",
          read: false,
        },
        {
          id: "2",
          title: "New Group Member",
          message: "Amit joined your Karol Bagh Vegetable Group",
          type: "group",
          time: "5 hours ago",
          read: false,
        },
        {
          id: "3",
          title: "Surplus Item Sold",
          message: "Your 3kg tomatoes have been sold for ₹180",
          type: "surplus",
          time: "1 day ago",
          read: true,
        },
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error loading dashboard",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingAnalytics(false)
    }
  }

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || userProfile?.role !== "vendor") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userProfile.name || "Vendor"}</h1>
              <p className="text-gray-600 mt-1">Manage your orders, groups, and surplus inventory</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Quick Order
              </Button>
            </div>
          </div>

          {/* Profile Completeness */}
          {userProfile.profileCompleteness < 100 && (
            <Card className="mt-4 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Complete your profile</p>
                      <p className="text-sm text-orange-600">
                        {userProfile.profileCompleteness}% complete - Add more details to unlock all features
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 bg-transparent">
                    Complete Profile
                  </Button>
                </div>
                <Progress value={userProfile.profileCompleteness} className="mt-3" />
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="surplus">Surplus</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{analytics?.totalSavings?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics?.totalOrders || 0}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +8% from last month
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Groups</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics?.groupsJoined || 0}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +2 new this month
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Surplus Earnings</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{analytics?.surplusEarnings?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +15% from last month
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Recycle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-700 mb-2">AI Predictions</h3>
                  <p className="text-sm text-gray-600 mb-4">Get smart purchase recommendations</p>
                  <Link href="/dashboard/vendor/ai-prediction">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Predictions</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-700 mb-2">Join Groups</h3>
                  <p className="text-sm text-gray-600 mb-4">Find and join buying groups</p>
                  <Link href="/dashboard/vendor/groups">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Browse Groups</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-700 mb-2">Place Order</h3>
                  <p className="text-sm text-gray-600 mb-4">Create new group orders</p>
                  <Link href="/dashboard/vendor/orders/new">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">New Order</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200">
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Recycle className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-orange-700 mb-2">Share Surplus</h3>
                  <p className="text-sm text-gray-600 mb-4">List surplus items for sale</p>
                  <Link href="/dashboard/vendor/surplus/new">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">Add Surplus</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.recentActivity?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "order"
                              ? "bg-blue-100"
                              : activity.type === "group"
                                ? "bg-green-100"
                                : activity.type === "surplus"
                                  ? "bg-orange-100"
                                  : "bg-purple-100"
                          }`}
                        >
                          {activity.type === "order" && <ShoppingCart className="h-4 w-4 text-blue-600" />}
                          {activity.type === "group" && <Users className="h-4 w-4 text-green-600" />}
                          {activity.type === "surplus" && <Recycle className="h-4 w-4 text-orange-600" />}
                          {activity.type === "ai" && <Brain className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-gray-600" />
                      Notifications
                    </div>
                    <Badge variant="secondary">{notifications.filter((n) => !n.read).length} new</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 4).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-blue-900"}`}
                            >
                              {notification.title}
                            </p>
                            <p className={`text-xs ${notification.read ? "text-gray-500" : "text-blue-700"}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      View All Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                  Monthly Performance
                </CardTitle>
                <CardDescription>Your orders and savings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-end justify-between space-x-2">
                  {analytics?.monthlyTrend?.map((month: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: "200px" }}>
                        <div
                          className="bg-blue-500 rounded-t-lg absolute bottom-0 w-full"
                          style={{ height: `${(month.orders / 30) * 100}%` }}
                        ></div>
                        <div
                          className="bg-green-500 rounded-t-lg absolute bottom-0 w-1/2"
                          style={{ height: `${(month.savings / 6000) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs font-medium text-gray-700">{month.month}</p>
                        <p className="text-xs text-gray-500">{month.orders} orders</p>
                        <p className="text-xs text-gray-500">₹{month.savings}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Savings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage all your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Order management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Group Management</CardTitle>
                <CardDescription>Manage your buying groups and memberships</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Group management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surplus">
            <Card>
              <CardHeader>
                <CardTitle>Surplus Management</CardTitle>
                <CardDescription>Manage your surplus items and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Surplus management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Comprehensive insights into your business performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Detailed analytics interface will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* WhatsApp Integration */}
        <Card className="mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">WhatsApp Quick Actions</h3>
                  <p className="text-green-100">Get instant updates and place orders via WhatsApp</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="secondary" className="text-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-700 bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
