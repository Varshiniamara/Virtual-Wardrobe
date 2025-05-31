import { type NextRequest, NextResponse } from "next/server"

export interface Outfit {
  id: string
  name: string
  occasion: string
  mood: string
  items: OutfitItem[]
  totalPrice: number
  createdAt: string
  scheduledDate?: string
  imageUrl: string
}

export interface OutfitItem {
  id: string
  name: string
  type: "top" | "bottom" | "shoes" | "accessory"
  price: number
  platform: "Amazon" | "Flipkart" | "Myntra"
  imageUrl: string
  buyUrl: string
  color: string
  brand: string
}

// Mock outfit data
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // In a real app, filter by userId
    return NextResponse.json({ outfits: mockOutfits })
  } catch (error) {
    console.error("Error in outfits API:", error)
    return NextResponse.json({ error: "Internal server error", outfits: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, occasion, mood, items, scheduledDate } = body

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name,
      occasion,
      mood,
      items,
      totalPrice: items.reduce((sum: number, item: OutfitItem) => sum + item.price, 0),
      createdAt: new Date().toISOString(),
      scheduledDate,
      imageUrl: "/placeholder.svg?height=300&width=200",
    }

    // In a real app, save to database
    mockOutfits.push(newOutfit)

    return NextResponse.json({ outfit: newOutfit })
  } catch (error) {
    console.error("Error creating outfit:", error)
    return NextResponse.json({ error: "Failed to create outfit" }, { status: 500 })
  }
}
