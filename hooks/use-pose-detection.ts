"use client"

import { useState, useRef } from "react"

// Define a simplified type for pose results
type PoseResults = {
  poseLandmarks?: Array<{
    x: number
    y: number
    z: number
    visibility?: number
  }>
}

import { analyzeExercise, detectDangerousSituation } from "@/utils/pose-analysis"

interface UsePoseDetectionProps {
  exerciseType: string
}

interface PoseAnalysisResult {
  isCorrectForm: boolean
  repCount: number
  feedback: string
  isDangerous: boolean
}

export function usePoseDetection({ exerciseType }: UsePoseDetectionProps) {
  const [analysisResult, setAnalysisResult] = useState<PoseAnalysisResult>({
    isCorrectForm: false,
    repCount: 0,
    feedback: "",
    isDangerous: false,
  })

  const lastPoseState = useRef<boolean>(false)
  const repCountRef = useRef<number>(0)

  // Process pose detection results
  const processPoseResults = (results: PoseResults) => {
    if (!results.poseLandmarks) return

    // Analyze the exercise form
    const isCorrectForm = analyzeExercise(results, exerciseType)

    // Check for rep completion (transition from correct form to incorrect form)
    // This is a simple implementation - would need refinement for different exercises
    if (isCorrectForm && !lastPoseState.current) {
      repCountRef.current += 1
    }
    lastPoseState.current = isCorrectForm

    // Check for dangerous situations
    const isDangerous = detectDangerousSituation(results)

    // Generate feedback based on pose analysis
    // This would be more sophisticated in a real implementation
    let feedback = ""
    if (!isCorrectForm) {
      if (exerciseType.toLowerCase() === "squat") {
        feedback = "Lower your hips more"
      }
    }

    setAnalysisResult({
      isCorrectForm,
      repCount: repCountRef.current,
      feedback,
      isDangerous,
    })
  }

  return {
    analysisResult,
    processPoseResults,
  }
}
