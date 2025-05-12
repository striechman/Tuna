"use client"

import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Camera, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import TnuaLogo from "@/components/ui/tnua-logo"
import MockPoseTracker from "./mock-pose-tracker"

export default function WorkoutCamera() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")

  // Timeout ref for loading state
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set a timeout to hide the loading screen after a maximum time
  useEffect(() => {
    const maxLoadingTime = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
      }
    }, 10000) // 10 seconds max loading time

    return () => clearTimeout(maxLoadingTime)
  }, [isLoading])

  // Handle pose detection initialization
  const handlePoseDetected = (landmarks: any[]) => {
    // If we get landmarks, we know pose detection is working
    if (landmarks && landmarks.length > 0 && isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Set a timeout to hide the loading screen
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  // Handle pose detection errors
  const handlePoseError = (errorMessage: string) => {
    console.error("Pose detection error:", errorMessage)
    setError(errorMessage)
    setIsLoading(false)
  }

  // Toggle camera between front and back
  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="relative w-full h-full">
      {/* Pose tracker component */}
      <MockPoseTracker onPoseDetected={handlePoseDetected} cameraFacing={cameraFacing} onError={handlePoseError} />

      {/* Camera toggle button */}
      <button
        onClick={toggleCamera}
        className="absolute top-20 left-4 z-20 bg-tnua-gray/80 text-white p-3 rounded-full"
        aria-label="Toggle camera"
        disabled={isLoading}
      >
        <Camera className="h-5 w-5" />
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-tnua-dark z-30"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
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

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/80 backdrop-blur-sm z-40">
          <div className="text-center p-6 bg-tnua-gray rounded-lg max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-tnua-green mx-auto mb-4" />
            <p className="text-xl font-medium mb-2">{error}</p>
            <p className="text-gray-400 mb-6">Please refresh and try again</p>
            <button onClick={() => window.location.reload()} className="tnua-button-primary py-3 px-6">
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
