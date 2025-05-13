"use client"

import { useState, useRef } from "react"
import { WorkoutCamera } from "@/components/workout-camera"
import type { PoseData } from "@/services/pose-detection-service"
import type { ExerciseState } from "@/services/exercise-detection-service"
import type { EmergencyState } from "@/services/emergency-detection-service"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, Info } from "lucide-react"

export default function Home() {
  const [poseData, setPoseData] = useState<PoseData | null>(null)
  const [exerciseState, setExerciseState] = useState<ExerciseState | null>(null)
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePoseDetected = (pose: PoseData) => {
    setPoseData(pose)
  }

  const handleExerciseDetected = (state: ExerciseState) => {
    setExerciseState(state)
  }

  const handleEmergencyDetected = (state: EmergencyState) => {
    setEmergencyState(state)
  }

  const handleError = (error: string) => {
    setError(error)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TNUA Fitness
          </h1>
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>
        </header>

        <div className="relative aspect-video max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl">
          <WorkoutCamera
            ref={videoRef}
            onPoseDetected={handlePoseDetected}
            onExerciseDetected={handleExerciseDetected}
            onEmergencyDetected={handleEmergencyDetected}
            onError={handleError}
          />

          <AnimatePresence>
            {exerciseState && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 bg-black/80 p-4 rounded-lg backdrop-blur-sm"
              >
                <h3 className="text-xl font-semibold mb-2">{exerciseState.exercise}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${exerciseState.formScore}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-sm">{exerciseState.formScore}%</span>
                  </div>
                  <p className="text-sm text-gray-300">{exerciseState.feedback}</p>
                </div>
              </motion.div>
            )}

            {emergencyState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center bg-red-900/90 backdrop-blur-sm"
              >
                <div className="text-center p-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-4">התראה!</h2>
                  <p className="text-xl mb-6">{emergencyState.message}</p>
                  <div className="space-y-4">
                    {emergencyState.recommendations.map((rec, index) => (
                      <p key={index} className="text-lg">{rec}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-4 right-4 bg-red-900/90 p-4 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
