"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { loadMediaPipeModules } from "@/utils/mediapipe-loader"

interface PoseTrackerProps {
  onPoseDetected?: (landmarks: any[]) => void
  cameraFacing?: "user" | "environment"
  onError?: (error: string) => void
}

export default function PoseTracker({ onPoseDetected, cameraFacing = "environment", onError }: PoseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // References to store instances
  const poseRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const modulesRef = useRef<any>(null)

  // Define setCanvasDimensions outside of initializePose so it's in scope for cleanup
  const setCanvasDimensions = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.clientWidth
      canvasRef.current.height = videoRef.current.clientHeight
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    let isMounted = true

    const initializePose = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return

        // Initial sizing
        setCanvasDimensions()
        window.addEventListener("resize", setCanvasDimensions)

        // Load MediaPipe modules
        const modules = await loadMediaPipeModules()
        if (!isMounted) return

        modulesRef.current = modules

        // Initialize pose detection with a simpler configuration
        const pose = new modules.Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
          },
        })

        // Use a simpler configuration that doesn't rely on complex model loading
        pose.setOptions({
          modelComplexity: 0, // Use the simplest model (0 instead of 1)
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        pose.onResults((results: any) => {
          if (!canvasRef.current || !modulesRef.current) return

          const canvasElement = canvasRef.current
          const canvasCtx = canvasElement.getContext("2d")
          if (!canvasCtx) return

          // Clear canvas
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)

          // Draw pose landmarks
          if (results.poseLandmarks) {
            // Draw connectors
            modulesRef.current.drawConnectors(canvasCtx, results.poseLandmarks, modulesRef.current.POSE_CONNECTIONS, {
              color: "#00E676",
              lineWidth: 4,
            })

            // Draw landmarks
            modulesRef.current.drawLandmarks(canvasCtx, results.poseLandmarks, {
              color: "#00E676",
              lineWidth: 2,
              radius: 6,
            })

            // Call callback if provided
            if (onPoseDetected) {
              onPoseDetected(results.poseLandmarks)
            }
          }
        })

        // Store pose instance
        poseRef.current = pose

        // Initialize camera
        if (videoRef.current) {
          const camera = new modules.Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                try {
                  await poseRef.current.send({ image: videoRef.current })
                } catch (e) {
                  console.error("Error sending frame to pose detector:", e)
                }
              }
            },
            facingMode: cameraFacing,
            width: window.innerWidth,
            height: window.innerHeight,
          })

          // Store camera instance
          cameraRef.current = camera

          // Start camera
          await camera.start()

          if (isMounted) {
            setIsInitialized(true)
          }
        }
      } catch (err) {
        console.error("Error initializing pose detection:", err)
        const errorMessage = `Failed to initialize pose detection: ${err instanceof Error ? err.message : String(err)}`

        if (isMounted) {
          setError(errorMessage)
          if (onError) {
            onError(errorMessage)
          }
        }
      }
    }

    // Initialize with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializePose()
    }, 1000)

    // Cleanup function
    return () => {
      isMounted = false
      clearTimeout(timer)

      // Remove event listener
      window.removeEventListener("resize", setCanvasDimensions)

      // Stop camera
      if (cameraRef.current) {
        try {
          cameraRef.current.stop()
        } catch (e) {
          console.error("Error stopping camera:", e)
        }
      }
    }
  }, [onPoseDetected, cameraFacing, onError, setCanvasDimensions])

  // Effect to handle camera facing mode changes
  useEffect(() => {
    if (isInitialized && cameraRef.current && modulesRef.current) {
      // Stop current camera
      try {
        cameraRef.current.stop()
      } catch (e) {
        console.error("Error stopping camera:", e)
      }

      // Reinitialize with new facing mode
      if (videoRef.current) {
        try {
          const camera = new modulesRef.current.Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                try {
                  await poseRef.current.send({ image: videoRef.current })
                } catch (e) {
                  console.error("Error sending frame to pose detector:", e)
                }
              }
            },
            facingMode: cameraFacing,
            width: window.innerWidth,
            height: window.innerHeight,
          })

          cameraRef.current = camera
          camera.start()
        } catch (e) {
          console.error("Error reinitializing camera:", e)
          setError(`Failed to switch camera: ${e instanceof Error ? e.message : String(e)}`)
          if (onError) {
            onError(`Failed to switch camera: ${e instanceof Error ? e.message : String(e)}`)
          }
        }
      }
    }
  }, [cameraFacing, isInitialized, onError])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        playsInline
        autoPlay
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {error && !onError && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/80 z-20">
          <div className="bg-tnua-gray/80 p-4 rounded-md max-w-md text-center">
            <p className="text-white mb-2">{error}</p>
            <button className="tnua-button-primary py-2 px-4" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
