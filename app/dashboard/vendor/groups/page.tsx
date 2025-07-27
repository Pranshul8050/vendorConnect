"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, MapPin, Clock, ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"

interface BuyingGroup {
  id: string
  name: string
  location: string
  category: string
  memberCount: number
  nextOrderDate: string
  status: "active" | "planning" | "ordering"
  isOwner: boolean
  isMember: boolean
}

export default function GroupsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    location: "",
    category: "vegetables",
  })

  const [groups, setGroups] = useState<BuyingGroup[]>([
    {
      id: "1",
      name: "Karol Bagh Vegetable Group",
      location: "Karol Bagh, Delhi",
      category: "vegetables",
      memberCount: 8,
      nextOrderDate: "2024-01-15",
      status: "active",
      isOwner: true,
      isMember: true,
    },
    {
      id: "2",
      name: "CP Spices Bulk Order",
      location: "Connaught Place, Delhi",
      category: "spices",
      memberCount: 12,
      nextOrderDate: "2024-01-18",
      status: "ordering",
      isOwner: false,
      isMember: true,
    },
    {
      id: "3",
      name: "Lajpat Nagar Oil Group",
      location: "Lajpat Nagar, Delhi",
      category: "oil",
      memberCount: 6,
      nextOrderDate: "2024-01-20",
      status: "planning",
      isOwner: false,
      isMember: false,
    },
  ])

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "vendor")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newGroup.name || !newGroup.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Simulate creating a group
    const newGroupData: BuyingGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      location: newGroup.location,
      category: newGroup.category,
      memberCount: 1,
      nextOrderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "planning",
      isOwner: true,
      isMember: true,
    }

    setGroups([newGroupData, ...groups])
    setNewGroup({ name: "", location: "", category: "vegetables" })
    setShowCreateForm(false)

    toast({
      title: "Group created!",
      description: "Your buying group has been created successfully.",
    })
  }

  const handleJoinGroup = (groupId: string) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, memberCount: group.memberCount + 1, isMember: true } : group,
      ),
    )

    toast({
      title: "Joined group!",
      description: "You have successfully joined the buying group.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading groups...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || userProfile?.role !== "vendor") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/vendor">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤝 Buying Groups</h1>
              <p className="text-gray-600">Join or create groups to save money on bulk orders</p>
            </div>
          </div>

          <Button onClick={() => setShowCreateForm(true)} className="bg-green-500 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card className="mb-8 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Create New Buying Group</CardTitle>
              <CardDescription>Start a new group to buy raw materials together with nearby vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Karol Bagh Vegetable Group"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Karol Bagh, Delhi"
                      value={newGroup.location}
                      onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newGroup.category}
                    onValueChange={(value) => setNewGroup({ ...newGroup, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">🥬 Vegetables</SelectItem>
                      <SelectItem value="spices">🌶️ Spices</SelectItem>
                      <SelectItem value="oil">🛢️ Oil & Ghee</SelectItem>
                      <SelectItem value="grains">🌾 Grains & Pulses</SelectItem>
                      <SelectItem value="dairy">🥛 Dairy Products</SelectItem>
                      <SelectItem value="mixed">🛒 Mixed Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    Create Group
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="mr-1 h-4 w-4" />
                      {group.location}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === "active"
                        ? "bg-green-100 text-green-700"
                        : group.status === "ordering"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {group.status === "active"
                      ? "✅ Active"
                      : group.status === "ordering"
                        ? "📦 Ordering"
                        : "📋 Planning"}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">
                      {group.category === "vegetables" && "🥬 Vegetables"}
                      {group.category === "spices" && "🌶️ Spices"}
                      {group.category === "oil" && "🛢️ Oil & Ghee"}
                      {group.category === "grains" && "🌾 Grains"}
                      {group.category === "dairy" && "🥛 Dairy"}
                      {group.category === "mixed" && "🛒 Mixed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {group.memberCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next Order:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {new Date(group.nextOrderDate).toLocaleDateString()}
                    </span>
                  </div>

                  {group.isOwner && (
                    <div className="bg-green-50 p-2 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">👑 You own this group</p>
                    </div>
                  )}

                  <div className="pt-2">
                    {group.isMember ? (
                      <div className="space-y-2">
                        <Button className="w-full bg-green-500 hover:bg-green-600">View Group Details</Button>
                        {group.status === "ordering" && (
                          <Button variant="outline" className="w-full bg-transparent">
                            Place Order
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleJoinGroup(group.id)}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Group
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No buying groups yet</h3>
              <p className="text-gray-600 mb-6">Create your first buying group to start saving money on bulk orders</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-green-500 hover:bg-green-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">💡 Tips for Successful Group Buying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Choose vendors from the same area for easy coordination</span>
                </p>
                <p className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Start with 5-8 members for optimal group size</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Plan orders 2-3 days in advance</span>
                </p>
                <p className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Use WhatsApp for quick communication</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
