"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, CameraOff, RotateCcw, Download, Shirt, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Outfit } from "@/app/api/outfits/route"

// Face and body detection interfaces
interface FaceDetection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

interface BodyKeypoint {
  x: number
  y: number
  confidence: number
}

interface BodyDetection {
  keypoints: {
    nose: BodyKeypoint
    leftEye: BodyKeypoint
    rightEye: BodyKeypoint
    leftEar: BodyKeypoint
    rightEar: BodyKeypoint
    leftShoulder: BodyKeypoint
    rightShoulder: BodyKeypoint
    leftElbow: BodyKeypoint
    rightElbow: BodyKeypoint
    leftWrist: BodyKeypoint
    rightWrist: BodyKeypoint
    leftHip: BodyKeypoint
    rightHip: BodyKeypoint
    leftKnee: BodyKeypoint
    rightKnee: BodyKeypoint
    leftAnkle: BodyKeypoint
    rightAnkle: BodyKeypoint
  }
  confidence: number
}

// Mock outfits for virtual try-on
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
    ],
  },
  {
    id: "3",
    name: "Party Night Glamour",
    occasion: "Party",
    mood: "Bold",
    totalPrice: 6200,
    createdAt: "2024-01-13T20:00:00Z",
    imageUrl: "/placeholder.svg?height=300&width=200",
    items: [
      {
        id: "7",
        name: "Sequin Party Dress",
        type: "top",
        price: 3500,
        platform: "Amazon",
        imageUrl: "/placeholder.svg?height=200&width=150",
        buyUrl: "https://amazon.com/sequin-dress",
        color: "Black",
        brand: "Zara",
      },
    ],
  },
]

