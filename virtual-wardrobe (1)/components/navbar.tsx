"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shirt, Calendar, Upload, Heart, User, LogOut, Home, Camera } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { NotificationBell } from "@/components/notification-bell"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Shirt className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Virtual Wardrobe</span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/upload"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/upload" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  href="/virtual-tryOn"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/virtual-tryOn" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span>Try On</span>
                </Link>
                <Link
                  href="/wardrobe"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/wardrobe" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>My Wardrobe</span>
                </Link>
                <Link
                  href="/calendar"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/calendar" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
