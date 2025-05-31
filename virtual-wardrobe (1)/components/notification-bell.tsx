"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export function NotificationBell() {
  const { reminders, unreadCount, markAsRead, isLoading } = useNotifications()

  const handleReminderClick = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.log("Failed to mark notification as read:", error.message)
      // The markAsRead function already handles fallbacks, so we don't need to do anything else
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          reminders.slice(0, 5).map((reminder) => (
            <DropdownMenuItem
              key={reminder.id}
              className="flex flex-col items-start p-4 cursor-pointer"
              onClick={() => handleReminderClick(reminder.id)}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <p className="font-medium text-sm">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{reminder.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(reminder.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!reminder.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />}
              </div>
            </DropdownMenuItem>
          ))
        )}

        {reminders.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