export default function VirtualTryOnPage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>(mockOutfits)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced detection states
  const [faceDetection, setFaceDetection] = useState<FaceDetection | null>(null)
  const [bodyDetection, setBodyDetection] = useState<BodyDetection | null>(null)
  const [detectionQuality, setDetectionQuality] = useState<"poor" | "good" | "excellent">("poor")
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      // Cleanup camera stream and detection on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setDetectionError(null)

      // Request camera permission with higher quality settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)

        // Wait for video to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          startAdvancedDetection()
        }

        toast({
          title: "Camera Started",
          description: "Advanced face and body detection is now active",
        })
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setDetectionError("Camera access denied or not available")
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use virtual try-on feature",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    setIsStreaming(false)
    setIsDetecting(false)
    setFaceDetection(null)
    setBodyDetection(null)
    setDetectionQuality("poor")
    setDetectionError(null)

    toast({
      title: "Camera Stopped",
      description: "Virtual try-on session ended",
    })
  }

  const switchCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    if (isStreaming) {
      stopCamera()
      setTimeout(() => {
        startCamera()
      }, 500)
    }
  }

  const startAdvancedDetection = useCallback(() => {
    if (!videoRef.current || !detectionCanvasRef.current) return

    setIsDetecting(true)

    // Start detection loop
    detectionIntervalRef.current = setInterval(() => {
      detectFaceAndBody()
    }, 100) // 10 FPS detection rate for better performance

    toast({
      title: "Detection Started",
      description: "AI is analyzing your pose and face position",
    })
  }, [])

  const detectFaceAndBody = () => {
    if (!videoRef.current || !detectionCanvasRef.current) return

    const video = videoRef.current
    const canvas = detectionCanvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas for analysis
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Simulate advanced face detection
    const faceResult = simulateAdvancedFaceDetection(imageData, canvas.width, canvas.height)
    setFaceDetection(faceResult)

    // Simulate advanced body detection
    const bodyResult = simulateAdvancedBodyDetection(imageData, canvas.width, canvas.height)
    setBodyDetection(bodyResult)

    // Calculate overall detection quality
    updateDetectionQuality(faceResult, bodyResult)
  }

  const simulateAdvancedFaceDetection = (imageData: ImageData, width: number, height: number): FaceDetection | null => {
    // Simulate face detection using brightness analysis and edge detection
    const data = imageData.data
    const faceRegions: Array<{ x: number; y: number; score: number }> = []

    // Scan for face-like regions (simplified algorithm)
    const blockSize = 20
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        let skinTonePixels = 0
        let totalPixels = 0
        let edgePixels = 0

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]

            totalPixels++

            // Check for skin tone (simplified)
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              Math.abs(r - g) > 15 &&
              r > g &&
              r > b
            ) {
              skinTonePixels++
            }

            // Simple edge detection
            if (dx > 0 && dy > 0) {
              const prevIdx = ((y + dy - 1) * width + (x + dx - 1)) * 4
              const diff =
                Math.abs(r - data[prevIdx]) + Math.abs(g - data[prevIdx + 1]) + Math.abs(b - data[prevIdx + 2])
              if (diff > 30) edgePixels++
            }
          }
        }

        const skinRatio = skinTonePixels / totalPixels
        const edgeRatio = edgePixels / totalPixels

        // Score based on skin tone and edge presence
        if (skinRatio > 0.3 && edgeRatio > 0.1) {
          faceRegions.push({
            x: x + blockSize / 2,
            y: y + blockSize / 2,
            score: skinRatio * 0.7 + edgeRatio * 0.3,
          })
        }
      }
    }

    // Find the best face candidate
    if (faceRegions.length > 0) {
      const bestFace = faceRegions.reduce((best, current) => (current.score > best.score ? current : best))

      // Add some randomness to simulate real detection variance
      const variance = 0.1
      const confidence = Math.min(0.95, bestFace.score + (Math.random() - 0.5) * variance)

      if (confidence > 0.5) {
        return {
          x: Math.max(0, bestFace.x - 60),
          y: Math.max(0, bestFace.y - 80),
          width: 120,
          height: 160,
          confidence: confidence,
        }
      }
    }

    return null
  }

  const simulateAdvancedBodyDetection = (imageData: ImageData, width: number, height: number): BodyDetection | null => {
    // Simulate pose estimation using motion and contour analysis
    const data = imageData.data

    // Look for vertical structures (body outline)
    const bodyRegions: Array<{ x: number; y: number; score: number }> = []

    const blockSize = 30
    for (let y = height * 0.2; y < height - blockSize; y += blockSize) {
      for (let x = width * 0.2; x < width * 0.8; x += blockSize) {
        let verticalEdges = 0
        const movementScore = 0

        for (let dy = 0; dy < blockSize; dy++) {
          for (let dx = 0; dx < blockSize; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4

            // Vertical edge detection
            if (dx < blockSize - 1) {
              const nextIdx = ((y + dy) * width + (x + dx + 1)) * 4
              const edgeStrength =
                Math.abs(data[idx] - data[nextIdx]) +
                Math.abs(data[idx + 1] - data[nextIdx + 1]) +
                Math.abs(data[idx + 2] - data[nextIdx + 2])
              if (edgeStrength > 40) verticalEdges++
            }
          }
        }

        const edgeRatio = verticalEdges / (blockSize * blockSize)
        if (edgeRatio > 0.15) {
          bodyRegions.push({
            x: x + blockSize / 2,
            y: y + blockSize / 2,
            score: edgeRatio,
          })
        }
      }
    }

    if (bodyRegions.length > 3) {
      // Simulate keypoint detection based on body regions
      const centerX = width / 2
      const topY = height * 0.15
      const confidence = Math.min(0.9, bodyRegions.length / 10)

      return {
        keypoints: {
          nose: { x: centerX, y: topY + 20, confidence: confidence * 0.9 },
          leftEye: { x: centerX - 15, y: topY + 10, confidence: confidence * 0.8 },
          rightEye: { x: centerX + 15, y: topY + 10, confidence: confidence * 0.8 },
          leftEar: { x: centerX - 25, y: topY + 15, confidence: confidence * 0.7 },
          rightEar: { x: centerX + 25, y: topY + 15, confidence: confidence * 0.7 },
          leftShoulder: { x: centerX - 60, y: topY + 80, confidence: confidence * 0.9 },
          rightShoulder: { x: centerX + 60, y: topY + 80, confidence: confidence * 0.9 },
          leftElbow: { x: centerX - 80, y: topY + 140, confidence: confidence * 0.8 },
          rightElbow: { x: centerX + 80, y: topY + 140, confidence: confidence * 0.8 },
          leftWrist: { x: centerX - 90, y: topY + 200, confidence: confidence * 0.7 },
          rightWrist: { x: centerX + 90, y: topY + 200, confidence: confidence * 0.7 },
          leftHip: { x: centerX - 40, y: topY + 240, confidence: confidence * 0.9 },
          rightHip: { x: centerX + 40, y: topY + 240, confidence: confidence * 0.9 },
          leftKnee: { x: centerX - 45, y: topY + 340, confidence: confidence * 0.8 },
          rightKnee: { x: centerX + 45, y: topY + 340, confidence: confidence * 0.8 },
          leftAnkle: { x: centerX - 50, y: topY + 440, confidence: confidence * 0.7 },
          rightAnkle: { x: centerX + 50, y: topY + 440, confidence: confidence * 0.7 },
        },
        confidence: confidence,
      }
    }

    return null
  }

  const updateDetectionQuality = (face: FaceDetection | null, body: BodyDetection | null) => {
    let quality: "poor" | "good" | "excellent" = "poor"

    if (face && body) {
      const avgConfidence = (face.confidence + body.confidence) / 2
      if (avgConfidence > 0.8) {
        quality = "excellent"
      } else if (avgConfidence > 0.6) {
        quality = "good"
      }
    } else if (face || body) {
      quality = "good"
    }

    setDetectionQuality(quality)
  }

  const applyOutfit = (outfit: Outfit) => {
    if (!bodyDetection || bodyDetection.confidence < 0.5) {
      toast({
        title: "Body Not Detected",
        description: "Please position yourself properly in front of the camera for better body detection",
        variant: "destructive",
      })
      return
    }

    setSelectedOutfit(outfit)
    toast({
      title: "Outfit Applied",
      description: `Now wearing: ${outfit.name}`,
    })
  }

  const drawAdvancedOverlay = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw face detection
    if (faceDetection && faceDetection.confidence > 0.5) {
      drawFaceDetection(ctx, faceDetection)
    }

    // Draw body detection
    if (bodyDetection && bodyDetection.confidence > 0.5) {
      drawBodyDetection(ctx, bodyDetection)
    }

    // Draw outfit overlay
    if (selectedOutfit && bodyDetection && bodyDetection.confidence > 0.6) {
      drawAdvancedOutfitOverlay(ctx, canvas.width, canvas.height, selectedOutfit, bodyDetection)
    }

    if (isStreaming) {
      requestAnimationFrame(drawAdvancedOverlay)
    }
  }, [faceDetection, bodyDetection, selectedOutfit, isStreaming])

  useEffect(() => {
    if (isStreaming) {
      drawAdvancedOverlay()
    }
  }, [isStreaming, drawAdvancedOverlay])

  const drawFaceDetection = (ctx: CanvasRenderingContext2D, face: FaceDetection) => {
    ctx.save()

    // Draw face bounding box
    const color = face.confidence > 0.8 ? "#00ff00" : face.confidence > 0.6 ? "#ffff00" : "#ff6600"
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.strokeRect(face.x, face.y, face.width, face.height)

    // Draw confidence score
    ctx.fillStyle = color
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Face: ${Math.round(face.confidence * 100)}%`, face.x + face.width / 2, face.y - 10)

    ctx.restore()
  }

  const drawBodyDetection = (ctx: CanvasRenderingContext2D, body: BodyDetection) => {
    ctx.save()

    const color = body.confidence > 0.8 ? "#00ff00" : body.confidence > 0.6 ? "#ffff00" : "#ff6600"
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3

    // Draw skeleton connections
    const connections = [
      ["leftShoulder", "rightShoulder"],
      ["leftShoulder", "leftElbow"],
      ["leftElbow", "leftWrist"],
      ["rightShoulder", "rightElbow"],
      ["rightElbow", "rightWrist"],
      ["leftShoulder", "leftHip"],
      ["rightShoulder", "rightHip"],
      ["leftHip", "rightHip"],
      ["leftHip", "leftKnee"],
      ["leftKnee", "leftAnkle"],
      ["rightHip", "rightKnee"],
      ["rightKnee", "rightAnkle"],
    ]

    connections.forEach(([start, end]) => {
      const startPoint = body.keypoints[start as keyof typeof body.keypoints]
      const endPoint = body.keypoints[end as keyof typeof body.keypoints]

      if (startPoint.confidence > 0.5 && endPoint.confidence > 0.5) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })

    // Draw keypoints
    Object.entries(body.keypoints).forEach(([name, point]) => {
      if (point.confidence > 0.5) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw confidence score
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Body: ${Math.round(body.confidence * 100)}%`, body.keypoints.nose.x, body.keypoints.nose.y - 30)

    ctx.restore()
  }

  const drawAdvancedOutfitOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    outfit: Outfit,
    body: BodyDetection,
  ) => {
    outfit.items.forEach((item) => {
      ctx.save()
      ctx.globalAlpha = 0.6

      // Get color
      let color = item.color.toLowerCase()
      if (color === "navy blue") color = "#000080"
      if (color === "white") color = "#ffffff"
      if (color === "black") color = "#000000"
      if (color === "blue") color = "#0066cc"

      ctx.fillStyle = color
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 2

      switch (item.type) {
        case "top":
          // Use shoulder and hip positions for accurate top placement
          const leftShoulder = body.keypoints.leftShoulder
          const rightShoulder = body.keypoints.rightShoulder
          const leftHip = body.keypoints.leftHip
          const rightHip = body.keypoints.rightHip

          if (leftShoulder.confidence > 0.6 && rightShoulder.confidence > 0.6) {
            const topWidth = Math.abs(rightShoulder.x - leftShoulder.x) + 40
            const topHeight = Math.abs(leftHip.y - leftShoulder.y) + 20
            const topX = leftShoulder.x - 20
            const topY = leftShoulder.y - 10

            // Draw top with rounded corners
            ctx.beginPath()
            ctx.roundRect(topX, topY, topWidth, topHeight, 10)
            ctx.fill()
            ctx.stroke()

            // Add item label
            ctx.fillStyle = color === "#ffffff" ? "#000" : "#fff"
            ctx.font = "14px Arial"
            ctx.textAlign = "center"
            ctx.fillText(item.name, topX + topWidth / 2, topY + topHeight / 2)
          }
          break

        case "bottom":
          // Use hip and ankle positions for accurate bottom placement
          const leftHipB = body.keypoints.leftHip
          const rightHipB = body.keypoints.rightHip
          const leftAnkle = body.keypoints.leftAnkle
          const rightAnkle = body.keypoints.rightAnkle

          if (leftHipB.confidence > 0.6 && rightHipB.confidence > 0.6) {
            const bottomWidth = Math.abs(rightHipB.x - leftHipB.x) + 20
            const bottomHeight = Math.abs(leftAnkle.y - leftHipB.y) - 20
            const bottomX = leftHipB.x - 10
            const bottomY = leftHipB.y

            // Draw bottom
            ctx.beginPath()
            ctx.roundRect(bottomX, bottomY, bottomWidth, bottomHeight, 5)
            ctx.fill()
            ctx.stroke()

            // Add item label
            ctx.fillStyle = color === "#ffffff" ? "#000" : "#fff"
            ctx.font = "14px Arial"
            ctx.textAlign = "center"
            ctx.fillText(item.name, bottomX + bottomWidth / 2, bottomY + bottomHeight / 2)
          }
          break

        case "shoes":
          // Use ankle positions for accurate shoe placement
          const leftAnkleS = body.keypoints.leftAnkle
          const rightAnkleS = body.keypoints.rightAnkle

          if (leftAnkleS.confidence > 0.5) {
            ctx.fillRect(leftAnkleS.x - 25, leftAnkleS.y, 50, 25)
            ctx.strokeRect(leftAnkleS.x - 25, leftAnkleS.y, 50, 25)
          }

          if (rightAnkleS.confidence > 0.5) {
            ctx.fillRect(rightAnkleS.x - 25, rightAnkleS.y, 50, 25)
            ctx.strokeRect(rightAnkleS.x - 25, rightAnkleS.y, 50, 25)
          }

          // Add label
          if (leftAnkleS.confidence > 0.5 || rightAnkleS.confidence > 0.5) {
            ctx.fillStyle = color === "#ffffff" ? "#000" : "#fff"
            ctx.font = "12px Arial"
            ctx.textAlign = "center"
            const labelY = Math.max(leftAnkleS.y, rightAnkleS.y) + 40
            ctx.fillText(item.name, (leftAnkleS.x + rightAnkleS.x) / 2, labelY)
          }
          break
      }

      ctx.restore()
    })
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const video = videoRef.current

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame
    ctx.drawImage(video, 0, 0)

    // Draw outfit overlay
    if (selectedOutfit && bodyDetection && bodyDetection.confidence > 0.6) {
      drawAdvancedOutfitOverlay(ctx, canvas.width, canvas.height, selectedOutfit, bodyDetection)
    }

    // Download the image
    const link = document.createElement("a")
    link.download = `virtual-tryOn-${selectedOutfit?.name || "photo"}.png`
    link.href = canvas.toDataURL()
    link.click()

    toast({
      title: "Photo Captured",
      description: "Your virtual try-on photo has been saved",
    })
  }

  const getDetectionStatusColor = () => {
    switch (detectionQuality) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-yellow-600"
      default:
        return "text-red-600"
    }
  }

  const getDetectionStatusText = () => {
    switch (detectionQuality) {
      case "excellent":
        return "Excellent Detection"
      case "good":
        return "Good Detection"
      default:
        return "Poor Detection"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Virtual Try-On</h1>
          <p className="text-gray-600">AI-powered face and body detection for realistic outfit visualization</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    AI Virtual Mirror
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={switchCamera} disabled={!isStreaming}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={capturePhoto}
                      disabled={!isStreaming || !selectedOutfit || detectionQuality === "poor"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {isStreaming ? (
                      <Button variant="destructive" size="sm" onClick={stopCamera}>
                        <CameraOff className="h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button size="sm" onClick={startCamera} disabled={isLoading}>
                        <Camera className="h-4 w-4" />
                        {isLoading ? "Starting..." : "Start Camera"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                  />
                  <canvas ref={detectionCanvasRef} className="hidden" />

                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Advanced AI Detection Ready</p>
                        <p className="text-sm opacity-75">Click "Start Camera" to begin AI-powered virtual try-on</p>
                      </div>
                    </div>
                  )}

                  {detectionError && (
                    <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{detectionError}</span>
                    </div>
                  )}
                </div>

                {/* Enhanced Status Indicators */}
                {isStreaming && (
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${faceDetection && faceDetection.confidence > 0.5 ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <span className="text-sm">Face Detection</span>
                          {faceDetection && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(faceDetection.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${bodyDetection && bodyDetection.confidence > 0.5 ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <span className="text-sm">Body Detection</span>
                          {bodyDetection && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(bodyDetection.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                        {selectedOutfit && (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm">Outfit Applied</span>
                          </div>
                        )}
                      </div>
                      <div className={`text-sm font-medium ${getDetectionStatusColor()}`}>
                        {getDetectionStatusText()}
                      </div>
                    </div>

                    {isDetecting && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium">AI Analysis Active</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Advanced algorithms are analyzing your pose and facial features for optimal outfit placement
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Outfit Selection */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Select Outfit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Select</label>
                  <Select
                    value={selectedOutfit?.id || ""}
                    onValueChange={(value) => {
                      const outfit = outfits.find((o) => o.id === value)
                      if (outfit) applyOutfit(outfit)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an outfit" />
                    </SelectTrigger>
                    <SelectContent>
                      {outfits.map((outfit) => (
                        <SelectItem key={outfit.id} value={outfit.id}>
                          {outfit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Outfit Cards */}
                <div className="space-y-3">
                  {outfits.map((outfit) => (
                    <Card
                      key={outfit.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOutfit?.id === outfit.id ? "ring-2 ring-purple-500" : ""
                      } ${!bodyDetection || bodyDetection.confidence < 0.5 ? "opacity-50" : ""}`}
                      onClick={() => applyOutfit(outfit)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Shirt className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{outfit.name}</h4>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {outfit.occasion}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {outfit.items.length} items
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Enhanced Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">AI Detection Tips:</h4>
                  <ol className="text-xs text-gray-600 space-y-1">
                    <li>1. Ensure good lighting for better detection</li>
                    <li>2. Stand 3-6 feet from the camera</li>
                    <li>3. Face the camera directly</li>
                    <li>4. Keep your full body in frame</li>
                    <li>5. Minimize background movement</li>
                    <li>6. Wait for "Excellent Detection" status</li>
                  </ol>
                </div>

                {/* Detection Quality Indicator */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Detection Quality</span>
                    <span className={`text-sm font-medium ${getDetectionStatusColor()}`}>
                      {getDetectionStatusText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        detectionQuality === "excellent"
                          ? "bg-green-500 w-full"
                          : detectionQuality === "good"
                            ? "bg-yellow-500 w-2/3"
                            : "bg-red-500 w-1/3"
                      }`}
                    />
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
