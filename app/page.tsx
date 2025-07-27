import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Users, Brain, Recycle, MessageCircle, TrendingUp, Shield, Clock, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-bounce-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🛒 Smart Sourcing for
              <span className="text-green-600"> Street Vendors</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop losing money on overbuying! Join group orders, get AI predictions, and share surplus with nearby
              vendors.
            </p>
          </div>

          {/* Problem Statement */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-red-800 mb-4">😰 The Problem We Solve</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-2xl">💸</div>
                <div>
                  <h3 className="font-semibold text-red-700">Money Loss</h3>
                  <p className="text-red-600">Vendors lose ₹500-2000 daily due to overbuying and wastage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-2xl">🤝</div>
                <div>
                  <h3 className="font-semibold text-red-700">No Coordination</h3>
                  <p className="text-red-600">Vendors buy individually, missing bulk discounts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-2xl">🔮</div>
                <div>
                  <h3 className="font-semibold text-red-700">Poor Prediction</h3>
                  <p className="text-red-600">No data-driven insights for demand forecasting</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-2xl">🗑️</div>
                <div>
                  <h3 className="font-semibold text-red-700">Food Waste</h3>
                  <p className="text-red-600">Surplus food gets wasted instead of being shared</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login?role=vendor">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg">
                🛒 Join as Vendor
              </Button>
            </Link>
            <Link href="/login?role=supplier">
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 px-8 py-4 text-lg bg-transparent"
              >
                🚚 Join as Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solution Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">🚀 Our Smart Solutions</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Group Buying */}
            <Card className="hover:shadow-lg transition-shadow border-green-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">🤝 Group Buying</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Form groups with nearby vendors to get bulk discounts and reduce individual costs by 20-30%
                </CardDescription>
              </CardContent>
            </Card>

            {/* AI Prediction */}
            <Card className="hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-700">🧠 AI Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get smart suggestions on what to buy based on weather, festivals, and historical data
                </CardDescription>
              </CardContent>
            </Card>

            {/* RasoiShare */}
            <Card className="hover:shadow-lg transition-shadow border-purple-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Recycle className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-700">♻️ RasoiShare</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Share surplus ingredients with nearby vendors instead of throwing them away
                </CardDescription>
              </CardContent>
            </Card>

            {/* WhatsApp Orders */}
            <Card className="hover:shadow-lg transition-shadow border-yellow-200">
              <CardHeader className="text-center">
                <div className="mx-auto bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-yellow-700">📲 WhatsApp Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Simple WhatsApp-based ordering system that every vendor can easily use
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">💰 Why Vendors Love Us</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save 20-30%</h3>
              <p className="text-gray-600">On raw material costs through group buying</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">No more daily market visits for small quantities</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduce Risk</h3>
              <p className="text-gray-600">AI predictions help avoid overbuying</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Network</h3>
              <p className="text-gray-600">Connect with vendors in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">🚀 Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of vendors already saving money and reducing waste</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=vendor">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                🛒 Start as Vendor
              </Button>
            </Link>
            <Link href="/login?role=supplier">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 text-lg bg-transparent"
              >
                🚚 Become Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">VendorConnect</span>
              </div>
              <p className="text-gray-400">Empowering street vendors with smart sourcing solutions</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <div className="space-y-2">
                <Link href="/login?role=vendor" className="block text-gray-400 hover:text-white transition-colors">
                  Join as Vendor
                </Link>
                <Link href="/dashboard/vendor" className="block text-gray-400 hover:text-white transition-colors">
                  Vendor Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Suppliers</h3>
              <div className="space-y-2">
                <Link href="/login?role=supplier" className="block text-gray-400 hover:text-white transition-colors">
                  Join as Supplier
                </Link>
                <Link href="/dashboard/supplier" className="block text-gray-400 hover:text-white transition-colors">
                  Supplier Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VendorConnect. Made with ❤️ for street vendors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
