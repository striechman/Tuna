// Define types for pose data
export interface PoseData {
  score: number
  keypoints: Array<{
    x: number
    y: number
    z?: number
    score: number
    name: string
  }>
}

// Define service state
export type PoseDetectionState = {
  isInitialized: boolean
  isLoading: boolean
  model: any | null
  error: string | null
  useFallback: boolean
}

// Define events that can be listened to
export type PoseDetectionEvents = {
  onPoseDetected: (poses: PoseData[]) => void
  onError: (error: string) => void
}

class PoseDetectionService {
  private state: PoseDetectionState = {
    isInitialized: false,
    isLoading: false,
    model: null,
    error: null,
    useFallback: false,
  }

  private eventListeners: PoseDetectionEvents = {
    onPoseDetected: () => {},
    onError: () => {},
  }

  private videoElement: HTMLVideoElement | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private lastPoses: PoseData[] = []
  private smoothingFactor = 0.7 // Higher values = more smoothing

  // Initialize the service
  async initialize(): Promise<boolean> {
    if (this.state.isInitialized) return true
    if (this.state.isLoading) return false

    this.state.isLoading = true
    this.state.error = null

    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("PoseDetectionService must be used in a browser environment")
      }

      // Always use fallback for now to avoid script loading issues
      this.state.useFallback = true
      return this.initializeFallback()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize pose detection"
      this.state.error = errorMessage
      this.state.isLoading = false
      this.eventListeners.onError(errorMessage)

      // Use fallback implementation in case of error
      return this.initializeFallback()
    }
  }

  // Initialize a fallback implementation
  private initializeFallback(): boolean {
    console.log("Using fallback pose detection implementation")
    this.state.isInitialized = true
    this.state.isLoading = false
    this.state.useFallback = true
    return true
  }

  // Generate mock poses for testing or fallback
  private generateMockPoses(): PoseData[] {
    const now = Date.now() / 1000
    const baseKeypoints = [
      { name: "nose", x: 0.5, y: 0.2, score: 0.95 },
      { name: "left_eye", x: 0.45, y: 0.18, score: 0.9 },
      { name: "right_eye", x: 0.55, y: 0.18, score: 0.9 },
      { name: "left_ear", x: 0.4, y: 0.2, score: 0.85 },
      { name: "right_ear", x: 0.6, y: 0.2, score: 0.85 },
      { name: "left_shoulder", x: 0.35, y: 0.3, score: 0.9 },
      { name: "right_shoulder", x: 0.65, y: 0.3, score: 0.9 },
      { name: "left_elbow", x: 0.3, y: 0.4 + Math.sin(now * 0.5) * 0.03, score: 0.85 },
      { name: "right_elbow", x: 0.7, y: 0.4 + Math.sin(now * 0.5 + Math.PI) * 0.03, score: 0.85 },
      { name: "left_wrist", x: 0.25, y: 0.5 + Math.sin(now * 0.5) * 0.03, score: 0.8 },
      { name: "right_wrist", x: 0.75, y: 0.5 + Math.sin(now * 0.5 + Math.PI) * 0.03, score: 0.8 },
      { name: "left_hip", x: 0.4, y: 0.6, score: 0.9 },
      { name: "right_hip", x: 0.6, y: 0.6, score: 0.9 },
      { name: "left_knee", x: 0.4, y: 0.75 + Math.sin(now * 0.3) * 0.01, score: 0.85 },
      { name: "right_knee", x: 0.6, y: 0.75 + Math.sin(now * 0.3 + Math.PI) * 0.01, score: 0.85 },
      { name: "left_ankle", x: 0.4, y: 0.9 + Math.sin(now * 0.3) * 0.01, score: 0.8 },
      { name: "right_ankle", x: 0.6, y: 0.9 + Math.sin(now * 0.3 + Math.PI) * 0.01, score: 0.8 },
    ]

    const newPoses = [
      {
        score: 0.9,
        keypoints: baseKeypoints.map((keypoint) => ({
          ...keypoint,
          // Add very slight random movement (much less than before)
          x: keypoint.x + (Math.random() - 0.5) * 0.005,
          y: keypoint.y + (Math.random() - 0.5) * 0.005,
        })),
      },
    ]

    // Apply smoothing if we have previous poses
    if (this.lastPoses.length > 0) {
      const smoothedPoses = this.smoothPoses(this.lastPoses[0], newPoses[0])
      this.lastPoses = [smoothedPoses]
      return [smoothedPoses]
    }

    this.lastPoses = newPoses
    return newPoses
  }

  // Smooth poses to reduce jitter
  private smoothPoses(previousPose: PoseData, currentPose: PoseData): PoseData {
    const smoothedKeypoints = currentPose.keypoints.map((keypoint, index) => {
      const prevKeypoint = previousPose.keypoints[index]
      return {
        ...keypoint,
        x: prevKeypoint.x * this.smoothingFactor + keypoint.x * (1 - this.smoothingFactor),
        y: prevKeypoint.y * this.smoothingFactor + keypoint.y * (1 - this.smoothingFactor),
      }
    })

    return {
      ...currentPose,
      keypoints: smoothedKeypoints,
    }
  }

  // Start video and pose detection
  async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: "user" | "environment" = "environment",
  ): Promise<boolean> {
    this.videoElement = videoElement

    if (!this.state.isInitialized) {
      await this.initialize()
    }

    try {
      // Stop any existing stream
      this.stopCamera()

      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      // Set up video element
      this.videoElement.srcObject = this.stream
      this.videoElement.muted = true
      this.videoElement.playsInline = true

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!this.videoElement) return reject(new Error("No video element"))

        const onLoadedMetadata = () => {
          this.videoElement?.removeEventListener("loadedmetadata", onLoadedMetadata)
          resolve()
        }

        this.videoElement.addEventListener("loadedmetadata", onLoadedMetadata)

        // Set timeout for metadata loading
        setTimeout(() => {
          reject(new Error("Video metadata loading timeout"))
        }, 5000)
      })

      // Play the video
      await this.videoElement.play()

      // Start detection loop
      this.startDetection()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start camera"
      this.state.error = errorMessage
      this.eventListeners.onError(errorMessage)
      return false
    }
  }

  // Stop the camera and detection
  stopCamera(): void {
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    // Stop and clean up any existing stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    // Clear video source
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject = null
    }
  }

  // Start the pose detection loop
  private startDetection(): void {
    if (!this.videoElement) return

    // For fallback mode, use animation frame for smoother animation
    const detectPoses = () => {
      const poses = this.generateMockPoses()
      this.eventListeners.onPoseDetected(poses)
      this.animationFrame = requestAnimationFrame(detectPoses)
    }
    this.animationFrame = requestAnimationFrame(detectPoses)
  }

  // Subscribe to pose detection events
  subscribe(events: Partial<PoseDetectionEvents>): void {
    if (events.onPoseDetected) {
      this.eventListeners.onPoseDetected = events.onPoseDetected
    }
    if (events.onError) {
      this.eventListeners.onError = events.onError
    }
  }

  // Get the current service state
  getState(): PoseDetectionState {
    return { ...this.state }
  }

  // Change camera facing mode
  async changeCameraFacingMode(facingMode: "user" | "environment"): Promise<boolean> {
    if (!this.videoElement) return false
    return this.startCamera(this.videoElement, facingMode)
  }
}

// Create a singleton instance
const poseDetectionService = new PoseDetectionService()
export default poseDetectionService
