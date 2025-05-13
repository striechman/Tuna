"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, RotateCcw, ZoomIn, ZoomOut, Minus, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedPreloader from "./animated-preloader"
import PoseRenderer from "./pose-renderer"
import poseDetectionService, { type PoseData } from "@/services/pose-detection-service"

interface WorkoutCameraProps {
  videoRef?: React.RefObject<HTMLVideoElement>
  onPoseDetectionStatus?: (detected: boolean, landmarks: PoseData[]) => void
  onError?: (error: string) => void
}

export default function WorkoutCamera({ videoRef, onPoseDetectionStatus, onError }: WorkoutCameraProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showControls, setShowControls] = useState(true) // Start with controls visible
  const [cameraReady, setCameraReady] = useState(false)
  const [poses, setPoses] = useState<PoseData[]>([])

  // Internal refs
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef || internalVideoRef
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    const newFacingMode = cameraFacing === "user" ? "environment" : "user"
    setCameraFacing(newFacingMode)

    try {
      await poseDetectionService.changeCameraFacingMode(newFacingMode)
    } catch (error) {
      console.error("Error toggling camera:", error)
    }
  }, [cameraFacing])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1))
  }, [])

  // Apply zoom effect to video
  useEffect(() => {
    if (zoomContainerRef.current) {
      zoomContainerRef.current.style.transform = `scale(${zoomLevel})`
      zoomContainerRef.current.style.transition = "transform 0.3s ease-out"
    }
  }, [zoomLevel])

  // Initialize pose detection service
  useEffect(() => {
    poseDetectionService.subscribe({
      onPoseDetected: (detectedPoses) => {
        // Check if valid poses were detected
        const hasValidPose =
          detectedPoses.length > 0 && detectedPoses[0].keypoints.length > 0 && detectedPoses[0].score > 0.2

        // Update poses state
        setPoses(detectedPoses)

        // Notify parent component
        if (onPoseDetectionStatus) {
          onPoseDetectionStatus(hasValidPose, detectedPoses)
        }
      },
      onError: (errorMessage) => {
        console.error("Pose detection error:", errorMessage)
        setError(errorMessage)

        // Pass error to parent component if callback exists
        if (onError) {
          onError(errorMessage)
        }
      },
    })

    // Initialize the service
    poseDetectionService
      .initialize()
      .then((success) => {
        if (!success) {
          setError("Could not initialize pose detection")
        }
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Unknown initialization error"
        setError(errorMessage)
        if (onError) onError(errorMessage)
      })

    return () => {
      // Clean up on unmount
      poseDetectionService.stopCamera()
    }
  }, [onPoseDetectionStatus, onError])

  // Start camera when component mounts
  useEffect(() => {
    let isMounted = true

    // Only try to start camera if we have a video element
    if (!actualVideoRef.current) return

    // Wait a moment before starting camera
    setTimeout(async () => {
      if (!isMounted) return

      try {
        setIsLoading(true)

        // Start camera
        const success = await poseDetectionService.startCamera(actualVideoRef.current, cameraFacing)

        if (success) {
          // Camera started successfully
          setCameraReady(true)
          setTimeout(() => {
            if (isMounted) setIsLoading(false)
          }, 1000)
        } else {
          // Failed to start camera
          throw new Error("Failed to start camera")
        }
      } catch (err) {
        if (!isMounted) return
        const errorMessage = err instanceof Error ? err.message : "Unknown camera error"
        setError(errorMessage)
        setIsLoading(false)
        if (onError) onError(errorMessage)
      }
    }, 500)

    return () => {
      isMounted = false
      poseDetectionService.stopCamera()
    }
  }, [actualVideoRef, cameraFacing, onError])

  // Restart camera when facing mode changes
  useEffect(() => {
    if (cameraReady && actualVideoRef.current) {
      poseDetectionService.changeCameraFacingMode(cameraFacing)
    }
  }, [cameraFacing, cameraReady, actualVideoRef])

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      {isLoading && <AnimatedPreloader />}

      {/* Zoom container */}
      <div ref={zoomContainerRef} className="absolute inset-0 w-full h-full origin-center">
        <video
          ref={actualVideoRef}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          playsInline
          muted
        />
      </div>

      {/* Render detected poses */}
      <PoseRenderer poses={poses} videoRef={actualVideoRef} color="#00E0FF" lineWidth={4} pointRadius={6} />

      {/* Zoom indicator */}
      <AnimatePresence>
        {zoomLevel > 1 && (
          <motion.div
            className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium">{zoomLevel.toFixed(1)}x</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-32 right-4 z-30 bg-black/60 backdrop-blur-md rounded-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col">
              <button onClick={zoomIn} className="p-3 hover:bg-gray-800 transition-colors" disabled={zoomLevel >= 3}>
                <ZoomIn className="h-6 w-6" />
              </button>
              <button onClick={zoomOut} className="p-3 hover:bg-gray-800 transition-colors" disabled={zoomLevel <= 1}>
                <ZoomOut className="h-6 w-6" />
              </button>
              <button onClick={toggleCamera} className="p-3 hover:bg-gray-800 transition-colors">
                <RotateCcw className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom slider (vertical) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-32 left-4 z-30 bg-black/60 backdrop-blur-md rounded-full p-2 h-40"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col h-full items-center justify-between">
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                disabled={zoomLevel >= 3}
              >
                <Plus className="h-4 w-4" />
              </button>

              <div className="flex-1 w-1 bg-gray-700 rounded-full my-2 relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-full"
                  style={{
                    height: `${((zoomLevel - 1) / 2) * 100}%`,
                  }}
                />
                <div
                  className="absolute w-4 h-4 bg-white rounded-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-800"
                  style={{
                    bottom: `${((zoomLevel - 1) / 2) * 100}%`,
                  }}
                />
              </div>

              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                disabled={zoomLevel <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle controls button */}
      <button
        onClick={() => setShowControls((prev) => !prev)}
        className="absolute bottom-16 right-4 z-30 bg-black/60 backdrop-blur-md p-3 rounded-full"
        aria-label="Camera controls"
      >
        <Camera className="h-6 w-6" />
      </button>

      {/* Error message */}
      {error && !onError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-40">
          <div className="text-center p-6 bg-gray-900 rounded-lg max-w-md mx-auto">
            <p className="text-xl font-medium mb-4 text-red-400">Camera loading error</p>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-tnua-green text-black font-bold py-3 px-6 rounded-full"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
