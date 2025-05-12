"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as poseDetection from "@tensorflow-models/pose-detection"
import * as tf from "@tensorflow/tfjs"

// Define exercise types
export type ExerciseType = "squat" | "pushup" | "situp" | "jumping_jack" | "unknown"

// Define the exercise state
interface ExerciseState {
  exerciseName: ExerciseType | ""
  confidence: number
  repCount: number
  feedback: string
  isCorrectForm: boolean
  isDangerous: boolean
}

// Define the hook return type
interface UseExerciseRecognitionReturn {
  isLoading: boolean
  processPoseFrame: (video: HTMLVideoElement, canvas: HTMLCanvasElement) => Promise<void>
  exerciseState: ExerciseState
  resetRepCount: () => void
}

export function useExerciseRecognition(): UseExerciseRecognitionReturn {
  // State for loading status
  const [isLoading, setIsLoading] = useState(true)

  // State for exercise recognition
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    exerciseName: "",
    confidence: 0,
    repCount: 0,
    feedback: "",
    isCorrectForm: false,
    isDangerous: false,
  })

  // Refs for models and detectors
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null)
  const exerciseModelRef = useRef<tf.GraphModel | null>(null)

  // Refs for exercise tracking
  const lastPoseStateRef = useRef<boolean>(false)
  const repCountRef = useRef<number>(0)
  const poseHistoryRef = useRef<number[][]>([])

  // Initialize TensorFlow.js and load models
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsLoading(true)

        // Initialize TensorFlow.js
        await tf.ready()

        // Set up the pose detector
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        }

        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig)

        // Load exercise classification model
        // In a real app, you would load your trained model here
        // For now, we'll simulate this with a placeholder
        // exerciseModelRef.current = await loadGraphModel('/models/exercise_model/model.json')

        console.log("Models loaded successfully")
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing models:", error)
        setIsLoading(false)
      }
    }

    initializeModels()

    return () => {
      // Clean up resources
      if (detectorRef.current) {
        detectorRef.current.dispose()
      }
      if (exerciseModelRef.current) {
        exerciseModelRef.current.dispose()
      }
    }
  }, [])

  // Process video frame for pose detection and exercise recognition
  const processPoseFrame = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    if (!detectorRef.current) return

    try {
      // Detect poses
      const poses = await detectorRef.current.estimatePoses(video)

      // Clear canvas
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // If no poses detected, return
      if (!poses || poses.length === 0) return

      // Get the first pose
      const pose = poses[0]

      // Draw the pose
      drawPose(pose, ctx, canvas.width, canvas.height)

      // Process the pose for exercise recognition
      processPoseForExerciseRecognition(pose)
    } catch (error) {
      console.error("Error processing frame:", error)
    }
  }, [])

  // Draw the detected pose on the canvas
  const drawPose = (pose: poseDetection.Pose, ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!pose.keypoints) return

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        const { x, y } = keypoint

        // Draw point
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = "#00ff9d"
        ctx.fill()
      }
    })

    // Define connections for drawing skeleton
    const connections = [
      // Torso
      ["nose", "left_shoulder"],
      ["nose", "right_shoulder"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_shoulder", "right_shoulder"],
      ["left_hip", "right_hip"],

      // Arms
      ["left_shoulder", "left_elbow"],
      ["right_shoulder", "right_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_elbow", "right_wrist"],

      // Legs
      ["left_hip", "left_knee"],
      ["right_hip", "right_knee"],
      ["left_knee", "left_ankle"],
      ["right_knee", "right_ankle"],
    ]

    // Create a map of keypoints by name
    const keypointMap = new Map()
    pose.keypoints.forEach((keypoint) => {
      keypointMap.set(keypoint.name, keypoint)
    })

    // Draw connections
    ctx.strokeStyle = "#00eeff"
    ctx.lineWidth = 4

    connections.forEach(([start, end]) => {
      const startPoint = keypointMap.get(start)
      const endPoint = keypointMap.get(end)

      if (
        startPoint &&
        endPoint &&
        startPoint.score &&
        endPoint.score &&
        startPoint.score > 0.3 &&
        endPoint.score > 0.3
      ) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })
  }

  // Process pose for exercise recognition
  const processPoseForExerciseRecognition = (pose: poseDetection.Pose) => {
    if (!pose.keypoints) return

    // Extract keypoints and normalize them
    const normalizedPose = normalizePose(pose)

    // Add to pose history (for temporal analysis)
    poseHistoryRef.current.push(normalizedPose)

    // Keep only the last 30 frames
    if (poseHistoryRef.current.length > 30) {
      poseHistoryRef.current.shift()
    }

    // Detect exercise type
    // In a real app, this would use the loaded model
    // For now, we'll use a simple heuristic approach
    const exerciseType = detectExerciseType(pose)

    // Detect if the form is correct
    const isCorrectForm = detectCorrectForm(pose, exerciseType.exerciseName)

    // Count reps
    if (isCorrectForm && !lastPoseStateRef.current) {
      repCountRef.current += 1
    }
    lastPoseStateRef.current = isCorrectForm

    // Generate feedback
    const feedback = generateFeedback(pose, exerciseType.exerciseName)

    // Check for dangerous situations
    const isDangerous = detectDangerousSituation(pose)

    // Update exercise state
    setExerciseState({
      exerciseName: exerciseType.exerciseName,
      confidence: exerciseType.confidence,
      repCount: repCountRef.current,
      feedback,
      isCorrectForm,
      isDangerous,
    })
  }

  // Normalize pose for consistent processing
  const normalizePose = (pose: poseDetection.Pose): number[] => {
    if (!pose.keypoints) return []

    // Extract x, y coordinates from all keypoints
    const flattenedPose: number[] = []

    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        flattenedPose.push(keypoint.x)
        flattenedPose.push(keypoint.y)
      } else {
        // If keypoint is not detected with high confidence, use zeros
        flattenedPose.push(0)
        flattenedPose.push(0)
      }
    })

    return flattenedPose
  }

  // Detect exercise type based on pose
  const detectExerciseType = (pose: poseDetection.Pose): { exerciseName: ExerciseType; confidence: number } => {
    if (!pose.keypoints) return { exerciseName: "unknown", confidence: 0 }

    // In a real app, this would use the loaded model for classification
    // For now, we'll use a simple heuristic approach

    // Create a map of keypoints by name for easier access
    const keypointMap = new Map()
    pose.keypoints.forEach((keypoint) => {
      keypointMap.set(keypoint.name, keypoint)
    })

    // Get key points
    const leftShoulder = keypointMap.get("left_shoulder")
    const rightShoulder = keypointMap.get("right_shoulder")
    const leftHip = keypointMap.get("left_hip")
    const rightHip = keypointMap.get("right_hip")
    const leftKnee = keypointMap.get("left_knee")
    const rightKnee = keypointMap.get("right_knee")
    const leftAnkle = keypointMap.get("left_ankle")
    const rightAnkle = keypointMap.get("right_ankle")

    // Check if we have all the keypoints we need
    if (
      !leftShoulder ||
      !rightShoulder ||
      !leftHip ||
      !rightHip ||
      !leftKnee ||
      !rightKnee ||
      !leftAnkle ||
      !rightAnkle
    ) {
      return { exerciseName: "unknown", confidence: 0 }
    }

    // Calculate angles
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

    // Simple heuristic for squat detection
    if (leftKneeAngle < 100 && rightKneeAngle < 100) {
      return { exerciseName: "squat", confidence: 0.85 }
    }

    // More exercise detection logic would go here

    return { exerciseName: "unknown", confidence: 0.5 }
  }

  // Calculate angle between three points
  const calculateAngle = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number },
  ): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs((radians * 180.0) / Math.PI)

    if (angle > 180.0) {
      angle = 360 - angle
    }

    return angle
  }

  // Detect if the form is correct for a given exercise
  const detectCorrectForm = (pose: poseDetection.Pose, exerciseType: ExerciseType | ""): boolean => {
    if (!pose.keypoints || !exerciseType) return false

    // Create a map of keypoints by name for easier access
    const keypointMap = new Map()
    pose.keypoints.forEach((keypoint) => {
      keypointMap.set(keypoint.name, keypoint)
    })

    switch (exerciseType) {
      case "squat":
        // Get key points for squat form check
        const leftHip = keypointMap.get("left_hip")
        const rightHip = keypointMap.get("right_hip")
        const leftKnee = keypointMap.get("left_knee")
        const rightKnee = keypointMap.get("right_knee")
        const leftAnkle = keypointMap.get("left_ankle")
        const rightAnkle = keypointMap.get("right_ankle")

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
          return false
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

        // Check if knees are bent enough for a proper squat
        return leftKneeAngle < 100 && rightKneeAngle < 100

      // Add more exercise types here

      default:
        return false
    }
  }

  // Generate feedback based on pose and exercise type
  const generateFeedback = (pose: poseDetection.Pose, exerciseType: ExerciseType | ""): string => {
    if (!pose.keypoints || !exerciseType) return ""

    // Create a map of keypoints by name for easier access
    const keypointMap = new Map()
    pose.keypoints.forEach((keypoint) => {
      keypointMap.set(keypoint.name, keypoint)
    })

    switch (exerciseType) {
      case "squat":
        // Get key points for squat feedback
        const leftHip = keypointMap.get("left_hip")
        const rightHip = keypointMap.get("right_hip")
        const leftKnee = keypointMap.get("left_knee")
        const rightKnee = keypointMap.get("right_knee")
        const leftAnkle = keypointMap.get("left_ankle")
        const rightAnkle = keypointMap.get("right_ankle")

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
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

        // Generate feedback based on knee angles
        if (leftKneeAngle > 120 || rightKneeAngle > 120) {
          return "Lower your hips more"
        }

        // Check if knees are going too far forward
        const leftKneeForward = leftKnee.x > leftAnkle.x + 50
        const rightKneeForward = rightKnee.x > rightAnkle.x + 50

        if (leftKneeForward || rightKneeForward) {
          return "Keep your knees behind your toes"
        }

        return ""

      // Add more exercise types here

      default:
        return ""
    }
  }

  // Detect potentially dangerous situations
  const detectDangerousSituation = (pose: poseDetection.Pose): boolean => {
    if (!pose.keypoints) return false

    // Create a map of keypoints by name for easier access
    const keypointMap = new Map()
    pose.keypoints.forEach((keypoint) => {
      keypointMap.set(keypoint.name, keypoint)
    })

    // Get key points
    const nose = keypointMap.get("nose")
    const leftAnkle = keypointMap.get("left_ankle")
    const rightAnkle = keypointMap.get("right_ankle")

    if (!nose || !leftAnkle || !rightAnkle) return false

    // Check if the head is too close to the ground (potential fall)
    if (nose.y > leftAnkle.y - 50 || nose.y > rightAnkle.y - 50) {
      return true
    }

    return false
  }

  // Reset rep counter
  const resetRepCount = useCallback(() => {
    repCountRef.current = 0
    setExerciseState((prev) => ({ ...prev, repCount: 0 }))
  }, [])

  return {
    isLoading,
    processPoseFrame,
    exerciseState,
    resetRepCount,
  }
}
