"use client"

import { useState, useRef } from "react"
import WorkoutCamera from "@/components/workout-camera"
import type { PoseData } from "@/services/pose-detection-service"
import type { ExerciseState } from "@/services/exercise-detection-service"
import type { EmergencyState } from "@/services/emergency-detection-service"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [poseDetected, setPoseDetected] = useState(false)
  const [exerciseState, setExerciseState] = useState<ExerciseState | null>(null)
  const [emergencyState, setEmergencyState] = useState<EmergencyState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handlePoseDetection = (detected: boolean, poses: PoseData[]) => {
    setPoseDetected(detected)
  }

  const handleExerciseDetected = (state: ExerciseState) => {
    setExerciseState(state)
  }

  const handleEmergencyDetected = (state: EmergencyState) => {
    setEmergencyState(state)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TNUA Fitness
          </h1>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="relative w-full max-w-6xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <WorkoutCamera
            videoRef={videoRef}
            onPoseDetectionStatus={handlePoseDetection}
            onExerciseDetected={handleExerciseDetected}
            onEmergencyDetected={handleEmergencyDetected}
            onError={handleError}
          />

          {/* Exercise info overlay */}
          <AnimatePresence>
            {exerciseState && exerciseState.type !== "unknown" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl text-white shadow-lg"
              >
                <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {exerciseState.type.replace("_", " ").toUpperCase()}
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">Reps:</span>
                    <span className="font-semibold">{exerciseState.repCount}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">Form Score:</span>
                    <span className="font-semibold">{exerciseState.formScore.toFixed(0)}%</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emergency alert overlay */}
          <AnimatePresence>
            {emergencyState && emergencyState.isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500/90 backdrop-blur-md flex items-center justify-center"
              >
                <div className="text-center text-white p-8 rounded-2xl bg-black/30">
                  <h2 className="text-4xl font-bold mb-4">Emergency Detected!</h2>
                  <p className="text-2xl mb-2">Type: {emergencyState.type.toUpperCase()}</p>
                  <p className="text-xl">Confidence: {(emergencyState.confidence * 100).toFixed(0)}%</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center"
              >
                <div className="text-center text-white p-8 rounded-2xl bg-red-500/30">
                  <h2 className="text-3xl font-bold mb-4">Error</h2>
                  <p className="text-xl">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
