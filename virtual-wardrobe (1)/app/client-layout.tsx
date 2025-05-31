"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import { NotificationProvider } from "@/hooks/use-notifications"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use client-side only rendering for NotificationProvider
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Ensure we're fully mounted before initializing notifications
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {isMounted ? (
              <NotificationProvider>
                {children}
                <Toaster />
              </NotificationProvider>
            ) : (
              <>
                {children}
                <Toaster />
              </>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
