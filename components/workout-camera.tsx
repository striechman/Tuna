"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, RotateCcw, ZoomIn, ZoomOut, Minus, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedPreloader from "./animated-preloader"
import MockPoseTracker from "@/components/mock-pose-tracker"

interface WorkoutCameraProps {
  videoRef?: React.RefObject<HTMLVideoElement>
  onPoseDetectionStatus?: (detected: boolean, landmarks: any[]) => void
}

export default function WorkoutCamera({ videoRef, onPoseDetectionStatus }: WorkoutCameraProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [useFallback, setUseFallback] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [isDraggingZoom, setIsDraggingZoom] = useState(false)
  const [initialTouchY, setInitialTouchY] = useState(0)
  const [initialZoom, setInitialZoom] = useState(1)

  // Internal refs
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef || internalVideoRef
  const streamRef = useRef<MediaStream | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Toggle camera
  const toggleCamera = useCallback(() => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
  }, [])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 1))
  }, [])

  // Apply zoom effect to video
  useEffect(() => {
    if (actualVideoRef.current) {
      actualVideoRef.current.style.transform = `scale(${zoomLevel})`
      actualVideoRef.current.style.transition = "transform 0.3s ease-out"
    }
  }, [zoomLevel, actualVideoRef])

  // Handle touch-based zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Two finger touch - prepare for pinch zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)

        setIsDraggingZoom(true)
        setInitialTouchY(distance)
        setInitialZoom(zoomLevel)
      }
    },
    [zoomLevel],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDraggingZoom && e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)

        // Calculate zoom based on pinch distance
        const zoomDelta = (distance - initialTouchY) / 200
        const newZoom = Math.max(1, Math.min(3, initialZoom + zoomDelta))
        setZoomLevel(newZoom)
      }
    },
    [isDraggingZoom, initialTouchY, initialZoom],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDraggingZoom(false)
  }, [])

  // Handle errors from the mock pose tracker
  const handleMockError = useCallback((errorMessage: string) => {
    console.error("Mock pose tracker error:", errorMessage)
    setError(errorMessage)
  }, [])

  // Handle pose detection from the mock tracker
  const handleMockPoseDetection = useCallback(
    (landmarks: any[]) => {
      if (onPoseDetectionStatus) {
        // Consider all poses from the mock tracker as "detected"
        onPoseDetectionStatus(true, landmarks)
      }
    },
    [onPoseDetectionStatus],
  )

  // Handle camera ready event
  const handleCameraReady = useCallback(() => {
    setCameraReady(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Add a small delay to ensure smooth transition
  }, [])

  // Try to load TensorFlow.js and set up pose detection
  useEffect(() => {
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout

    const loadTensorFlow = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") return

        // Set a timeout to switch to fallback if loading takes too long
        loadingTimeout = setTimeout(() => {
          if (isMounted) {
            console.log("TensorFlow.js loading timeout, switching to fallback")
            setUseFallback(true)
          }
        }, 5000) // 5 seconds timeout

        // Try to load TensorFlow.js from the window object
        // This assumes the scripts are loaded in layout.tsx
        await new Promise<void>((resolve, reject) => {
          // Check if TensorFlow is already loaded
          if (window.tf) {
            resolve()
            return
          }

          // If not loaded, set up a check interval
          const checkInterval = setInterval(() => {
            if (window.tf) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 500)

          // Set a timeout for this check
          setTimeout(() => {
            clearInterval(checkInterval)
            reject(new Error("TensorFlow.js loading timeout"))
          }, 4000)
        })

        console.log("TensorFlow.js loaded successfully")

        // Clear the timeout since TensorFlow loaded successfully
        clearTimeout(loadingTimeout)

        // At this point, we've confirmed TensorFlow.js is loaded
        // We'll still use the fallback for simplicity and reliability
        if (isMounted) {
          setUseFallback(true)
        }
      } catch (error) {
        console.error("Error loading TensorFlow.js:", error)

        if (isMounted) {
          setUseFallback(true)
        }
      }
    }

    loadTensorFlow()

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
    }
  }, [])

  // If we're using the fallback, render the mock pose tracker
  if (useFallback) {
    return (
      <div
        className="relative w-full h-full"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && <AnimatedPreloader />}

        <MockPoseTracker
          videoRef={actualVideoRef}
          cameraFacing={cameraFacing}
          onPoseDetected={handleMockPoseDetection}
          onError={handleMockError}
          onCameraReady={handleCameraReady}
        />

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
        {error && (
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

  // Show loading screen while initializing
  return <AnimatedPreloader />
}
