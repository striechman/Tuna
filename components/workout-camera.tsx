"use client"

import { useRef, useEffect, useState } from "react"
import { AlertTriangle, Camera, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function WorkoutCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user")

  // Start camera when component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true)

        if (videoRef.current) {
          // Try to use the preferred camera
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: cameraFacing,
              width: { ideal: window.innerWidth },
              height: { ideal: window.innerHeight },
            },
          })

          videoRef.current.srcObject = stream
          setCameraActive(true)

          // Simulate loading the pose detection model
          setTimeout(() => {
            setIsLoading(false)
          }, 1500)
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Failed to access camera. Please check permissions.")
        setIsLoading(false)
      }
    }

    startCamera()

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraFacing])

  // Simulate pose detection with random points
  useEffect(() => {
    if (!cameraActive || !canvasRef.current || isLoading) return

    const interval = setInterval(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw pose detection points and lines
      drawPoseDetection(ctx, canvas.width, canvas.height)
    }, 100)

    return () => clearInterval(interval)
  }, [cameraActive, isLoading])

  // Handle canvas resize to match video dimensions
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth
        canvasRef.current.height = videoRef.current.clientHeight
      }
    }

    window.addEventListener("resize", handleResize)
    // Initial sizing
    setTimeout(handleResize, 100)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw simulated pose detection
  const drawPoseDetection = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Define body joints with slight random movement
    const joints = [
      { x: width * 0.5, y: height * 0.2 + Math.random() * 5 }, // head
      { x: width * 0.5, y: height * 0.3 + Math.random() * 5 }, // neck
      { x: width * 0.5, y: height * 0.45 + Math.random() * 5 }, // torso
      { x: width * 0.5, y: height * 0.6 + Math.random() * 5 }, // hips
      { x: width * 0.4 + Math.random() * 5, y: height * 0.3 + Math.random() * 5 }, // left shoulder
      { x: width * 0.6 + Math.random() * 5, y: height * 0.3 + Math.random() * 5 }, // right shoulder
      { x: width * 0.35 + Math.random() * 5, y: height * 0.45 + Math.random() * 5 }, // left elbow
      { x: width * 0.65 + Math.random() * 5, y: height * 0.45 + Math.random() * 5 }, // right elbow
      { x: width * 0.3 + Math.random() * 5, y: height * 0.55 + Math.random() * 5 }, // left hand
      { x: width * 0.7 + Math.random() * 5, y: height * 0.55 + Math.random() * 5 }, // right hand
      { x: width * 0.4 + Math.random() * 5, y: height * 0.75 + Math.random() * 5 }, // left knee
      { x: width * 0.6 + Math.random() * 5, y: height * 0.75 + Math.random() * 5 }, // right knee
      { x: width * 0.4 + Math.random() * 5, y: height * 0.9 + Math.random() * 5 }, // left foot
      { x: width * 0.6 + Math.random() * 5, y: height * 0.9 + Math.random() * 5 }, // right foot
    ]

    // Draw joints
    ctx.fillStyle = "#00E676"
    joints.forEach((joint) => {
      ctx.beginPath()
      ctx.arc(joint.x, joint.y, 6, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw connecting lines
    ctx.strokeStyle = "#00E676"
    ctx.lineWidth = 3

    // Connect head to neck
    ctx.beginPath()
    ctx.moveTo(joints[0].x, joints[0].y)
    ctx.lineTo(joints[1].x, joints[1].y)

    // Connect neck to shoulders
    ctx.moveTo(joints[1].x, joints[1].y)
    ctx.lineTo(joints[4].x, joints[4].y)
    ctx.moveTo(joints[1].x, joints[1].y)
    ctx.lineTo(joints[5].x, joints[5].y)

    // Connect shoulders to elbows
    ctx.moveTo(joints[4].x, joints[4].y)
    ctx.lineTo(joints[6].x, joints[6].y)
    ctx.moveTo(joints[5].x, joints[5].y)
    ctx.lineTo(joints[7].x, joints[7].y)

    // Connect elbows to hands
    ctx.moveTo(joints[6].x, joints[6].y)
    ctx.lineTo(joints[8].x, joints[8].y)
    ctx.moveTo(joints[7].x, joints[7].y)
    ctx.lineTo(joints[9].x, joints[9].y)

    // Connect neck to torso to hips
    ctx.moveTo(joints[1].x, joints[1].y)
    ctx.lineTo(joints[2].x, joints[2].y)
    ctx.lineTo(joints[3].x, joints[3].y)

    // Connect hips to knees
    ctx.moveTo(joints[3].x, joints[3].y)
    ctx.lineTo(joints[10].x, joints[10].y)
    ctx.moveTo(joints[3].x, joints[3].y)
    ctx.lineTo(joints[11].x, joints[11].y)

    // Connect knees to feet
    ctx.moveTo(joints[10].x, joints[10].y)
    ctx.lineTo(joints[12].x, joints[12].y)
    ctx.moveTo(joints[11].x, joints[11].y)
    ctx.lineTo(joints[13].x, joints[13].y)

    ctx.stroke()
  }

  // Toggle camera between front and back
  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // Stop current camera
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())

      // Switch camera facing mode
      setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover bg-black"
        onCanPlay={() => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.clientWidth
            canvasRef.current.height = videoRef.current.clientHeight
          }
        }}
      />

      {/* Pose detection overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {/* Camera toggle button */}
      <button
        onClick={toggleCamera}
        className="absolute top-20 left-4 z-20 bg-tnua-gray/80 text-white p-3 rounded-full"
        aria-label="Toggle camera"
      >
        <Camera className="h-5 w-5" />
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-tnua-dark z-30"
          initial={{ opacity: 1 }}
          animate={{ opacity: cameraActive ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TnuaLogo size="lg" className="mb-8" />
          <div className="relative">
            <RefreshCw className="h-10 w-10 text-tnua-green animate-spin" />
            <div className="absolute inset-0 bg-tnua-green opacity-20 blur-xl rounded-full animate-pulse-slow"></div>
          </div>
          <p className="mt-6 text-lg font-medium">Loading pose detection...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your workout experience</p>
        </motion.div>
      )}

      {/* Error message or camera access prompt */}
      {!cameraActive && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark z-30">
          <div className="text-center p-6 bg-tnua-gray/80 rounded-lg max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-tnua-green mx-auto mb-4" />
            <p className="text-xl font-medium mb-2">{error || "Camera access required"}</p>
            <p className="text-gray-400 mb-6">
              {error ? "Please refresh and try again" : "Please allow camera access to use TNUA workout tracking"}
            </p>
            <button onClick={() => window.location.reload()} className="tnua-button-primary py-3 px-6">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
