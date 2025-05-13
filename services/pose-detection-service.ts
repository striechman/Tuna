import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

// Define types for pose data
export interface PoseData {
  keypoints: {
    x: number;
    y: number;
    z: number;
    visibility: number;
  }[];
  score: number;
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
  onPoseDetected: (pose: PoseData) => void
  onError: (error: string) => void
}

export class PoseDetectionService {
  private state: PoseDetectionState = {
    isInitialized: false,
    isLoading: false,
    model: null,
    error: null,
    useFallback: false,
  }

  private eventListeners: Map<keyof PoseDetectionEvents, Set<Function>> = new Map();
  private videoElement: HTMLVideoElement | null = null
  private stream: MediaStream | null = null
  private animationFrame: number | null = null
  private lastPoses: PoseData[] = []
  private smoothingFactor = 0.7 // Higher values = more smoothing

  constructor() {
    this.initializePose();
  }

  private async initializePose() {
    try {
      this.state.model = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.state.model?.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.state.model?.onResults(this.handlePoseResults.bind(this));
      this.state.isInitialized = true;
    } catch (error) {
      this.handleError('Failed to initialize pose detection');
    }
  }

  private handlePoseResults(results: any) {
    if (!results.poseLandmarks) return;

    const poseData: PoseData = {
      keypoints: results.poseLandmarks.map((landmark: any) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility
      })),
      score: results.poseWorldLandmarks ? 1 : 0
    };

    this.notifyListeners('onPoseDetected', poseData);
  }

  // Start video and pose detection
  async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: "user" | "environment" = "environment",
  ): Promise<boolean> {
    this.videoElement = videoElement

    if (!this.state.isInitialized) {
      await this.initializePose();
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
      this.eventListeners.get('onError')?.forEach(callback => callback(errorMessage))
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
  subscribe(event: keyof PoseDetectionEvents, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
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

  private notifyListeners(event: keyof PoseDetectionEvents, data: any) {
    this.eventListeners.get(event)?.forEach(callback => callback(data));
  }

  private handleError(error: string) {
    this.notifyListeners('onError', error);
  }
}

// Export singleton instance
const poseDetectionService = new PoseDetectionService()
export default poseDetectionService
