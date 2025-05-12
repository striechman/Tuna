"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, ChevronLeft, Camera, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import WorkoutCamera from "@/components/workout-camera"
import ExerciseInstructions from "@/components/exercise-instructions"
import AudioFeedback from "@/components/audio-feedback"
import EmergencyAlert from "@/components/emergency-alert"
import TnuaLogo from "@/components/ui/tnua-logo"
import HamburgerMenu from "@/components/hamburger-menu"
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
  const [showInstructions, setShowInstructions] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturingImage, setIsCapturingImage] = useState(false)

  const cameraRef = useRef<HTMLVideoElement>(null)

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

  // Function to capture image from camera
  const captureImage = () => {
    if (!cameraRef.current) return

    setIsCapturingImage(true)

    // Create a canvas element
    const canvas = document.createElement("canvas")
    canvas.width = cameraRef.current.videoWidth
    canvas.height = cameraRef.current.videoHeight

    // Draw the video frame to the canvas
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(cameraRef.current, 0, 0, canvas.width, canvas.height)

      // Apply filters to enhance the image
      ctx.filter = "contrast(1.1) brightness(1.05) saturate(1.2)"
      ctx.drawImage(canvas, 0, 0)

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
      setCapturedImage(dataUrl)
    }

    setIsCapturingImage(false)
  }

  return (
    <div className="flex flex-col h-screen bg-tnua-dark text-white overflow-hidden" dir="rtl">
      {/* Hamburger Menu */}
      <HamburgerMenu />

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
          className="absolute top-6 left-6 z-20 bg-tnua-gray/80 text-white p-2 rounded-full"
          onClick={() => router.push("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        {/* Exercise info button */}
        <motion.button
          className="absolute top-6 left-20 z-20 bg-tnua-gray/80 text-white p-2 rounded-full"
          onClick={() => setShowInstructions(!showInstructions)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Info className="h-5 w-5" />
        </motion.button>

        {/* Camera feed or captured image */}
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img src={capturedImage || "/placeholder.svg"} alt="Captured pose" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-tnua-dark via-transparent to-transparent" />

            {/* Return to camera button */}
            <button
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-tnua-green text-tnua-dark font-bold py-3 px-6 rounded-full shadow-lg"
              onClick={() => setCapturedImage(null)}
            >
              חזור למצלמה
            </button>
          </div>
        ) : (
          <>
            <WorkoutCamera cameraRef={cameraRef} />

            {/* Capture image button */}
            <motion.button
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-tnua-green text-tnua-dark font-bold py-3 px-6 rounded-full shadow-lg flex items-center"
              onClick={captureImage}
              disabled={isCapturingImage}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Camera className="ml-2 h-5 w-5" />
              צלם תמונה
            </motion.button>
          </>
        )}

        {/* Exercise header */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-tnua-dark/90 to-transparent pt-20 pb-10 px-6 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">{currentExercise}</h1>
          <div className="flex items-center mt-2">
            <span className="text-4xl font-bold text-tnua-green">{repCount}</span>
            <span className="text-gray-300 mr-2 text-lg">חזרות</span>
            <span className="ml-auto text-white bg-tnua-gray/50 px-3 py-1 rounded-full text-sm">
              {formatTime(workoutTime)}
            </span>
          </div>

          {postureFeedback && (
            <motion.div
              className="mt-4 bg-tnua-gray/70 border-r-4 border-tnua-green rounded-md px-4 py-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white font-medium">{postureFeedback}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Mute button */}
        <motion.button
          className="absolute bottom-24 right-6 z-20 bg-tnua-gray/80 text-white p-3 rounded-full"
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
