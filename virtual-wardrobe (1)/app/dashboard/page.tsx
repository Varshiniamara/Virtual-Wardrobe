"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Heart, Calendar, Sparkles, Clock, Camera, Zap, Star, ArrowRight, Palette, Wand2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { user } = useAuth()

  const quickActions = [
    {
      title: "AI Virtual Mirror",
      description: "Experience real-time outfit visualization with advanced AI detection",
      icon: Camera,
      href: "/virtual-tryOn",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      pattern: "bg-gradient-to-br",
      accent: "emerald",
      feature: "🔥 Most Popular",
      stats: "98% accuracy",
    },
    {
      title: "Style Upload Studio",
      description: "Transform your wardrobe with intelligent photo analysis",
      icon: Upload,
      href: "/upload",
      gradient: "from-purple-500 via-violet-600 to-indigo-700",
      pattern: "bg-gradient-to-br",
      accent: "purple",
      feature: "✨ AI Powered",
      stats: "3 min setup",
    },
    {
      title: "Smart Style Generator",
      description: "Get personalized outfit combinations tailored to your taste",
      icon: Wand2,
      href: "/suggestions",
      gradient: "from-pink-400 via-rose-500 to-red-600",
      pattern: "bg-gradient-to-br",
      accent: "pink",
      feature: "🎯 Personalized",
      stats: "1000+ combos",
    },
    {
      title: "Fashion Collection",
      description: "Curate and organize your favorite looks in one place",
      icon: Heart,
      href: "/wardrobe",
      gradient: "from-blue-400 via-indigo-500 to-purple-600",
      pattern: "bg-gradient-to-br",
      accent: "blue",
      feature: "💎 Premium",
      stats: "Unlimited saves",
    },
    {
      title: "Style Planner",
      description: "Schedule perfect outfits for every occasion and event",
      icon: Calendar,
      href: "/calendar",
      gradient: "from-orange-400 via-amber-500 to-yellow-600",
      pattern: "bg-gradient-to-br",
      accent: "orange",
      feature: "📅 Smart",
      stats: "Never repeat",
    },
  ]

  const recentActivity = [
    { action: "Discovered new style combinations", time: "2 min ago", icon: Sparkles, color: "text-purple-600" },
    { action: "Completed virtual try-on session", time: "1 hour ago", icon: Camera, color: "text-green-600" },
    { action: "Updated color palette preferences", time: "3 hours ago", icon: Palette, color: "text-pink-600" },
    { action: "Uploaded summer collection items", time: "1 day ago", icon: Upload, color: "text-blue-600" },
    { action: "Saved trending outfit inspiration", time: "2 days ago", icon: Heart, color: "text-red-600" },
  ]

  const timeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "morning"
    if (hour < 17) return "afternoon"
    return "evening"
  }

  const getGreeting = () => {
    const time = timeOfDay()
    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    }
    return greetings[time]
  }

  const getMotivationalMessage = () => {
    const messages = {
      morning: "Let's start your day with the perfect outfit! ☀️",
      afternoon: "Ready to refresh your style? ✨",
      evening: "Time to plan tomorrow's amazing look! 🌙",
    }
    return messages[timeOfDay()]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Welcome Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                      {getGreeting()}, {user?.name}!
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">{getMotivationalMessage()}</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Style Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">92/100</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Quick Actions */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Style Toolkit</h2>
              <p className="text-gray-600">Discover, create, and perfect your unique fashion sense</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href} className="group">
                  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                    {/* Background Pattern */}
                    <div
                      className={`absolute inset-0 ${action.pattern} ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>

                    {/* Feature Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 border border-white/20">
                        {action.feature}
                      </div>
                    </div>

                    <CardContent className="relative p-6 h-full flex flex-col">
                      {/* Icon Section */}
                      <div className="mb-4">
                        <div
                          className={`w-14 h-14 ${action.pattern} ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <action.icon className="h-7 w-7 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{action.description}</p>
                      </div>

                      {/* Stats & CTA */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-xs font-medium text-gray-500">{action.stats}</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                          <span>Explore</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div
                        className={`absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r group-hover:${action.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      ></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Promotion */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

              <CardContent className="relative p-6 text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Virtual Mirror</h3>
                <p className="text-emerald-100 text-sm mb-4 leading-relaxed">
                  Experience the future of fashion with our advanced AI-powered virtual try-on technology.
                </p>
                <Button asChild className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-semibold">
                  <Link href="/virtual-tryOn">
                    Start Virtual Session
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Today's Inspiration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trending Colors</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Style Mood</span>
                    <span className="text-sm font-medium text-gray-900">Minimalist Chic</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weather</span>
                    <span className="text-sm font-medium text-gray-900">Perfect for layers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
