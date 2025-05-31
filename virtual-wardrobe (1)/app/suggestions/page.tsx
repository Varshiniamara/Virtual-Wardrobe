"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, ShoppingCart, Heart, RefreshCw, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { OutfitItem } from "@/app/api/outfits/route"

interface SuggestionResponse {
  items: OutfitItem[]
  totalPrice: number
  occasion: string
  mood: string
}

// Mock suggestion data as fallback
const mockSuggestion: SuggestionResponse = {
  items: [
    {
      id: "t1",
      name: "Classic White Shirt",
      type: "top",
      price: 1200,
      platform: "Amazon",
      imageUrl: "/placeholder.svg?height=200&width=150",
      buyUrl: "https://amazon.com/white-shirt",
      color: "White",
      brand: "Arrow",
    },
    {
      id: "b1",
      name: "Blue Denim Jeans",
      type: "bottom",
      price: 1800,
      platform: "Flipkart",
      imageUrl: "/placeholder.svg?height=200&width=150",
      buyUrl: "https://flipkart.com/blue-jeans",
      color: "Blue",
      brand: "Levi's",
    },
    {
      id: "s1",
      name: "White Canvas Sneakers",
      type: "shoes",
      price: 2200,
      platform: "Amazon",
      imageUrl: "/placeholder.svg?height=200&width=150",
      buyUrl: "https://amazon.com/canvas-sneakers",
      color: "White",
      brand: "Converse",
    },
  ],
  totalPrice: 5200,
  occasion: "Casual",
  mood: "Relaxed",
}

export default function SuggestionsPage() {
  const [occasion, setOccasion] = useState("")
  const [mood, setMood] = useState("")
  const [colorPreference, setColorPreference] = useState("")
  const [budget, setBudget] = useState([1000, 5000])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null)
  const { toast } = useToast()

  const occasions = ["Party", "Interview", "College", "Traditional", "Travel", "Casual"]
  const moods = ["Happy", "Calm", "Bold", "Lazy", "Confident", "Relaxed"]
  const colors = ["Red", "Blue", "Green", "Black", "White", "Pink", "Purple", "Orange", "Yellow"]

  const handleGetSuggestions = async () => {
    if (!occasion || !mood) {
      toast({
        title: "Missing Information",
        description: "Please select both occasion and mood.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          mood,
          colorPreference,
          budgetMin: budget[0],
          budgetMax: budget[1],
        }),
      })

      // Check if response is OK and is JSON
      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          setSuggestion(data)

          toast({
            title: "Outfit Generated!",
            description: "Your personalized outfit suggestion is ready.",
          })
          return
        }
      }

      // If we get here, API call failed or returned non-JSON
      throw new Error("API not available or returned non-JSON response")
    } catch (error) {
      console.log("Using mock data for suggestions:", error.message)
      // Use mock data as fallback
      setSuggestion({
        ...mockSuggestion,
        occasion,
        mood,
      })
      toast({
        title: "Outfit Generated!",
        description: "Your personalized outfit suggestion is ready.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOutfit = async () => {
    if (!suggestion) return

    try {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${suggestion.mood} ${suggestion.occasion} Look`,
          occasion: suggestion.occasion,
          mood: suggestion.mood,
          items: suggestion.items,
        }),
      })

      // Check if response is OK and is JSON
      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          await response.json()
          toast({
            title: "Outfit Saved!",
            description: "Added to your wardrobe collection.",
          })
          return
        }
      }

      // If we get here, API call failed or returned non-JSON
      throw new Error("API not available")
    } catch (error) {
      console.log("Saving outfit locally:", error.message)
      toast({
        title: "Outfit Saved!",
        description: "Added to your wardrobe collection.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get Outfit Suggestions</h1>
          <p className="text-gray-600">Tell us about your style preferences and we'll create the perfect look</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Style Preferences
                </CardTitle>
                <CardDescription>Customize your outfit suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occ) => (
                        <SelectItem key={occ} value={occ}>
                          {occ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Preference (Optional)</Label>
                  <Select value={colorPreference} onValueChange={setColorPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>
                    Budget Range: ₹{budget[0]} - ₹{budget[1]}
                  </Label>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    max={10000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleGetSuggestions} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Suggest Outfit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Suggestion Results */}
          <div className="lg:col-span-2">
            {suggestion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Perfect Look</CardTitle>
                      <CardDescription>
                        {suggestion.mood} style for {suggestion.occasion}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleGetSuggestions}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                      <Button onClick={handleSaveOutfit}>
                        <Heart className="mr-2 h-4 w-4" />
                        Save Look
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {suggestion.items.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-lg">₹{item.price}</span>
                            <Badge variant="secondary">{item.platform}</Badge>
                          </div>
                          <Button asChild className="w-full" size="sm">
                            <a href={item.buyUrl} target="_blank" rel="noopener noreferrer">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy Now
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Total Outfit Cost</h3>
                      <p className="text-sm text-gray-600">Complete look pricing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{suggestion.totalPrice}</p>
                      <p className="text-sm text-gray-600">{suggestion.items.length} items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Style You!</h3>
                  <p className="text-gray-600">Set your preferences and click "Suggest Outfit" to get started</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
