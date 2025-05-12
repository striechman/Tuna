// This file implements exercise recognition based on the GitHub project:
// https://github.com/chrisprasanna/Exercise_Recognition_AI

import type * as poseDetection from "@tensorflow-models/pose-detection"

// Define exercise types
export type ExerciseType = "squat" | "pushup" | "situp" | "jumping_jack" | "unknown"

// Calculate angle between three points
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360 - angle
  }

  return angle
}

// Detect if a person is in a squat position
export function detectSquat(pose: poseDetection.Pose): { isSquat: boolean; confidence: number } {
  if (!pose.keypoints) return { isSquat: false, confidence: 0 }

  // Create a map of keypoints by name for easier access
  const keypointMap = new Map()
  pose.keypoints.forEach((keypoint) => {
    keypointMap.set(keypoint.name, keypoint)
  })

  // Get key points for squat detection
  const leftHip = keypointMap.get("left_hip")
  const rightHip = keypointMap.get("right_hip")
  const leftKnee = keypointMap.get("left_knee")
  const rightKnee = keypointMap.get("right_knee")
  const leftAnkle = keypointMap.get("left_ankle")
  const rightAnkle = keypointMap.get("right_ankle")

  // Check if we have all the keypoints we need with good confidence
  if (
    !leftHip ||
    !rightHip ||
    !leftKnee ||
    !rightKnee ||
    !leftAnkle ||
    !rightAnkle ||
    !leftHip.score ||
    !rightHip.score ||
    !leftKnee.score ||
    !rightKnee.score ||
    !leftAnkle.score ||
    !rightAnkle.score ||
    leftHip.score < 0.5 ||
    rightHip.score < 0.5 ||
    leftKnee.score < 0.5 ||
    rightKnee.score < 0.5 ||
    leftAnkle.score < 0.5 ||
    rightAnkle.score < 0.5
  ) {
    return { isSquat: false, confidence: 0 }
  }

  // Calculate knee angles
  const leftKneeAngle = calculateAngle(
    { x: leftHip.x, y: leftHip.y },
    { x: leftKnee.x, y: leftKnee.y },
    { x: leftAnkle.x, y: leftAnkle.y },
  )

  const rightKneeAngle = calculateAngle(
    { x: rightHip.x, y: rightHip.y },
    { x: rightKnee.x, y: rightKnee.y },
    { x: rightAnkle.x, y: rightAnkle.y },
  )

  // Calculate hip position relative to starting position
  // In a squat, hips are lower than in standing position
  const hipHeight = (leftHip.y + rightHip.y) / 2
  const ankleHeight = (leftAnkle.y + rightAnkle.y) / 2
  const kneeHeight = (leftKnee.y + rightKnee.y) / 2

  // Calculate hip-knee-ankle ratio
  // In a squat, this ratio changes as hips lower
  const hipKneeRatio = (hipHeight - kneeHeight) / (ankleHeight - kneeHeight)

  // In a squat:
  // 1. Knee angles are typically less than 90-100 degrees
  // 2. Hips are lower (higher y value)
  // 3. Hip-knee ratio changes

  const isKneeAngleCorrect = leftKneeAngle < 100 && rightKneeAngle < 100
  const isHipLowered = hipHeight > kneeHeight - (ankleHeight - kneeHeight) * 0.3

  // Calculate confidence based on how deep the squat is
  // The deeper the squat (smaller knee angle), the higher the confidence
  const kneeAngleConfidence = 1 - Math.min(leftKneeAngle, rightKneeAngle) / 180
  const hipPositionConfidence = Math.min(1, hipKneeRatio)

  // Combine factors to determine if this is a squat
  const isSquat = isKneeAngleCorrect && isHipLowered
  const confidence = isSquat ? kneeAngleConfidence * 0.7 + hipPositionConfidence * 0.3 : 0

  return { isSquat, confidence }
}

