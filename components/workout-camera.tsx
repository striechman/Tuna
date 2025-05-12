"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Camera, RefreshCw, CameraOff } from "lucide-react"
import { motion } from "framer-motion"
import TnuaLogo from "@/components/ui/tnua-logo"
import MockPoseTracker from "./mock-pose-tracker"

interface WorkoutCameraProps {
  cameraRef?: React.RefObject<HTMLVideoElement>
}

export default function WorkoutCamera({ cameraRef }: WorkoutCameraProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [cameraReady, setCameraReady] = useState(false)

  // Internal ref if no external ref is provided
  const internalCameraRef = useRef<HTMLVideoElement>(null)
  const actualCameraRef = cameraRef || internalCameraRef

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

  // Handle camera ready event
  const handleCameraReady = () => {
    console.log("Camera is ready")
    setCameraReady(true)

    // Hide loading screen with a slight delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Handle pose detection errors
  const handlePoseError = (errorMessage: string) => {
    console.error("Pose detection error:", errorMessage)
    setError(errorMessage)
    setIsLoading(false)
  }

  // Toggle camera between front and back
  const toggleCamera = () => {
    console.log("Toggling camera from", cameraFacing, "to", cameraFacing === "user" ? "environment" : "user")
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="relative w-full h-full">
      {/* Pose tracker component */}
      <MockPoseTracker
        onPoseDetected={handlePoseDetected}
        cameraFacing={cameraFacing}
        onError={handlePoseError}
        onCameraReady={handleCameraReady}
        videoRef={actualCameraRef}
      />

      {/* Camera toggle button - made larger and more visible */}
      <motion.button
        onClick={toggleCamera}
        className="absolute bottom-24 left-6 z-30 bg-tnua-green text-tnua-dark p-3 rounded-full shadow-lg"
        aria-label={cameraFacing === "user" ? "החלף למצלמה אחורית" : "החלף למצלמה קדמית"}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        whileTap={{ scale: 0.9 }}
      >
        <Camera className="h-5 w-5" />
      </motion.button>

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
          <p className="mt-6 text-lg font-medium">טוען את זיהוי התנועה...</p>
          <p className="text-gray-400 text-sm mt-2">מכין את חווית האימון שלך</p>
        </motion.div>
      )}

      {/* Camera permission error message */}
      {error && error.includes("camera") && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/90 backdrop-blur-sm z-40">
          <div className="text-center p-6 bg-tnua-gray rounded-lg max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <CameraOff className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xl font-medium mb-4">לא ניתן לגשת למצלמה</p>
            <p className="text-gray-300 mb-6">אנא ודא שנתת הרשאה לגישה למצלמה. בדוק את הגדרות הדפדפן שלך ונסה שוב.</p>
            <button onClick={() => window.location.reload()} className="tnua-button-primary py-3 px-6">
              נסה שוב
            </button>
          </div>
        </div>
      )}

      {/* Other error message */}
      {error && !error.includes("camera") && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/80 backdrop-blur-sm z-40">
          <div className="text-center p-6 bg-tnua-gray rounded-lg max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-tnua-green mx-auto mb-4" />
            <p className="text-xl font-medium mb-2">{error}</p>
            <p className="text-gray-400 mb-6">אנא רענן ונסה שוב</p>
            <button onClick={() => window.location.reload()} className="tnua-button-primary py-3 px-6">
              נסה שוב
            </button>
          </div>
        </div>
      )}

      {/* Camera not ready message */}
      {!isLoading && !cameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/80 backdrop-blur-sm z-40">
          <div className="text-center p-6 bg-tnua-gray rounded-lg max-w-md mx-auto">
            <Camera className="h-12 w-12 text-tnua-green mx-auto mb-4" />
            <p className="text-xl font-medium mb-2">מחכה לאישור מצלמה</p>
            <p className="text-gray-400 mb-6">אנא אשר את הגישה למצלמה כדי להמשיך</p>
            <button onClick={() => window.location.reload()} className="tnua-button-primary py-3 px-6">
              נסה שוב
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
