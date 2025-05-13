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

// Define MediaPipe types
interface MediaPipePose {
  setOptions(options: {
    modelComplexity: number
    smoothLandmarks: boolean
    enableSegmentation: boolean
    smoothSegmentation: boolean
    minDetectionConfidence: number
    minTrackingConfidence: number
  }): void
  onResults(callback: (results: {
    poseLandmarks: Array<{
      x: number
      y: number
      z: number
      visibility: number
    }>
    poseWorldLandmarks?: Array<{
      x: number
      y: number
      z: number
      visibility: number
    }>
  }) => void): void
  send(options: { image: HTMLVideoElement }): Promise<void>
}

interface MediaPipePoseConstructor {
  new (options: {
    locateFile: (file: string) => string
  }): MediaPipePose
}

// Define service state
export type PoseDetectionState = {
  isInitialized: boolean
  isLoading: boolean
  model: MediaPipePose | null
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

      // Load MediaPipe Pose
      const pose = await import("@mediapipe/pose")
      const camera = await import("@mediapipe/camera_utils")
      const drawingUtils = await import("@mediapipe/drawing_utils")

      // Initialize MediaPipe Pose
      this.state.model = new pose.Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        },
      })

      // Configure MediaPipe Pose
      this.state.model.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // Set up pose detection callback
      this.state.model.onResults((results) => {
        if (results.poseLandmarks) {
          const poseData: PoseData = {
            score: results.poseWorldLandmarks ? results.poseWorldLandmarks[0].visibility : 1,
            keypoints: results.poseLandmarks.map((landmark, index) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              score: landmark.visibility || 1,
              name: this.getKeypointName(index),
            })),
          }

          // Apply smoothing
          if (this.lastPoses.length > 0) {
            const smoothedPose = this.smoothPoses(this.lastPoses[0], poseData)
            this.lastPoses = [smoothedPose]
            this.eventListeners.onPoseDetected([smoothedPose])
          } else {
            this.lastPoses = [poseData]
            this.eventListeners.onPoseDetected([poseData])
          }
        }
      })

      this.state.isInitialized = true
      this.state.isLoading = false
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize pose detection"
      this.state.error = errorMessage
      this.state.isLoading = false
      this.eventListeners.onError(errorMessage)
      return false
    }
  }

  // Get keypoint name from index
  private getKeypointName(index: number): string {
    const keypointNames = [
      "nose",
      "left_eye_inner",
      "left_eye",
      "left_eye_outer",
      "right_eye_inner",
      "right_eye",
      "right_eye_outer",
      "left_ear",
      "right_ear",
      "mouth_left",
      "mouth_right",
      "left_shoulder",
      "right_shoulder",
      "left_elbow",
      "right_elbow",
      "left_wrist",
      "right_wrist",
      "left_pinky",
      "right_pinky",
      "left_index",
      "right_index",
      "left_thumb",
      "right_thumb",
      "left_hip",
      "right_hip",
      "left_knee",
      "right_knee",
      "left_ankle",
      "right_ankle",
      "left_heel",
      "right_heel",
      "left_foot_index",
      "right_foot_index",
    ]
    return keypointNames[index] || `keypoint_${index}`
  }

  // Smooth poses to reduce jitter
  private smoothPoses(previousPose: PoseData, currentPose: PoseData): PoseData {
    const smoothedKeypoints = currentPose.keypoints.map((keypoint, index) => {
      const prevKeypoint = previousPose.keypoints[index]
      return {
        ...keypoint,
        x: prevKeypoint.x * this.smoothingFactor + keypoint.x * (1 - this.smoothingFactor),
        y: prevKeypoint.y * this.smoothingFactor + keypoint.y * (1 - this.smoothingFactor),
        z: keypoint.z ? prevKeypoint.z! * this.smoothingFactor + keypoint.z * (1 - this.smoothingFactor) : undefined,
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

  // Stop camera and cleanup
  stopCamera(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  }

  // Start pose detection loop
  private startDetection(): void {
    if (!this.videoElement || !this.state.model) return

    const detectPoses = async () => {
      if (!this.videoElement || !this.state.model) return

      await this.state.model.send({ image: this.videoElement })
      this.animationFrame = requestAnimationFrame(detectPoses)
    }

    detectPoses()
  }

  // Subscribe to events
  subscribe(events: Partial<PoseDetectionEvents>): void {
    this.eventListeners = { ...this.eventListeners, ...events }
  }

  // Get current state
  getState(): PoseDetectionState {
    return { ...this.state }
  }

  // Change camera facing mode
  async changeCameraFacingMode(facingMode: "user" | "environment"): Promise<boolean> {
    if (!this.videoElement) return false

    const success = await this.startCamera(this.videoElement, facingMode)
    return success
  }
}

// Export singleton instance
const poseDetectionService = new PoseDetectionService()
export default poseDetectionService
