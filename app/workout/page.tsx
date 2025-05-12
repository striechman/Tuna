"use client"

import { useState, useEffect, useRef } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import WorkoutCamera from "@/components/workout-camera"
import ExerciseInstructions from "@/components/exercise-instructions"
import EmergencyAlert from "@/components/emergency-alert"
import { useRouter } from "next/navigation"
import Script from "next/script"

export default function WorkoutPage() {
  const router = useRouter()
  const [showEmergency, setShowEmergency] = useState(false)
  const [currentExercise, setCurrentExercise] = useState("Squats")
  const [repCount, setRepCount] = useState(0)
  const [postureFeedback, setPostureFeedback] = useState("")
  const [workoutTime, setWorkoutTime] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [bodyPartsDetected, setBodyPartsDetected] = useState(false)
  const [showBodyPartAlert, setShowBodyPartAlert] = useState(false)
  const [exerciseCorrect, setExerciseCorrect] = useState(false)
  const [showStoryControls, setShowStoryControls] = useState(true)
  const [storyProgress, setStoryProgress] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Track workout time
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkoutTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Auto-hide story controls after 3 seconds of inactivity
  useEffect(() => {
    if (showStoryControls) {
      const timer = setTimeout(() => {
        setShowStoryControls(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showStoryControls])

  // Handle pose detection status
  const handlePoseDetectionStatus = (detected: boolean, landmarks: any[]) => {
    setBodyPartsDetected(detected)

    if (!detected && !showBodyPartAlert) {
      setShowBodyPartAlert(true)
      setTimeout(() => setShowBodyPartAlert(false), 3000)
    }

    // Simulate exercise recognition
    if (detected) {
      // This is where we would implement the actual exercise recognition logic
      // based on the GitHub project: https://github.com/chrisprasanna/Exercise_Recognition_AI
      const isCorrect = Math.random() > 0.3 // Simulate correct form detection
      setExerciseCorrect(isCorrect)

      // Increment rep count when exercise is done correctly
      if (isCorrect && Math.random() > 0.7) {
        setRepCount((prev) => prev + 1)
      }

      // Update posture feedback
      if (!isCorrect) {
        const feedbackOptions = [
          "Keep your back straight",
          "Lower your hips more",
          "Keep your knees behind your toes",
          "Lift your chest",
          "Keep weight on your heels",
        ]
        const randomIndex = Math.floor(Math.random() * feedbackOptions.length)
        setPostureFeedback(feedbackOptions[randomIndex])
      } else {
        setPostureFeedback("")
      }
    }
  }

  // Update story progress
  useEffect(() => {
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 0.5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="flex flex-col h-screen bg-black text-white overflow-hidden relative"
      onClick={() => setShowStoryControls(true)}
    >
      {/* Load scripts directly in the component */}
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js" strategy="afterInteractive" />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.0/dist/pose-detection.min.js"
        strategy="afterInteractive"
      />

      {/* Story progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 flex gap-1">
        <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${storyProgress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </div>

      {/* Intro overlay */}
      {showIntro && (
        <motion.div
          className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          onAnimationComplete={() => setShowIntro(false)}
        >
          <motion.div
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="text-tnua-green">TNUA</span> FITNESS
          </motion.div>
          <motion.div
            className="text-gray-400 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Getting ready...
          </motion.div>
        </motion.div>
      )}

      {/* Main workout area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Camera feed */}
        <WorkoutCamera videoRef={videoRef} onPoseDetectionStatus={handlePoseDetectionStatus} />

        {/* Instagram-like UI elements */}
        <AnimatePresence>
          {showStoryControls && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Top controls */}
              <div className="absolute top-0 left-0 right-0 pt-8 px-4 flex justify-between items-center pointer-events-auto">
                <button className="bg-black/40 backdrop-blur-sm p-2 rounded-full" onClick={() => router.push("/")}>
                  <X className="h-6 w-6" />
                </button>

                <div className="flex gap-3">
                  <button
                    className="bg-black/40 backdrop-blur-sm p-2 rounded-full"
                    onClick={() => setShowInstructions(true)}
                  >
                    <Info className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Exercise info */}
              <div className="absolute top-20 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentExercise}</span>
                  <span className="text-tnua-green text-xl font-bold">{repCount}</span>
                </div>
              </div>

              {/* Workout timer */}
              <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-lg font-bold">{formatTime(workoutTime)}</span>
              </div>

              {/* Body parts detection indicator */}
              <div
                className={`absolute top-36 left-4 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 ${bodyPartsDetected ? "text-green-400" : "text-yellow-400"}`}
              >
                {bodyPartsDetected ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Body detected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span>Searching for body</span>
                  </>
                )}
              </div>

              {/* Posture feedback */}
              {postureFeedback && (
                <motion.div
                  className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="text-white font-medium text-lg">{postureFeedback}</p>
                </motion.div>
              )}

              {/* Exercise status indicator */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                <motion.div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${exerciseCorrect ? "bg-green-500/20" : "bg-yellow-500/20"}`}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  {exerciseCorrect ? (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-400" />
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body parts detection alert */}
        <AnimatePresence>
          {showBodyPartAlert && (
            <motion.div
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md px-6 py-4 rounded-xl z-30 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <AlertCircle className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg mb-1">Not all body parts detected</p>
              <p className="text-gray-300">Move away from the camera and make sure your full body is in frame</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency alert */}
        {showEmergency && <EmergencyAlert onDismiss={() => setShowEmergency(false)} />}

        {/* Exercise instructions overlay */}
        <AnimatePresence>
          {showInstructions && (
            <ExerciseInstructions exercise={currentExercise} onClose={() => setShowInstructions(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
