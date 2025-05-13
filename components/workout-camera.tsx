"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Camera, RotateCcw, ZoomIn, ZoomOut, Video, Smartphone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedPreloader from "./animated-preloader"
import PoseRenderer from "./pose-renderer"
import poseDetectionService, { type PoseData } from "@/services/pose-detection-service"
import exerciseDetectionService, { type ExerciseState } from "@/services/exercise-detection-service"
import emergencyDetectionService, { type EmergencyState } from "@/services/emergency-detection-service"

interface WorkoutCameraProps {
  videoRef?: React.RefObject<HTMLVideoElement>
  onPoseDetectionStatus?: (detected: boolean, landmarks: PoseData[]) => void
  onExerciseDetected?: (state: ExerciseState) => void
  onEmergencyDetected?: (state: EmergencyState) => void
  onError?: (error: string) => void
}

type CameraType = "webcam" | "mobile"

export default function WorkoutCamera({
  videoRef,
  onPoseDetectionStatus,
  onExerciseDetected,
  onEmergencyDetected,
  onError,
}: WorkoutCameraProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)
  const [poses, setPoses] = useState<PoseData[]>([])
  const [cameraType, setCameraType] = useState<CameraType>("webcam")
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])

  // Internal refs
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef || internalVideoRef
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === "videoinput")
        setAvailableCameras(videoDevices)
      } catch (err) {
        console.error("Error getting cameras:", err)
      }
    }
    getCameras()
  }, [])

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

  // Switch camera type
  const switchCameraType = useCallback(async () => {
    const newType = cameraType === "webcam" ? "mobile" : "webcam"
    setCameraType(newType)
    
    // Reset camera
    poseDetectionService.stopCamera()
    setCameraReady(false)
    setIsLoading(true)

    try {
      if (actualVideoRef.current) {
        const success = await poseDetectionService.startCamera(
          actualVideoRef.current,
          newType === "mobile" ? "environment" : "user"
        )
        if (success) {
          setCameraReady(true)
          setTimeout(() => setIsLoading(false), 1000)
        }
      }
    } catch (error) {
      console.error("Error switching camera type:", error)
    }
  }, [cameraType, actualVideoRef])

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

  // Initialize services
  useEffect(() => {
    // Initialize pose detection service
    poseDetectionService.subscribe({
      onPoseDetected: (detectedPoses) => {
        const hasValidPose =
          detectedPoses.length > 0 && detectedPoses[0].keypoints.length > 0 && detectedPoses[0].score > 0.2

        setPoses(detectedPoses)

        detectedPoses.forEach((pose) => {
          exerciseDetectionService.processPose(pose)
          emergencyDetectionService.processPose(pose)
        })

        if (onPoseDetectionStatus) {
          onPoseDetectionStatus(hasValidPose, detectedPoses)
        }
      },
      onError: (errorMessage) => {
        console.error("Pose detection error:", errorMessage)
        setError(errorMessage)
        if (onError) onError(errorMessage)
      },
    })

    // Initialize exercise detection service
    exerciseDetectionService.subscribe({
      onExerciseDetected: (state) => {
        if (onExerciseDetected) onExerciseDetected(state)
      },
      onError: (errorMessage) => {
        console.error("Exercise detection error:", errorMessage)
        if (onError) onError(errorMessage)
      },
    })

    // Initialize emergency detection service
    emergencyDetectionService.subscribe({
      onEmergencyDetected: (state) => {
        if (onEmergencyDetected) onEmergencyDetected(state)
      },
      onEmergencyResolved: () => {
        if (onEmergencyDetected) {
          onEmergencyDetected({ type: "none", confidence: 0, lastDetectionTime: 0, isActive: false })
        }
      },
      onError: (errorMessage) => {
        console.error("Emergency detection error:", errorMessage)
        if (onError) onError(errorMessage)
      },
    })

    // Initialize the services
    Promise.all([poseDetectionService.initialize()])
      .then(([poseSuccess]) => {
        if (!poseSuccess) {
          setError("Could not initialize pose detection")
        }
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : "Unknown initialization error"
        setError(errorMessage)
        if (onError) onError(errorMessage)
      })

    return () => {
      poseDetectionService.stopCamera()
      exerciseDetectionService.reset()
      emergencyDetectionService.reset()
    }
  }, [onPoseDetectionStatus, onExerciseDetected, onEmergencyDetected, onError])

  // Start camera when component mounts
  useEffect(() => {
    let isMounted = true

    if (!actualVideoRef.current) return

    setTimeout(async () => {
      if (!isMounted) return

      try {
        setIsLoading(true)

        const success = await poseDetectionService.startCamera(
          actualVideoRef.current,
          cameraType === "mobile" ? "environment" : "user"
        )

        if (success) {
          setCameraReady(true)
          setTimeout(() => {
            if (isMounted) setIsLoading(false)
          }, 1000)
        } else {
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
  }, [actualVideoRef, cameraType, onError])

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
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
              <button onClick={zoomOut} className="p-3 hover:bg-gray-800 transition-colors" disabled={zoomLevel <= 1}>
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <button onClick={toggleCamera} className="p-3 hover:bg-gray-800 transition-colors">
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
              <button onClick={switchCameraType} className="p-3 hover:bg-gray-800 transition-colors">
                {cameraType === "webcam" ? (
                  <Smartphone className="w-5 h-5 text-white" />
                ) : (
                  <Video className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
