"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, ChevronLeft, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import WorkoutCamera from "@/components/workout-camera"
import StatusBar from "@/components/status-bar"
import AudioFeedback from "@/components/audio-feedback"
import EmergencyAlert from "@/components/emergency-alert"
import NavBar from "@/components/nav-bar"
import TnuaLogo from "@/components/ui/tnua-logo"
import { useRouter } from "next/navigation"

export default function WorkoutPage() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [currentExercise, setCurrentExercise] = useState("סקווטים")
  const [repCount, setRepCount] = useState(0)
  const [postureFeedback, setPostureFeedback] = useState("")
  const [workoutTime, setWorkoutTime] = useState(0)
  const [showIntro, setShowIntro] = useState(true)

  // Simulate posture feedback and rep counting
  useEffect(() => {
    const feedbackOptions = ["", "שמור על הגב ישר", "הורד את הירכיים יותר", "שמור על הברכיים מאחורי כפות הרגליים"]

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * feedbackOptions.length)
      setPostureFeedback(feedbackOptions[randomIndex])

      // Increment rep count occasionally
      if (Math.random() > 0.7) {
        setRepCount((prev) => prev + 1)
      }

      // Simulate emergency alert (rare)
      if (Math.random() > 0.95 && !showEmergency) {
        setShowEmergency(true)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [showEmergency])

  // Track workout time
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkoutTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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
    <div className="flex flex-col h-screen bg-tnua-dark text-white overflow-hidden" dir="rtl">
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
            <span className="text-tnua-green">תנועה חכמה.</span> הגנה אמיתית.
          </motion.div>
          <motion.div
            className="text-gray-400 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            מתכונן להתחיל...
          </motion.div>
        </motion.div>
      )}

      {/* Main workout area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Back button */}
        <motion.button
          className="absolute top-4 right-4 z-20 bg-tnua-gray/80 text-white p-2 rounded-full"
          onClick={() => router.push("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        {/* Share button */}
        <motion.button
          className="absolute top-4 left-4 z-20 bg-tnua-gray/80 text-white p-2 rounded-full"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Share2 className="h-5 w-5" />
        </motion.button>

        {/* Camera feed with pose detection */}
        <WorkoutCamera />

        {/* Status bar overlay */}
        <StatusBar exercise={currentExercise} repCount={repCount} postureFeedback={postureFeedback} />

        {/* Workout timer */}
        <motion.div
          className="absolute top-20 left-4 bg-tnua-gray/80 backdrop-blur-sm rounded-full px-4 py-2 z-20 flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="text-sm font-medium text-white">{formatTime(workoutTime)}</span>
        </motion.div>

        {/* Mute button */}
        <motion.button
          className="absolute top-20 right-16 z-20 bg-tnua-gray/80 text-white p-2 rounded-full"
          onClick={() => setIsMuted(!isMuted)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </motion.button>

        {/* Audio feedback player */}
        <AudioFeedback isMuted={isMuted} feedback={postureFeedback} />

        {/* Emergency alert */}
        {showEmergency && <EmergencyAlert onDismiss={() => setShowEmergency(false)} />}
      </div>

      {/* Bottom navigation */}
      <NavBar />
    </div>
  )
}
