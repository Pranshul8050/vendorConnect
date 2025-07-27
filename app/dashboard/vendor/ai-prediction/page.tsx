"use client"

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
import { Brain, ArrowLeft, TrendingUp, Cloud, Calendar, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react"
import Link from "next/link"

interface PredictionItem {
  name: string
  category: string
  predictedQuantity: string
  reason: string
  confidence: number
  priceRange: string
  emoji: string
}

interface CartItem extends PredictionItem {
  quantity: number
  selected: boolean
}

export default function AIPredictionPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [businessType, setBusinessType] = useState("")
  const [location, setLocation] = useState("")
  const [predictions, setPredictions] = useState<PredictionItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "vendor")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  const generatePredictions = async () => {
    if (!businessType || !location) {
      toast({
        title: "Missing information",
        description: "Please select your business type and location.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate AI prediction generation
    setTimeout(() => {
      const mockPredictions: PredictionItem[] = [
        {
          name: "Onions",
          category: "vegetables",
          predictedQuantity: "15-20 kg",
          reason: "High demand expected due to upcoming festival season",
          confidence: 92,
          priceRange: "₹25-30/kg",
          emoji: "🧅",
        },
        {
          name: "Tomatoes",
          category: "vegetables",
          predictedQuantity: "10-12 kg",
          reason: "Weather forecast shows good conditions, stable prices",
          confidence: 88,
          priceRange: "₹35-40/kg",
          emoji: "🍅",
        },
        {
          name: "Green Chilies",
          category: "vegetables",
          predictedQuantity: "2-3 kg",
          reason: "Consistent demand, monsoon season approaching",
          confidence: 85,
          priceRange: "₹80-100/kg",
          emoji: "🌶️",
        },
        {
          name: "Coriander",
          category: "herbs",
          predictedQuantity: "1-2 kg",
          reason: "Daily essential, good shelf life",
          confidence: 90,
          priceRange: "₹40-50/kg",
          emoji: "🌿",
        },
        {
          name: "Cooking Oil",
          category: "oil",
          predictedQuantity: "5 liters",
          reason: "Monthly requirement, bulk buying saves 15%",
          confidence: 95,
          priceRange: "₹120-130/L",
          emoji: "🛢️",
        },
        {
          name: "Turmeric Powder",
          category: "spices",
          predictedQuantity: "500g",
          reason: "Essential spice, prices stable this month",
          confidence: 87,
          priceRange: "₹200-250/kg",
          emoji: "🟡",
        },
      ]

      setPredictions(mockPredictions)
      setCart(
        mockPredictions.map((item) => ({
          ...item,
          quantity: Number.parseInt(item.predictedQuantity.split("-")[0]),
          selected: false,
        })),
      )
      setIsGenerating(false)

      toast({
        title: "Predictions generated!",
        description: "AI has analyzed your requirements and market conditions.",
      })
    }, 2000)
  }

  const toggleItemSelection = (index: number) => {
    setCart(cart.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)))
  }

  const updateQuantity = (index: number, change: number) => {
    setCart(cart.map((item, i) => (i === index ? { ...item, quantity: Math.max(0, item.quantity + change) } : item)))
  }

  const addToGroupOrder = () => {
    const selectedItems = cart.filter((item) => item.selected && item.quantity > 0)

    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to add to your group order.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Added to group order!",
      description: `${selectedItems.length} items added to your group order cart.`,
    })

    setShowCart(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI assistant...</p>
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
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/dashboard/vendor">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🧠 AI Purchase Assistant</h1>
            <p className="text-gray-600">Get smart predictions for your next raw material order</p>
          </div>
        </div>

        {/* Input Form */}
        <Card className="mb-8 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Tell us about your business
            </CardTitle>
            <CardDescription>
              Our AI will analyze market conditions, weather, and demand patterns to suggest optimal purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="street-food">🍛 Street Food Stall</SelectItem>
                    <SelectItem value="tiffin">🍱 Tiffin Service</SelectItem>
                    <SelectItem value="restaurant">🏪 Small Restaurant</SelectItem>
                    <SelectItem value="juice-corner">🥤 Juice Corner</SelectItem>
                    <SelectItem value="chaat">🥘 Chaat Stall</SelectItem>
                    <SelectItem value="tea-stall">☕ Tea Stall</SelectItem>
                    <SelectItem value="snacks">🍿 Snacks Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Karol Bagh, Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={generatePredictions}
              disabled={isGenerating || !businessType || !location}
              className="mt-6 bg-blue-500 hover:bg-blue-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing market data...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate AI Predictions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Market Insights */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Market Trend</p>
                    <p className="font-semibold text-green-700">Prices Stable</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Cloud className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Weather Impact</p>
                    <p className="font-semibold text-blue-700">Favorable</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Demand Forecast</p>
                    <p className="font-semibold text-purple-700">High</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Predictions */}
        {predictions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🎯 AI Recommendations</span>
                <Button
                  onClick={addToGroupOrder}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={cart.filter((item) => item.selected).length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Group Order ({cart.filter((item) => item.selected).length})
                </Button>
              </CardTitle>
              <CardDescription>Select items and adjust quantities based on AI predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      item.selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItemSelection(index)}
                          className="mt-1 text-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{item.emoji}</span>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.confidence >= 90
                                  ? "bg-green-100 text-green-700"
                                  : item.confidence >= 80
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.confidence}% confidence
                            </span>
                          </div>

                          <p className="text-gray-600 mb-2">{item.reason}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>💰 {item.priceRange}</span>
                            <span>📦 Suggested: {item.predictedQuantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, -1)}
                          disabled={item.quantity <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(index, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">🤖 How Our AI Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Market Analysis</h4>
                    <p className="text-sm text-gray-600">Analyzes current market prices and trends</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Weather Impact</h4>
                    <p className="text-sm text-gray-600">Considers weather effects on supply and demand</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Historical Data</h4>
                    <p className="text-sm text-gray-600">Uses past purchase patterns and seasonal trends</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white p-2 rounded-full text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Smart Predictions</h4>
                    <p className="text-sm text-gray-600">Generates optimal quantity and timing recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
