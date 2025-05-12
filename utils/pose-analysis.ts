// Define a simplified type for pose results
type PoseResults = {
  poseLandmarks?: Array<{
    x: number
    y: number
    z: number
    visibility?: number
  }>
}

// Constants for pose landmarks
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
}

// Calculate angle between three points
export function calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360 - angle
  }

  return angle
}

// Detect if a person is in a squat position
export function detectSquat(results: PoseResults) {
  if (!results.poseLandmarks) return false

  const landmarks = results.poseLandmarks

  // Get key points for squat detection
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP]
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE]
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP]
  const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE]
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE]

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

  // In a squat, knee angles are typically less than 90-100 degrees
  return leftKneeAngle < 100 && rightKneeAngle < 100
}

// This is a placeholder for future exercise detection functions
export function analyzeExercise(results: PoseResults, exerciseType: string) {
  switch (exerciseType.toLowerCase()) {
    case "squat":
      return detectSquat(results)
    // Add more exercise types here
    default:
      return false
  }
}

// Check for potentially dangerous positions
export function detectDangerousSituation(results: PoseResults) {
  if (!results.poseLandmarks) return false

  const landmarks = results.poseLandmarks

  // Example: Check if the head is too close to the ground (potential fall)
  const nose = landmarks[POSE_LANDMARKS.NOSE]
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE]
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE]

  // If the nose is close to the ground level (ankle height), might indicate a fall
  if (nose.y > leftAnkle.y - 0.1 || nose.y > rightAnkle.y - 0.1) {
    return true
  }

  return false
}
