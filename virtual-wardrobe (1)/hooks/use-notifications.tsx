"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Reminder } from "@/app/api/reminders/route"

interface NotificationContextType {
  reminders: Reminder[]
  unreadCount: number
  fetchReminders: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  createReminder: (reminder: Omit<Reminder, "id" | "isRead" | "createdAt">) => Promise<Reminder>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock data as fallback
const mockReminders: Reminder[] = [
  {
    id: "1",
    title: "Party Outfit Reminder",
    message: "Don't forget your party outfit for tonight at 7 PM!",
    date: "2024-01-20T19:00:00Z",
    type: "outfit",
    outfitId: "3",
    isRead: false,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Shopping Reminder",
    message: "Your saved white sneakers are on sale - 30% off!",
    date: "2024-01-21T09:00:00Z",
    type: "shopping",
    isRead: false,
    createdAt: "2024-01-20T08:00:00Z",
  },
  {
    id: "3",
    title: "Interview Tomorrow",
    message: "Remember to prepare your professional interview outfit for tomorrow's meeting.",
    date: "2024-01-22T08:00:00Z",
    type: "event",
    outfitId: "1",
    isRead: true,
    createdAt: "2024-01-21T18:00:00Z",
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchReminders = async () => {
    // Only run on the client side and when the app is fully mounted
    if (typeof window === "undefined") return

    setIsLoading(true)
    try {
      const response = await fetch("/api/reminders", {
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
          setReminders(data.reminders || [])
          return
        }
      }

      // If we get here, either response failed or wasn't JSON
      throw new Error("API not available or returned non-JSON response")
    } catch (error) {
      console.log("Using mock data for reminders:", error.message)
      // Use mock data as fallback
      setReminders(mockReminders)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      })

      if (response.ok) {
        setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, isRead: true } : reminder)))
      } else {
        throw new Error("Failed to update reminder")
      }
    } catch (error) {
      console.error("Failed to mark reminder as read:", error)
      // Update locally even if API fails
      setReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, isRead: true } : reminder)))
    }
  }

  const createReminder = async (reminderData: Omit<Reminder, "id" | "isRead" | "createdAt">): Promise<Reminder> => {
    // Create local reminder first as fallback
    const newReminder: Reminder = {
      id: Date.now().toString(),
      ...reminderData,
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminderData),
      })

      // Check if response is OK and is JSON
      if (response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          const apiReminder = data.reminder
          setReminders((prev) => [...prev, apiReminder])

          toast({
            title: "Reminder Created",
            description: "Your reminder has been set successfully.",
          })

          return apiReminder
        }
      }

      // If we get here, API call failed or returned non-JSON
      throw new Error("API not available")
    } catch (error) {
      console.log("Using local reminder creation:", error.message)

      // Use local reminder as fallback
      setReminders((prev) => [...prev, newReminder])

      toast({
        title: "Reminder Created",
        description: "Your reminder has been set successfully.",
      })

      return newReminder
    }
  }

  // Check for due reminders
  useEffect(() => {
    if (reminders.length === 0) return

    const checkReminders = () => {
      const now = new Date()
      const dueReminders = reminders.filter((reminder) => {
        const reminderDate = new Date(reminder.date)
        const timeDiff = reminderDate.getTime() - now.getTime()
        return timeDiff <= 60000 && timeDiff > 0 && !reminder.isRead // Within 1 minute
      })

      dueReminders.forEach((reminder) => {
        toast({
          title: reminder.title,
          description: reminder.message,
          duration: 10000,
        })
        markAsRead(reminder.id)
      })
    }

    const interval = setInterval(checkReminders, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [reminders, toast])

  useEffect(() => {
    // Only fetch after component is mounted and a small delay to ensure API routes are ready
    const timer = setTimeout(() => {
      fetchReminders()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const unreadCount = reminders.filter((r) => !r.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        reminders,
        unreadCount,
        fetchReminders,
        markAsRead,
        createReminder,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
