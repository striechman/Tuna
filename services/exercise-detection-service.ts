import type { PoseData } from "./pose-detection-service"

// Define exercise types
export type ExerciseType = "squat" | "pushup" | "plank" | "jumping_jack" | "unknown"

// Define exercise state
export interface ExerciseState {
  type: ExerciseType
  confidence: number
  repCount: number
  isInPosition: boolean
  formScore: number
  lastRepTime: number
}

// Define exercise detection events
export type ExerciseDetectionEvents = {
  onExerciseDetected: (state: ExerciseState) => void
  onError: (error: string) => void
}

class ExerciseDetectionService {
  private state: ExerciseState = {
    type: "unknown",
    confidence: 0,
    repCount: 0,
    isInPosition: false,
    formScore: 0,
    lastRepTime: 0,
  }

  private eventListeners: ExerciseDetectionEvents = {
    onExerciseDetected: () => {},
    onError: () => {},
  }

  private readonly REP_COOLDOWN = 1000 // Minimum time between reps in ms
  private readonly CONFIDENCE_THRESHOLD = 0.7 // Minimum confidence to consider an exercise detected

  // Calculate angles between joints
  private calculateAngle(
    joint1: { x: number; y: number },
    joint2: { x: number; y: number },
    joint3: { x: number; y: number },
  ): number {
    const radians = Math.atan2(joint3.y - joint2.y, joint3.x - joint2.x) - Math.atan2(joint1.y - joint2.y, joint1.x - joint2.x)
    let angle = Math.abs((radians * 180.0) / Math.PI)
    if (angle > 180.0) {
      angle = 360 - angle
    }
    return angle
  }

  // Detect exercise type from pose data
  private detectExerciseType(pose: PoseData): ExerciseType {
    const keypoints = new Map(pose.keypoints.map((kp) => [kp.name, kp]))

    // Get required keypoints
    const leftHip = keypoints.get("left_hip")
    const rightHip = keypoints.get("right_hip")
    const leftKnee = keypoints.get("left_knee")
    const rightKnee = keypoints.get("right_knee")
    const leftAnkle = keypoints.get("left_ankle")
    const rightAnkle = keypoints.get("right_ankle")
    const leftShoulder = keypoints.get("left_shoulder")
    const rightShoulder = keypoints.get("right_shoulder")
    const leftElbow = keypoints.get("left_elbow")
    const rightElbow = keypoints.get("right_elbow")
    const leftWrist = keypoints.get("left_wrist")
    const rightWrist = keypoints.get("right_wrist")

    if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      return "unknown"
    }

