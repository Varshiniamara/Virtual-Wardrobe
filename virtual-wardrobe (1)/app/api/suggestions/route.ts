import { type NextRequest, NextResponse } from "next/server"
import type { OutfitItem } from "../outfits/route"

interface SuggestionRequest {
  occasion: string
  mood: string
  colorPreference?: string
  budgetMin: number
  budgetMax: number
}

// Mock clothing database
const clothingItems: OutfitItem[] = [
  // Tops
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
    id: "t2",
    name: "Casual Polo T-Shirt",
    type: "top",
    price: 800,
    platform: "Flipkart",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://flipkart.com/polo-tshirt",
    color: "Navy",
    brand: "U.S. Polo",
  },
  {
    id: "t3",
    name: "Floral Summer Blouse",
    type: "top",
    price: 1500,
    platform: "Myntra",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://myntra.com/floral-blouse",
    color: "Pink",
    brand: "Vero Moda",
  },
  {
    id: "t4",
    name: "Black Blazer",
    type: "top",
    price: 2800,
    platform: "Amazon",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://amazon.com/black-blazer",
    color: "Black",
    brand: "Raymond",
  },
  // Bottoms
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
    id: "b2",
    name: "Black Formal Pants",
    type: "bottom",
    price: 1400,
    platform: "Amazon",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://amazon.com/formal-pants",
    color: "Black",
    brand: "Peter England",
  },
  {
    id: "b3",
    name: "Flowy Maxi Skirt",
    type: "bottom",
    price: 1200,
    platform: "Myntra",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://myntra.com/maxi-skirt",
    color: "Beige",
    brand: "Forever 21",
  },
  // Shoes
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
  {
    id: "s2",
    name: "Brown Leather Loafers",
    type: "shoes",
    price: 3200,
    platform: "Myntra",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://myntra.com/leather-loafers",
    color: "Brown",
    brand: "Clarks",
  },
  {
    id: "s3",
    name: "Black High Heels",
    type: "shoes",
    price: 2800,
    platform: "Flipkart",
    imageUrl: "/placeholder.svg?height=200&width=150",
    buyUrl: "https://flipkart.com/high-heels",
    color: "Black",
    brand: "Steve Madden",
  },
]

function generateOutfitSuggestion(request: SuggestionRequest): OutfitItem[] {
  const { occasion, mood, colorPreference, budgetMin, budgetMax } = request

  // Filter items by budget
  const affordableItems = clothingItems.filter((item) => item.price >= budgetMin && item.price <= budgetMax)

  // Simple AI logic for outfit matching
  const suggestedItems: OutfitItem[] = []

  // Select top based on occasion
  const tops = affordableItems.filter((item) => item.type === "top")
  let selectedTop: OutfitItem | undefined

  if (occasion === "Interview" || occasion === "Traditional") {
    selectedTop = tops.find((item) => item.name.includes("Blazer") || item.name.includes("Shirt"))
  } else if (occasion === "Party") {
    selectedTop = tops.find((item) => item.name.includes("Blouse") || item.color === "Black")
  } else {
    selectedTop = tops.find((item) => item.name.includes("Polo") || item.name.includes("T-Shirt"))
  }

  if (selectedTop) suggestedItems.push(selectedTop)

  // Select bottom
  const bottoms = affordableItems.filter((item) => item.type === "bottom")
  let selectedBottom: OutfitItem | undefined

  if (occasion === "Interview") {
    selectedBottom = bottoms.find((item) => item.name.includes("Formal"))
  } else if (occasion === "Party") {
    selectedBottom = bottoms.find((item) => item.name.includes("Skirt"))
  } else {
    selectedBottom = bottoms.find((item) => item.name.includes("Jeans"))
  }

  if (selectedBottom) suggestedItems.push(selectedBottom)

  // Select shoes
  const shoes = affordableItems.filter((item) => item.type === "shoes")
  let selectedShoes: OutfitItem | undefined

  if (occasion === "Interview") {
    selectedShoes = shoes.find((item) => item.name.includes("Loafers"))
  } else if (occasion === "Party") {
    selectedShoes = shoes.find((item) => item.name.includes("Heels"))
  } else {
    selectedShoes = shoes.find((item) => item.name.includes("Sneakers"))
  }

  if (selectedShoes) suggestedItems.push(selectedShoes)

  // Fallback to random selection if no matches
  if (suggestedItems.length === 0) {
    const randomTop = tops[Math.floor(Math.random() * tops.length)]
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)]
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)]

    if (randomTop) suggestedItems.push(randomTop)
    if (randomBottom) suggestedItems.push(randomBottom)
    if (randomShoes) suggestedItems.push(randomShoes)
  }

  return suggestedItems
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestionRequest = await request.json()

    const suggestedItems = generateOutfitSuggestion(body)
    const totalPrice = suggestedItems.reduce((sum, item) => sum + item.price, 0)

    return NextResponse.json({
      items: suggestedItems,
      totalPrice,
      occasion: body.occasion,
      mood: body.mood,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