// Detect if a person is in a pushup position
export function detectPushup(pose: poseDetection.Pose): { isPushup: boolean; confidence: number } {
  if (!pose.keypoints) return { isPushup: false, confidence: 0 }

  // Create a map of keypoints by name for easier access
  const keypointMap = new Map()
  pose.keypoints.forEach((keypoint) => {
    keypointMap.set(keypoint.name, keypoint)
  })

  // Get key points for pushup detection
  const leftShoulder = keypointMap.get("left_shoulder")
  const rightShoulder = keypointMap.get("right_shoulder")
  const leftElbow = keypointMap.get("left_elbow")
  const rightElbow = keypointMap.get("right_elbow")
  const leftWrist = keypointMap.get("left_wrist")
  const rightWrist = keypointMap.get("right_wrist")
  const leftHip = keypointMap.get("left_hip")
  const rightHip = keypointMap.get("right_hip")
  const leftAnkle = keypointMap.get("left_ankle")
  const rightAnkle = keypointMap.get("right_ankle")

  // Check if we have all the keypoints we need with good confidence
  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftElbow ||
    !rightElbow ||
    !leftWrist ||
    !rightWrist ||
    !leftHip ||
    !rightHip ||
    !leftAnkle ||
    !rightAnkle ||
    !leftShoulder.score ||
    !rightShoulder.score ||
    !leftElbow.score ||
    !rightElbow.score ||
    !leftWrist.score ||
    !rightWrist.score ||
    !leftHip.score ||
    !rightHip.score ||
    !leftAnkle.score ||
    !rightAnkle.score ||
    leftShoulder.score < 0.5 ||
    rightShoulder.score < 0.5 ||
    leftElbow.score < 0.5 ||
    rightElbow.score < 0.5 ||
    leftWrist.score < 0.5 ||
    rightWrist.score < 0.5 ||
    leftHip.score < 0.5 ||
    rightHip.score < 0.5 ||
    leftAnkle.score < 0.5 ||
    rightAnkle.score < 0.5
  ) {
    return { isPushup: false, confidence: 0 }
  }

  // Calculate elbow angles
  const leftElbowAngle = calculateAngle(
    { x: leftShoulder.x, y: leftShoulder.y },
    { x: leftElbow.x, y: leftElbow.y },
    { x: leftWrist.x, y: leftWrist.y },
  )

  const rightElbowAngle = calculateAngle(
    { x: rightShoulder.x, y: rightShoulder.y },
    { x: rightElbow.x, y: rightElbow.y },
    { x: rightWrist.x, y: rightWrist.y },
  )

  // Calculate body alignment
  // In a pushup, the body should form a straight line from head to heels
  const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2
  const hipHeight = (leftHip.y + rightHip.y) / 2
  const ankleHeight = (leftAnkle.y + rightAnkle.y) / 2

  // Check if body is horizontal (in pushup position)
  // This is a simplified check - in a real app, you'd use more sophisticated alignment checks
  const isBodyHorizontal = Math.abs(shoulderHeight - hipHeight) < 50 && Math.abs(hipHeight - ankleHeight) < 50

  // In a pushup:
  // 1. Elbow angles are typically less than 90 degrees in the down position
  // 2. Body forms a straight line

  const isElbowAngleCorrect = leftElbowAngle < 110 && rightElbowAngle < 110

  // Calculate confidence
  const elbowAngleConfidence = 1 - Math.min(leftElbowAngle, rightElbowAngle) / 180
  const bodyAlignmentConfidence = isBodyHorizontal ? 0.8 : 0.2

  // Combine factors
  const isPushup = isElbowAngleCorrect && isBodyHorizontal
  const confidence = isPushup ? elbowAngleConfidence * 0.6 + bodyAlignmentConfidence * 0.4 : 0

  return { isPushup, confidence }
}

// Main function to recognize exercise
export function recognizeExercise(pose: poseDetection.Pose): {
  exerciseType: ExerciseType
  confidence: number
  isCorrectForm: boolean
} {
  // Check for different exercises
  const { isSquat, confidence: squatConfidence } = detectSquat(pose)
  const { isPushup, confidence: pushupConfidence } = detectPushup(pose)

  // Determine the most likely exercise
  if (isSquat && squatConfidence > 0.6) {
    return {
      exerciseType: "squat",
      confidence: squatConfidence,
      isCorrectForm: squatConfidence > 0.8, // Consider form correct if confidence is high
    }
  } else if (isPushup && pushupConfidence > 0.6) {
    return {
      exerciseType: "pushup",
      confidence: pushupConfidence,
      isCorrectForm: pushupConfidence > 0.8,
    }
  }

  // Default to unknown if no exercise is recognized with high confidence
  return { exerciseType: "unknown", confidence: 0, isCorrectForm: false }
}

// Generate feedback based on exercise and pose
export function generateFeedback(pose: poseDetection.Pose, exerciseType: ExerciseType): string {
  if (!pose.keypoints || exerciseType === "unknown") return ""

  const keypointMap = new Map()
  pose.keypoints.forEach((keypoint) => {
    keypointMap.set(keypoint.name, keypoint)
  })

  switch (exerciseType) {
    case "squat": {
      // Get key points
      const leftHip = keypointMap.get("left_hip")
      const rightHip = keypointMap.get("right_hip")
      const leftKnee = keypointMap.get("left_knee")
      const rightKnee = keypointMap.get("right_knee")
      const leftAnkle = keypointMap.get("left_ankle")
      const rightAnkle = keypointMap.get("right_ankle")
      const leftShoulder = keypointMap.get("left_shoulder")
      const rightShoulder = keypointMap.get("right_shoulder")

      if (
        !leftHip ||
        !rightHip ||
        !leftKnee ||
        !rightKnee ||
        !leftAnkle ||
        !rightAnkle ||
        !leftShoulder ||
        !rightShoulder
      ) {
        return ""
      }

      // Calculate knee angles
      const leftKneeAngle = calculateAngle(
        { x: leftHip.x, y: leftHip.y },
        { x: leftKnee.x, y: leftKnee.y },
        { x: leftAnkle.x, y: leftAnkle.y },
      )

      const rightKneeAngle = calculateAngle(
        { x: rightHip.x, y: rightHip.y },
        { x: rightKnee.x, y: rightKnee.y },
        { x: rightAnkle.x, y: rightAnkle.y },
      )

      // Check back alignment
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      }

      const hipMidpoint = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2,
      }

      // Check if knees are going too far forward
      const leftKneeForward = leftKnee.x > leftAnkle.x + 30
      const rightKneeForward = rightKnee.x > rightAnkle.x + 30

      // Generate feedback
      if (leftKneeAngle > 120 || rightKneeAngle > 120) {
        return "הורד את הירכיים יותר נמוך"
      }

      if (leftKneeForward || rightKneeForward) {
        return "שמור על הברכיים מאחורי כפות הרגליים"
      }

      // Check back alignment
      const backAngle = Math.abs(Math.atan2(shoulderMidpoint.y - hipMidpoint.y, shoulderMidpoint.x - hipMidpoint.x))
      if (backAngle < 0.5) {
        // If back is too horizontal
        return "שמור על הגב ישר יותר"
      }

      return ""
    }

    // Add more exercise types here

    default:
      return ""
  }
}
