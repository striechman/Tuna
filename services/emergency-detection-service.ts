import type { PoseData } from "./pose-detection-service"

// Define emergency types
export type EmergencyType = "fall" | "collapse" | "choking" | "stuck" | "none"

// Define emergency state
export interface EmergencyState {
  type: EmergencyType
  confidence: number
  lastDetectionTime: number
  isActive: boolean
}

// Define emergency detection events
export type EmergencyDetectionEvents = {
  onEmergencyDetected: (state: EmergencyState) => void
  onEmergencyResolved: () => void
  onError: (error: string) => void
}

class EmergencyDetectionService {
  private state: EmergencyState = {
    type: "none",
    confidence: 0,
    lastDetectionTime: 0,
    isActive: false,
  }

  private eventListeners: EmergencyDetectionEvents = {
    onEmergencyDetected: () => {},
    onEmergencyResolved: () => {},
    onError: () => {},
  }

  private readonly DETECTION_THRESHOLD = 0.8 // Minimum confidence to trigger emergency
  private readonly RESOLUTION_TIME = 5000 // Time in ms to wait before resolving emergency
  private readonly FALL_THRESHOLD = 0.3 // Height threshold for fall detection
  private readonly COLLAPSE_THRESHOLD = 0.4 // Height threshold for collapse detection
  private readonly STUCK_THRESHOLD = 10000 // Time in ms to consider someone stuck

  // Process new pose data
  processPose(pose: PoseData): void {
    try {
      const keypoints = new Map(pose.keypoints.map((kp) => [kp.name, kp]))

      // Get required keypoints
      const leftHip = keypoints.get("left_hip")
      const rightHip = keypoints.get("right_hip")
      const leftShoulder = keypoints.get("left_shoulder")
      const rightShoulder = keypoints.get("right_shoulder")
      const leftKnee = keypoints.get("left_knee")
      const rightKnee = keypoints.get("right_knee")
      const leftAnkle = keypoints.get("left_ankle")
      const rightAnkle = keypoints.get("right_ankle")

      if (!leftHip || !rightHip || !leftShoulder || !rightShoulder) {
        return
      }

      // Calculate average height of person
      const hipHeight = (leftHip.y + rightHip.y) / 2
      const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2
      const averageHeight = (hipHeight + shoulderHeight) / 2

      // Detect fall
      if (averageHeight > this.FALL_THRESHOLD && pose.score > this.DETECTION_THRESHOLD) {
        this.handleEmergency("fall", pose.score)
        return
      }

      // Detect collapse
      if (averageHeight > this.COLLAPSE_THRESHOLD && pose.score > this.DETECTION_THRESHOLD) {
        this.handleEmergency("collapse", pose.score)
        return
      }

      // Detect stuck position
      if (this.state.isActive && this.state.type === "stuck") {
        const timeSinceLastDetection = Date.now() - this.state.lastDetectionTime
        if (timeSinceLastDetection > this.STUCK_THRESHOLD) {
          this.handleEmergency("stuck", pose.score)
          return
        }
      }

      // Check if emergency is resolved
      if (this.state.isActive) {
        const timeSinceLastDetection = Date.now() - this.state.lastDetectionTime
        if (timeSinceLastDetection > this.RESOLUTION_TIME) {
          this.resolveEmergency()
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error processing emergency detection"
      this.eventListeners.onError(errorMessage)
    }
  }

  // Handle emergency detection
  private handleEmergency(type: EmergencyType, confidence: number): void {
    const now = Date.now()

    // Update state
    this.state = {
      type,
      confidence,
      lastDetectionTime: now,
      isActive: true,
    }

    // Notify listeners
    this.eventListeners.onEmergencyDetected(this.state)
  }

  // Resolve emergency
  private resolveEmergency(): void {
    this.state = {
      type: "none",
      confidence: 0,
      lastDetectionTime: 0,
      isActive: false,
    }

    // Notify listeners
    this.eventListeners.onEmergencyResolved()
  }

  // Subscribe to events
  subscribe(events: Partial<EmergencyDetectionEvents>): void {
    this.eventListeners = { ...this.eventListeners, ...events }
  }

  // Get current state
  getState(): EmergencyState {
    return { ...this.state }
  }

  // Reset state
  reset(): void {
    this.state = {
      type: "none",
      confidence: 0,
      lastDetectionTime: 0,
      isActive: false,
    }
  }
}

// Export singleton instance
const emergencyDetectionService = new EmergencyDetectionService()
export default emergencyDetectionService 