import { type NextRequest, NextResponse } from "next/server"

export interface Reminder {
  id: string
  title: string
  message: string
  date: string
  type: "outfit" | "shopping" | "event"
  outfitId?: string
  isRead: boolean
  createdAt: string
}

// Mock reminders data
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    let reminders = mockReminders
    if (unreadOnly) {
      reminders = mockReminders.filter((reminder) => !reminder.isRead)
    }

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error("Error in reminders API:", error)
    return NextResponse.json({ error: "Internal server error", reminders: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, date, type, outfitId } = body

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      message,
      date,
      type,
      outfitId,
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    mockReminders.push(newReminder)

    return NextResponse.json({ reminder: newReminder })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead } = body

    const reminder = mockReminders.find((r) => r.id === id)
    if (reminder) {
      reminder.isRead = isRead
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 })
  }
}
