"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, RotateCcw, ChevronLeft, Play, Pause, Clock, Flame } from "lucide-react"
import { motion } from "framer-motion"
import WorkoutCamera from "@/components/workout-camera"
import StatusBar from "@/components/status-bar"
import AudioFeedback from "@/components/audio-feedback"
import EmergencyAlert from "@/components/emergency-alert"
import BottomNav from "@/components/bottom-nav"
import TnuaLogo from "@/components/ui/tnua-logo"
import { useRouter } from "next/navigation"

export default function WorkoutPage() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [currentExercise, setCurrentExercise] = useState("Squats")
  const [repCount, setRepCount] = useState(0)
  const [postureFeedback, setPostureFeedback] = useState("")
  const [isPaused, setIsPaused] = useState(false)
  const [workoutTime, setWorkoutTime] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [calories, setCalories] = useState(0)

  // Simulate posture feedback and rep counting
  useEffect(() => {
    if (isPaused) return

    const feedbackOptions = ["", "Keep your back straight", "Lower your hips more", "Keep your knees behind your toes"]

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * feedbackOptions.length)
      setPostureFeedback(feedbackOptions[randomIndex])

      // Increment rep count occasionally
      if (Math.random() > 0.7) {
        setRepCount((prev) => prev + 1)
        setCalories((prev) => prev + Math.floor(Math.random() * 5) + 5)
      }

      // Simulate emergency alert (rare)
      if (Math.random() > 0.95 && !showEmergency) {
        setShowEmergency(true)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused, showEmergency])

  // Track workout time
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setWorkoutTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused])

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

  return (
    <div className="flex flex-col h-screen bg-tnua-dark text-white overflow-hidden">
      {/* Intro overlay */}
      {showIntro && (
        <motion.div
          className="absolute inset-0 z-50 bg-tnua-dark flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          onAnimationComplete={() => setShowIntro(false)}
        >
          <TnuaLogo size="lg" className="mb-6" />
          <motion.div
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="text-tnua-neon">HIGH INTENSITY</span> WORKOUT
          </motion.div>
          <motion.div
            className="text-gray-400 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            GET READY TO START...
          </motion.div>
        </motion.div>
      )}

      {/* Main workout area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Back button */}
        <motion.button
          className="absolute top-4 left-4 z-20 bg-tnua-gray text-white p-2 rounded-lg"
          onClick={() => router.push("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        {/* Camera feed with pose detection */}
        <WorkoutCamera />

        {/* Status bar overlay */}
        <StatusBar exercise={currentExercise} repCount={repCount} postureFeedback={postureFeedback} />

        {/* Workout stats */}
        <motion.div
          className="absolute top-20 right-4 bg-tnua-gray rounded-lg p-3 z-20 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-tnua-neon mr-2" />
            <span className="text-sm font-bold">{formatTime(workoutTime)}</span>
          </div>
          <div className="flex items-center">
            <Flame className="h-4 w-4 text-tnua-neon mr-2" />
            <span className="text-sm font-bold">{calories} CAL</span>
          </div>
        </motion.div>

        {/* Control buttons */}
        <motion.div
          className="absolute top-20 left-16 z-20 flex gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button className="bg-tnua-gray text-white p-2 rounded-lg" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <button className="bg-tnua-gray text-white p-2 rounded-lg" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>

          <button className="bg-tnua-gray text-white p-2 rounded-lg" onClick={() => setRepCount(0)}>
            <RotateCcw className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Audio feedback player */}
        <AudioFeedback isMuted={isMuted} feedback={postureFeedback} />

        {/* Emergency alert */}
        {showEmergency && <EmergencyAlert onDismiss={() => setShowEmergency(false)} />}

        {/* Pause overlay */}
        {isPaused && (
          <motion.div
            className="absolute inset-0 bg-tnua-dark/80 backdrop-blur-sm flex items-center justify-center z-25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">WORKOUT PAUSED</h2>
              <button className="tnua-button-primary py-3 px-8 text-lg" onClick={() => setIsPaused(false)}>
                RESUME
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}
