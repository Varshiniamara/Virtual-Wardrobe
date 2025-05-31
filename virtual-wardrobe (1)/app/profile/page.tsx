"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Trash2, Download, BarChart3, Heart, Calendar, Shirt, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface UserStats {
  savedOutfits: number
  suggestionsGenerated: number
  scheduledLooks: number
  mostUsedStyle: string
  topColor: string
  totalSpent: number
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [stats, setStats] = useState<UserStats>({
    savedOutfits: 12,
    suggestionsGenerated: 47,
    scheduledLooks: 8,
    mostUsedStyle: "Casual",
    topColor: "Black",
    totalSpent: 15600,
  })
  const [uploadData, setUploadData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load upload data
    const savedUploadData = localStorage.getItem("uploadData")
    if (savedUploadData) {
      setUploadData(JSON.parse(savedUploadData))
    }
  }, [])

  const handleSaveProfile = () => {
    // In real app, this would update the backend
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    })
  }

  const handleDeleteImages = () => {
    localStorage.removeItem("uploadData")
    setUploadData(null)
    toast({
      title: "Images Deleted",
      description: "All uploaded images have been removed from our servers.",
    })
  }

  const handleClearWardrobe = () => {
    // In real app, this would clear user's wardrobe data
    toast({
      title: "Wardrobe Cleared",
      description: "All saved outfits have been removed.",
    })
  }

  const handleDeleteAccount = () => {
    // In real app, this would delete the user account
    logout()
    toast({
      title: "Account Deleted",
      description: "Your account and all data have been permanently deleted.",
    })
  }

  const handleExportData = () => {
    const userData = {
      profile: { name, email },
      stats,
      uploadData,
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "virtual-wardrobe-data.json"
    link.click()

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded as a JSON file.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and view your style statistics</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                    <AvatarFallback className="text-lg">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-600 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Uploaded Images */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images</CardTitle>
                <CardDescription>Manage your uploaded photos used for personalization</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {uploadData.files.map((file: any, index: number) => (
                        <div key={index} className="text-center">
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            <Shirt className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium capitalize">{file.type}</p>
                          <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Uploaded on {new Date(uploadData.uploadedAt).toLocaleDateString()}
                      </p>
                      <Button variant="outline" size="sm" onClick={handleDeleteImages}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Images
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No images uploaded yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Images
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or delete your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Wardrobe</p>
                    <p className="text-sm text-gray-600">Remove all saved outfits</p>
                  </div>
                  <Button variant="outline" onClick={handleClearWardrobe}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>

                <Separator />

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Style Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <span className="text-sm">Saved Outfits</span>
                  </div>
                  <Badge variant="secondary">{stats.savedOutfits}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Suggestions</span>
                  </div>
                  <Badge variant="secondary">{stats.suggestionsGenerated}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Scheduled</span>
                  </div>
                  <Badge variant="secondary">{stats.scheduledLooks}</Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Style Preferences</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Most Used Style</span>
                      <Badge variant="outline">{stats.mostUsedStyle}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Top Color</span>
                      <Badge variant="outline">{stats.topColor}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Total Outfit Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Across all saved outfits</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Style Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Casual (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-sm">Professional (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Party (25%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