    // Calculate knee angles
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)

    // Calculate hip angles
    const leftHipAngle = this.calculateAngle(leftShoulder || leftHip, leftHip, leftKnee)
    const rightHipAngle = this.calculateAngle(rightShoulder || rightHip, rightHip, rightKnee)

    // Detect squat
    if (leftKneeAngle < 90 && rightKneeAngle < 90 && leftHipAngle < 90 && rightHipAngle < 90) {
      return "squat"
    }

    // Detect pushup
    if (leftElbow && rightElbow && leftWrist && rightWrist) {
      const leftElbowAngle = this.calculateAngle(leftShoulder || leftElbow, leftElbow, leftWrist)
      const rightElbowAngle = this.calculateAngle(rightShoulder || rightElbow, rightElbow, rightWrist)

      if (leftElbowAngle < 90 && rightElbowAngle < 90) {
        return "pushup"
      }
    }

    // Detect plank
    if (leftElbow && rightElbow && leftWrist && rightWrist) {
      const leftElbowAngle = this.calculateAngle(leftShoulder || leftElbow, leftElbow, leftWrist)
      const rightElbowAngle = this.calculateAngle(rightShoulder || rightElbow, rightElbow, rightWrist)

      if (leftElbowAngle > 80 && leftElbowAngle < 100 && rightElbowAngle > 80 && rightElbowAngle < 100) {
        return "plank"
      }
    }

    // Detect jumping jack
    if (leftWrist && rightWrist && leftAnkle && rightAnkle) {
      const leftArmRaised = leftWrist.y < leftShoulder?.y
      const rightArmRaised = rightWrist.y < rightShoulder?.y
      const legsSpread = Math.abs(leftAnkle.x - rightAnkle.x) > 0.5

      if (leftArmRaised && rightArmRaised && legsSpread) {
        return "jumping_jack"
      }
    }

    return "unknown"
  }

  // Calculate form score based on exercise type and pose data
  private calculateFormScore(exerciseType: ExerciseType, pose: PoseData): number {
    const keypoints = new Map(pose.keypoints.map((kp) => [kp.name, kp]))
    let score = 0

    switch (exerciseType) {
      case "squat":
        // Check knee alignment
        const leftKnee = keypoints.get("left_knee")
        const rightKnee = keypoints.get("right_knee")
        const leftAnkle = keypoints.get("left_ankle")
        const rightAnkle = keypoints.get("right_ankle")

        if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
          const kneeAlignment = Math.abs((leftKnee.x + rightKnee.x) / 2 - (leftAnkle.x + rightAnkle.x) / 2)
          score += (1 - kneeAlignment) * 50
        }

        // Check depth
        const leftHip = keypoints.get("left_hip")
        const rightHip = keypoints.get("right_hip")
        const leftKneeAngle = this.calculateAngle(
          leftHip || { x: 0, y: 0 },
          leftKnee,
          leftAnkle || { x: 0, y: 0 },
        )
        const rightKneeAngle = this.calculateAngle(
          rightHip || { x: 0, y: 0 },
          rightKnee,
          rightAnkle || { x: 0, y: 0 },
        )

        if (leftKneeAngle < 90 && rightKneeAngle < 90) {
          score += 50
        }
        break

      case "pushup":
        // Check body alignment
        const leftShoulder = keypoints.get("left_shoulder")
        const rightShoulder = keypoints.get("right_shoulder")
        const leftHip = keypoints.get("left_hip")
        const rightHip = keypoints.get("right_hip")

        if (leftShoulder && rightShoulder && leftHip && rightHip) {
          const bodyAlignment = Math.abs(
            (leftShoulder.y + rightShoulder.y) / 2 - (leftHip.y + rightHip.y) / 2,
          )
          score += (1 - bodyAlignment) * 50
        }

        // Check elbow angle
        const leftElbow = keypoints.get("left_elbow")
        const rightElbow = keypoints.get("right_elbow")
        const leftWrist = keypoints.get("left_wrist")
        const rightWrist = keypoints.get("right_wrist")

        if (leftElbow && rightElbow && leftWrist && rightWrist) {
          const leftElbowAngle = this.calculateAngle(leftShoulder || leftElbow, leftElbow, leftWrist)
          const rightElbowAngle = this.calculateAngle(rightShoulder || rightElbow, rightElbow, rightWrist)

          if (leftElbowAngle < 90 && rightElbowAngle < 90) {
            score += 50
          }
        }
        break

      // Add more exercise types here
    }

    return Math.min(100, Math.max(0, score))
  }

  // Process new pose data
  processPose(pose: PoseData): void {
    try {
      // Detect exercise type
      const exerciseType = this.detectExerciseType(pose)
      const confidence = pose.score

      // Only update state if confidence is high enough
      if (confidence >= this.CONFIDENCE_THRESHOLD) {
        const formScore = this.calculateFormScore(exerciseType, pose)
        const now = Date.now()

        // Check if we should count a rep
        let repCount = this.state.repCount
        let lastRepTime = this.state.lastRepTime

        if (exerciseType !== "unknown" && now - lastRepTime > this.REP_COOLDOWN) {
          // Different logic for different exercises
          switch (exerciseType) {
            case "squat":
              if (!this.state.isInPosition && formScore > 80) {
                this.state.isInPosition = true
              } else if (this.state.isInPosition && formScore < 30) {
                repCount++
                lastRepTime = now
                this.state.isInPosition = false
              }
              break

            case "pushup":
              if (!this.state.isInPosition && formScore > 80) {
                this.state.isInPosition = true
              } else if (this.state.isInPosition && formScore < 30) {
                repCount++
                lastRepTime = now
                this.state.isInPosition = false
              }
              break

            // Add more exercise types here
          }
        }

        // Update state
        this.state = {
          type: exerciseType,
          confidence,
          repCount,
          isInPosition: this.state.isInPosition,
          formScore,
          lastRepTime,
        }

        // Notify listeners
        this.eventListeners.onExerciseDetected(this.state)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error processing pose"
      this.eventListeners.onError(errorMessage)
    }
  }

  // Subscribe to events
  subscribe(events: Partial<ExerciseDetectionEvents>): void {
    this.eventListeners = { ...this.eventListeners, ...events }
  }

  // Get current state
  getState(): ExerciseState {
    return { ...this.state }
  }

  // Reset state
  reset(): void {
    this.state = {
      type: "unknown",
      confidence: 0,
      repCount: 0,
      isInPosition: false,
      formScore: 0,
      lastRepTime: 0,
    }
  }
}

// Export singleton instance
const exerciseDetectionService = new ExerciseDetectionService()
export default exerciseDetectionService 