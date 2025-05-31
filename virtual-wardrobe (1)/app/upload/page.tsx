"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Upload, Camera, User, Shirt, CheckCircle, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  file: File
  preview: string
  type: "clothing" | "face" | "body"
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "clothing" | "face" | "body") => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    const preview = URL.createObjectURL(file)
    const newFile: UploadedFile = { file, preview, type }

    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.type !== type)
      return [...filtered, newFile]
    })

    toast({
      title: "Image Uploaded",
      description: `${type === "clothing" ? "Clothing" : type === "face" ? "Face" : "Body"} image uploaded successfully.`,
    })
  }

  const removeFile = (type: "clothing" | "face" | "body") => {
    setUploadedFiles((prev) => prev.filter((f) => f.type !== type))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image to continue.",
        variant: "destructive",
      })
      return
    }

    if (!privacyConsent) {
      toast({
        title: "Privacy Consent Required",
        description: "Please accept the privacy policy to continue.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store upload data in localStorage (in real app, send to backend)
      const uploadData = {
        files: uploadedFiles.map((f) => ({
          type: f.type,
          name: f.file.name,
          size: f.file.size,
        })),
        uploadedAt: new Date().toISOString(),
      }
      localStorage.setItem("uploadData", JSON.stringify(uploadData))

      toast({
        title: "Upload Successful!",
        description: "Your images have been processed. Ready for personalization!",
      })

      router.push("/suggestions")
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      clearInterval(progressInterval)
    }
  }

  const getFileByType = (type: "clothing" | "face" | "body") => {
    return uploadedFiles.find((f) => f.type === type)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Style</h1>
          <p className="text-gray-600">
            Help us understand your style by uploading images. This enables personalized outfit suggestions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Clothing Upload */}
          <Card className="relative">
            <CardHeader className="text-center">
              <Shirt className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Clothing Items</CardTitle>
              <CardDescription>Upload photos of your favorite tops or bottom wear</CardDescription>
            </CardHeader>
            <CardContent>
              {getFileByType("clothing") ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={getFileByType("clothing")!.preview || "/placeholder.svg"}
                      alt="Clothing preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile("clothing")}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Clothing uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">Drag & drop or click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "clothing")}
                    className="hidden"
                    id="clothing-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="clothing-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Face Upload */}
          <Card className="relative">
            <CardHeader className="text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <CardTitle className="text-lg">Face Photo</CardTitle>
              <CardDescription>For skin tone analysis and personalized color matching</CardDescription>
            </CardHeader>
            <CardContent>
              {getFileByType("face") ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={getFileByType("face")!.preview || "/placeholder.svg"}
                      alt="Face preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile("face")}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Face photo uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">Upload a clear face photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "face")}
                    className="hidden"
                    id="face-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="face-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Body Upload */}
          <Card className="relative">
            <CardHeader className="text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Body Photo</CardTitle>
              <CardDescription>For body shape analysis and fit recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {getFileByType("body") ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={getFileByType("body")!.preview || "/placeholder.svg"}
                      alt="Body preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile("body")}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Body photo uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">Full body photo recommended</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "body")}
                    className="hidden"
                    id="body-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="body-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Privacy Consent */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy-consent"
                checked={privacyConsent}
                onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
              />
              <div className="space-y-2">
                <Label
                  htmlFor="privacy-consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I consent to the processing of my uploaded images
                </Label>
                <p className="text-sm text-gray-600">
                  Your images will be used solely for generating personalized outfit suggestions. We respect your
                  privacy and will never share your images with third parties. You can delete your data at any time from
                  your profile settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing your images...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500">
                  Analyzing style preferences, skin tone, and body shape for personalized recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={isUploading || uploadedFiles.length === 0 || !privacyConsent}
            size="lg"
            className="px-8"
          >
            {isUploading ? (
              "Processing..."
            ) : (
              <>
                Continue to Styling
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            {uploadedFiles.length === 0
              ? "Upload at least one image to continue"
              : !privacyConsent
                ? "Please accept the privacy policy"
                : "Ready to create your personalized style profile"}
          </p>
        </div>
      </div>
    </div>
  )
}
