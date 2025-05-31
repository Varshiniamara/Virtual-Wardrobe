import type React from "react"
import ClientLayout from "./client-layout"

// Metadata must be exported from a server component, so we need to move it
const metadata = {
  title: "Virtual Wardrobe - Your Smart Fashion Assistant",
  description: "Personalized outfit suggestions for every occasion",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'