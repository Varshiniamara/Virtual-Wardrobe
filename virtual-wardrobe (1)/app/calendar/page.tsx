"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, ChevronLeft, ChevronRight, Clock, Shirt } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/use-notifications"
import type { Outfit } from "@/app/api/outfits/route"

interface CalendarEvent {
  id: string
  date: string
  outfitId: string
  outfit: Outfit
  eventName?: string
}

// Mock outfits as fallback
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
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { createReminder } = useNotifications()

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Add a small delay to ensure we're fully client-side
      const timer = setTimeout(() => {
        fetchOutfits()
        loadScheduledEvents()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

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

  const loadScheduledEvents = () => {
    // Load from localStorage (in real app, this would be from backend)
    try {
      const savedEvents = localStorage.getItem("calendarEvents")
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents))
      }
    } catch (error) {
      console.error("Failed to load events:", error)
      setEvents([])
    }
  }

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents)
    try {
      localStorage.setItem("calendarEvents", JSON.stringify(newEvents))
    } catch (error) {
      console.error("Failed to save events:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const scheduleOutfit = async (outfit: Outfit, date: Date, eventName?: string) => {
    // Create the event first
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: date.toISOString(),
      outfitId: outfit.id,
      outfit,
      eventName,
    }

    const updatedEvents = [...events, newEvent]
    saveEvents(updatedEvents)

    // Then try to create a reminder, with error handling
    try {
      // Create a reminder date 2 hours before the event
      const reminderDate = new Date(date)
      reminderDate.setHours(reminderDate.getHours() - 2)

      // Create the reminder data
      const reminderData = {
        title: `Outfit Reminder: ${outfit.name}`,
        message: `Don't forget to wear your ${outfit.name} ${eventName ? `for ${eventName}` : "today"}!`,
        date: reminderDate.toISOString(),
        type: "outfit" as const,
        outfitId: outfit.id,
      }

      // Try to create the reminder, but don't wait for it to complete
      createReminder(reminderData).catch((error) => {
        console.error("Failed to create reminder, but event was saved:", error)
      })
    } catch (error) {
      console.error("Error preparing reminder:", error)
      // Continue anyway since the event is already saved
    }

    toast({
      title: "Outfit Scheduled!",
      description: `${outfit.name} has been scheduled for ${date.toLocaleDateString()}`,
    })

    setSelectedDate(null)
    setSelectedOutfit(null)
  }

  const removeEvent = (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId)
    saveEvents(updatedEvents)
    toast({
      title: "Event Removed",
      description: "Outfit has been removed from your calendar.",
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

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
            <h1 className="text-3xl font-bold mb-2">Style Calendar</h1>
            <p className="text-gray-600">Plan your outfits for upcoming events and occasions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {events.length} scheduled outfits
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="h-24" />
                }

                const dayEvents = getEventsForDate(day)
                const isToday =
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear()

                return (
                  <div
                    key={index}
                    className={`h-24 p-1 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      isToday ? "bg-blue-50 border-blue-200" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate"
                          title={event.outfit.name}
                        >
                          <Shirt className="h-3 w-3 inline mr-1" />
                          {event.outfit.name}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Outfit Dialog */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Outfit for {selectedDate?.toLocaleDateString()}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Existing Events */}
              {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Scheduled Outfits</h3>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shirt className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="font-medium">{event.outfit.name}</p>
                            <p className="text-sm text-gray-600">{event.outfit.occasion}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeEvent(event.id)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Outfits */}
              <div>
                <h3 className="font-semibold mb-3">Choose an Outfit</h3>
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {outfits.map((outfit) => (
                    <Card
                      key={outfit.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOutfit?.id === outfit.id ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => setSelectedOutfit(outfit)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Shirt className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{outfit.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {outfit.occasion}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                ₹{outfit.totalPrice}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Schedule Button */}
              {selectedOutfit && selectedDate && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedDate(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => scheduleOutfit(selectedOutfit, selectedDate)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Outfit
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
