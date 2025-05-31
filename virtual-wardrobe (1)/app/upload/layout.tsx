import type React from "react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  )
}
