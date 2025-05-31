"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Calendar, Trash2, Edit, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import type { Outfit } from "@/app/api/outfits/route"

// Mock data as fallback
const mockOutfits: Outfit[] = [
  {
    id: "1",
    name: "Professional Interview Look",
    occasion: "Interview",
    mood: "Confident",
    totalPrice: 4500,
    createdAt: "2024-01-15T10:00:00Z",
    imageUrl: "/placeholder.svg?height=300&width=200",
    items: [
      {
        id: "1",
        name: "Navy Blue Blazer",
        type: "top",
        price: 2500,
        platform: "Amazon",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://amazon.com/navy-blazer",
        color: "Navy Blue",
        brand: "Allen Solly",
      },
      {
        id: "2",
        name: "Formal Black Trousers",
        type: "bottom",
        price: 1200,
        platform: "Flipkart",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://flipkart.com/black-trousers",
        color: "Black",
        brand: "Van Heusen",
      },
      {
        id: "3",
        name: "Leather Oxford Shoes",
        type: "shoes",
        price: 800,
        platform: "Myntra",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://myntra.com/oxford-shoes",
        color: "Brown",
        brand: "Clarks",
      },
    ],
  },
  {
    id: "2",
    name: "Casual Weekend Vibes",
    occasion: "Casual",
    mood: "Relaxed",
    totalPrice: 2800,
    createdAt: "2024-01-14T15:30:00Z",
    imageUrl: "/placeholder.svg?height=300&width=200",
    items: [
      {
        id: "4",
        name: "Cotton Graphic T-Shirt",
        type: "top",
        price: 800,
        platform: "Amazon",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://amazon.com/graphic-tee",
        color: "White",
        brand: "H&M",
      },
      {
        id: "5",
        name: "Denim Jeans",
        type: "bottom",
        price: 1500,
        platform: "Flipkart",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://flipkart.com/denim-jeans",
        color: "Blue",
        brand: "Levi's",
      },
      {
        id: "6",
        name: "White Sneakers",
        type: "shoes",
        price: 500,
        platform: "Myntra",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://myntra.com/white-sneakers",
        color: "White",
        brand: "Adidas",
      },
    ],
  },
  {
    id: "3",
    name: "Party Night Glamour",
    occasion: "Party",
    mood: "Bold",
    totalPrice: 6200,
    createdAt: "2024-01-13T20:00:00Z",
    scheduledDate: "2024-01-20T19:00:00Z",
    imageUrl: "/placeholder.svg?height=300&width=200",
    items: [
      {
        id: "7",
        name: "Sequin Party Dress",
        type: "top",
        price: 3500,
        platform: "Amazon",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://amazon.com/sequin-dress",
        color: "Black",
        brand: "Zara",
      },
      {
        id: "8",
        name: "High Heels",
        type: "shoes",
        price: 2200,
        platform: "Myntra",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://myntra.com/high-heels",
        color: "Black",
        brand: "Steve Madden",
      },
      {
        id: "9",
        name: "Statement Earrings",
        type: "accessory",
        price: 500,
        platform: "Flipkart",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://flipkart.com/statement-earrings",
        color: "Gold",
        brand: "Accessorize",
      },
    ],
  },
]

export default function WardrobePage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [occasionFilter, setOccasionFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Add a small delay to ensure we're fully client-side
      const timer = setTimeout(() => {
        fetchOutfits()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    filterOutfits()
  }, [outfits, searchTerm, occasionFilter])

  const fetchOutfits = async () => {
    try {
      const response = await fetch("/api/outfits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Check if response is OK and is JSON
      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          setOutfits(data.outfits || [])
          return
        }
      }

      // If we get here, API call failed or returned non-JSON
      throw new Error("API not available or returned non-JSON response")
    } catch (error) {
      console.log("Using mock data for outfits:", error.message)
      // Use mock data as fallback
      setOutfits(mockOutfits)
    } finally {
      setIsLoading(false)
    }
  }

  const filterOutfits = () => {
    let filtered = outfits

    if (searchTerm) {
      filtered = filtered.filter(
        (outfit) =>
          outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          outfit.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          outfit.mood.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (occasionFilter !== "all") {
      filtered = filtered.filter((outfit) => outfit.occasion === occasionFilter)
    }

    setFilteredOutfits(filtered)
  }

  const handleDeleteOutfit = (id: string) => {
    setOutfits((prev) => prev.filter((outfit) => outfit.id !== id))
    toast({
      title: "Outfit Deleted",
      description: "The outfit has been removed from your wardrobe.",
    })
  }

  const handleScheduleOutfit = (id: string) => {
    toast({
      title: "Schedule Outfit",
      description: "Please use the calendar page to schedule this outfit.",
    })
  }

  const occasions = ["all", "Party", "Interview", "College", "Traditional", "Travel", "Casual"]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wardrobe</h1>
            <p className="text-gray-600">Your saved outfit collection</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {filteredOutfits.length} outfits
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search outfits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map((occasion) => (
                      <SelectItem key={occasion} value={occasion}>
                        {occasion === "all" ? "All Occasions" : occasion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outfits Grid */}
        {filteredOutfits.length === 0 ? (
          <Card className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Outfits Found</h3>
              <p className="text-gray-600">
                {searchTerm || occasionFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start building your wardrobe by creating outfit suggestions"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => (
              <Card key={outfit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                  <img
                    src={outfit.imageUrl || "/placeholder.svg?height=300&width=200"}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1">{outfit.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(outfit.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteOutfit(outfit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">{outfit.occasion}</Badge>
                    <Badge variant="secondary">{outfit.mood}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="font-semibold">₹{outfit.totalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Items</span>
                      <span className="text-sm">{outfit.items.length} pieces</span>
                    </div>

                    {outfit.scheduledDate && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled for {new Date(outfit.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Look
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleScheduleOutfit(outfit.id)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
