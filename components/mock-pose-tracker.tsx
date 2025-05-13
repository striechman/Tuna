"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"

interface MockPoseTrackerProps {
  onPoseDetected?: (landmarks: any[]) => void
  cameraFacing?: "user" | "environment"
  onError?: (error: string) => void
  onCameraReady?: () => void
  videoRef?: React.RefObject<HTMLVideoElement>
}

export default function MockPoseTracker({
  onPoseDetected,
  cameraFacing = "environment",
  onError,
  onCameraReady,
  videoRef,
}: MockPoseTrackerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef || internalVideoRef

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraAttempts, setCameraAttempts] = useState(0)
  const [videoReady, setVideoReady] = useState(false)
  const [useFallbackMode, setUseFallbackMode] = useState(false)

  // Define setCanvasDimensions outside of initializePose so it's in scope for cleanup
  const setCanvasDimensions = useCallback(() => {
    if (canvasRef.current && actualVideoRef.current) {
      canvasRef.current.width = actualVideoRef.current.clientWidth
      canvasRef.current.height = actualVideoRef.current.clientHeight
    }
  }, [actualVideoRef])

  // Generate mock pose landmarks
  const generateMockPoseLandmarks = useCallback(() => {
    // Create a basic human pose with 33 landmarks (MediaPipe Pose format)
    const landmarks = []

    // Head landmarks (0-10)
    landmarks.push({ x: 0.5, y: 0.2, z: 0, visibility: 0.9 }) // Nose
    for (let i = 1; i < 11; i++) {
      landmarks.push({
        x: 0.5 + (Math.random() * 0.1 - 0.05),
        y: 0.2 + (Math.random() * 0.1 - 0.05),
        z: 0,
        visibility: 0.9,
      })
    }

    // Shoulders (11-12)
    landmarks.push({ x: 0.4, y: 0.3, z: 0, visibility: 0.9 }) // Left shoulder
    landmarks.push({ x: 0.6, y: 0.3, z: 0, visibility: 0.9 }) // Right shoulder

    // Arms (13-22)
    landmarks.push({ x: 0.3, y: 0.4, z: 0, visibility: 0.9 }) // Left elbow
    landmarks.push({ x: 0.7, y: 0.4, z: 0, visibility: 0.9 }) // Right elbow
    landmarks.push({ x: 0.25, y: 0.5, z: 0, visibility: 0.9 }) // Left wrist
    landmarks.push({ x: 0.75, y: 0.5, z: 0, visibility: 0.9 }) // Right wrist

    // Add slight movement to the arms
    const time = Date.now() / 1000
    const armMovement = Math.sin(time) * 0.05

    landmarks[13].y += armMovement
    landmarks[14].y -= armMovement
    landmarks[15].y += armMovement * 1.5
    landmarks[16].y -= armMovement * 1.5

    // Add remaining hand landmarks (17-22)
    for (let i = 17; i < 23; i++) {
      landmarks.push({
        x: i < 20 ? 0.25 + (Math.random() * 0.05 - 0.025) : 0.75 + (Math.random() * 0.05 - 0.025),
        y: 0.55 + (Math.random() * 0.05 - 0.025),
        z: 0,
        visibility: 0.8,
      })
    }

    // Hips (23-24)
    landmarks.push({ x: 0.45, y: 0.6, z: 0, visibility: 0.9 }) // Left hip
    landmarks.push({ x: 0.55, y: 0.6, z: 0, visibility: 0.9 }) // Right hip

    // Legs (25-32)
    landmarks.push({ x: 0.45, y: 0.75, z: 0, visibility: 0.9 }) // Left knee
    landmarks.push({ x: 0.55, y: 0.75, z: 0, visibility: 0.9 }) // Right knee
    landmarks.push({ x: 0.45, y: 0.9, z: 0, visibility: 0.9 }) // Left ankle
    landmarks.push({ x: 0.55, y: 0.9, z: 0, visibility: 0.9 }) // Right ankle

    // Add slight movement to the legs for a "breathing" effect
    const legMovement = Math.sin(time * 0.5) * 0.01

    landmarks[25].y += legMovement
    landmarks[26].y += legMovement
    landmarks[27].y += legMovement
    landmarks[28].y += legMovement

    // Add remaining foot landmarks (29-32)
    for (let i = 29; i < 33; i++) {
      landmarks.push({
        x: i < 31 ? 0.45 + (Math.random() * 0.02 - 0.01) : 0.55 + (Math.random() * 0.02 - 0.01),
        y: 0.95 + (Math.random() * 0.02 - 0.01),
        z: 0,
        visibility: 0.8,
      })
    }

    return landmarks
  }, [])

  // Draw pose landmarks on canvas
  const drawPoseLandmarks = useCallback((landmarks: any[]) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections (simplified)
    const connections = [
      // Torso
      [11, 12],
      [11, 23],
      [12, 24],
      [23, 24],
      // Arms
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      // Legs
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ]

    // Draw connections
    ctx.strokeStyle = "#00E0FF" // Blue glow color
    ctx.lineWidth = 4
    ctx.shadowColor = "#00E0FF"
    ctx.shadowBlur = 10

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]

      ctx.beginPath()
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height)
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height)
      ctx.stroke()
    })

    // Draw landmarks
    ctx.fillStyle = "#00E0FF"

    landmarks.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Reset shadow for performance
    ctx.shadowBlur = 0
  }, [])

  // Animation loop for mock pose detection
  const animateMockPose = useCallback(() => {
    const landmarks = generateMockPoseLandmarks()
    drawPoseLandmarks(landmarks)

    if (onPoseDetected) {
      onPoseDetected(landmarks)
    }

    animationFrameRef.current = requestAnimationFrame(animateMockPose)
  }, [drawPoseLandmarks, generateMockPoseLandmarks, onPoseDetected])

  // Start fallback mode without camera
  const startFallbackMode = useCallback(() => {
    console.log("Starting fallback mode without camera")
    setUseFallbackMode(true)

    // Set canvas dimensions
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth
      canvasRef.current.height = containerRef.current.clientHeight
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateMockPose)
    setIsInitialized(true)

    // Notify parent component
    if (onCameraReady) {
      onCameraReady()
    }
  }, [animateMockPose, onCameraReady])

  // Function to start camera with specific constraints
  const startCamera = useCallback(async () => {
    if (!actualVideoRef.current) return

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // If we've tried too many times, use fallback mode
      if (cameraAttempts >= 3) {
        startFallbackMode()
        return
      }

      // Try to get all video devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")

      console.log("Available video devices:", videoDevices)

      // Set up constraints
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      // If we have specific device IDs, we can try to use them
      if (videoDevices.length > 1) {
        // For mobile devices, try to select the right camera based on facing mode
        if (cameraFacing === "environment" && videoDevices.length > 1) {
          // Try to use the back camera (usually the second camera on mobile devices)
          constraints = {
            video: {
              deviceId: { ideal: videoDevices[videoDevices.length - 1].deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          }
        } else if (cameraFacing === "user" && videoDevices.length > 0) {
          // Try to use the front camera (usually the first camera on mobile devices)
          constraints = {
            video: {
              deviceId: { ideal: videoDevices[0].deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          }
        }
      }

      console.log("Using constraints:", constraints)

      // Get user media with the constraints
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Store the stream for later cleanup
      streamRef.current = stream

      if (actualVideoRef.current) {
        // Set video properties before assigning srcObject
        actualVideoRef.current.playsInline = true
        actualVideoRef.current.muted = true

        // Don't set autoplay - we'll play manually after user interaction
        actualVideoRef.current.autoplay = false

        // Create a new promise to handle video loading
        const videoLoadPromise = new Promise<void>((resolve, reject) => {
          if (!actualVideoRef.current) {
            reject(new Error("Video element not available"))
            return
          }

          // Set up event listeners
          const loadedMetadataHandler = () => {
            console.log("Video metadata loaded")
            actualVideoRef.current?.removeEventListener("loadedmetadata", loadedMetadataHandler)
            resolve()
          }

          const errorHandler = (e: Event) => {
            console.error("Video element error during loading:", e)
            actualVideoRef.current?.removeEventListener("error", errorHandler)
            reject(new Error("Video loading error"))
          }

          // Add event listeners
          actualVideoRef.current.addEventListener("loadedmetadata", loadedMetadataHandler)
          actualVideoRef.current.addEventListener("error", errorHandler)

          // Assign the stream
          actualVideoRef.current.srcObject = stream
        })

        try {
          // Wait for video metadata to load
          await videoLoadPromise

          // Now try to play the video - wrap in a user interaction check
          const playVideo = async () => {
            try {
              if (!actualVideoRef.current) return

              // Use a timeout to give the browser a moment
              await new Promise((resolve) => setTimeout(resolve, 100))

              const playPromise = actualVideoRef.current.play()

              // The play() method returns a Promise
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log("Video playback started successfully")
                    setVideoReady(true)

                    // Set canvas dimensions after video is ready
                    if (canvasRef.current) {
                      // Wait a bit to ensure video dimensions are stable
                      setTimeout(() => {
                        setCanvasDimensions()

                        // Start mock pose detection
                        animationFrameRef.current = requestAnimationFrame(animateMockPose)
                        setIsInitialized(true)

                        // Notify parent component that camera is ready
                        if (onCameraReady) {
                          onCameraReady()
                        }
                      }, 500)
                    }
                  })
                  .catch((error) => {
                    console.error("Error playing video:", error)

                    // Check if it's an AbortError
                    if (error.name === "AbortError") {
                      console.log("Play was aborted. This is often due to lack of user interaction.")

                      // Use fallback mode instead of retrying
                      startFallbackMode()
                      return
                    }

                    // Increment attempt counter
                    setCameraAttempts((prev) => prev + 1)

                    // Try with different approach or use fallback
                    if (cameraAttempts < 2) {
                      console.log(`Retrying camera initialization (attempt ${cameraAttempts + 1})`)
                      setTimeout(() => startCamera(), 1000)
                    } else {
                      console.log("Too many failed attempts, using fallback mode")
                      startFallbackMode()
                    }

                    // Report error
                    const errorMessage = `Error playing video: ${error.message || String(error)}`
                    setError(errorMessage)
                    if (onError) {
                      onError(errorMessage)
                    }
                  })
              }
            } catch (playError) {
              console.error("Unexpected error in playVideo:", playError)
              startFallbackMode()
            }
          }

          // Execute play attempt
          playVideo()
        } catch (loadError) {
          console.error("Error loading video:", loadError)
          startFallbackMode()

          // Report error
          const errorMessage = `Error loading video: ${loadError instanceof Error ? loadError.message : String(loadError)}`
          setError(errorMessage)
          if (onError) {
            onError(errorMessage)
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      const errorMessage = `Failed to access camera: ${err instanceof Error ? err.message : String(err)}`
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }

      // Increment attempt counter
      setCameraAttempts((prev) => prev + 1)

      // Try with different approach or use fallback
      if (cameraAttempts < 2) {
        console.log(`Retrying camera initialization (attempt ${cameraAttempts + 1})`)
        setTimeout(() => startCamera(), 1000)
      } else {
        console.log("Too many failed attempts, using fallback mode")
        startFallbackMode()
      }
    }
  }, [
    animateMockPose,
    cameraFacing,
    onCameraReady,
    onError,
    actualVideoRef,
    setCanvasDimensions,
    cameraAttempts,
    startFallbackMode,
  ])

  // Container ref for fallback mode
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize camera and mock pose detection
  useEffect(() => {
    let isMounted = true

    const initializeCamera = async () => {
      try {
        if (!actualVideoRef.current || !canvasRef.current) return

        // Start the camera
        await startCamera()
      } catch (err) {
        console.error("Error initializing camera:", err)
        const errorMessage = `Failed to access camera: ${err instanceof Error ? err.message : String(err)}`

        if (isMounted) {
          setError(errorMessage)
          if (onError) {
            onError(errorMessage)
          }

          // Use fallback mode after error
          startFallbackMode()
        }
      }
    }

    // Initialize with a slight delay
    const timer = setTimeout(() => {
      initializeCamera()
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(timer)

      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Remove event listener
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [animateMockPose, setCanvasDimensions, startCamera, onError, actualVideoRef, startFallbackMode])

  // Effect to handle camera facing mode changes
  useEffect(() => {
    if (isInitialized && !useFallbackMode) {
      // Reset video ready state
      setVideoReady(false)

      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Restart camera with new facing mode
      startCamera()
    }
  }, [cameraFacing, isInitialized, startCamera, useFallbackMode])

  // Add resize event listener
  useEffect(() => {
    window.addEventListener("resize", setCanvasDimensions)
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [setCanvasDimensions])

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {!useFallbackMode && (
        <video
          ref={actualVideoRef}
          className="absolute inset-0 w-full h-full object-cover bg-black"
          playsInline
          autoPlay
          muted
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />

      {error && !onError && (
        <div className="absolute inset-0 flex items-center justify-center bg-tnua-dark/80 z-20">
          <div className="bg-tnua-gray/80 p-4 rounded-md max-w-md text-center">
            <p className="text-white mb-2">{error}</p>
            <button className="tnua-button-primary py-2 px-4" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
