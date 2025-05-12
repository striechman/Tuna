"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import TnuaLogo from "@/components/ui/tnua-logo"
import { Dumbbell, Brain, Zap, CheckCircle } from "lucide-react"

export default function AnimatedPreloader() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState(0)

  // Loading stages with messages and icons
  const loadingStages = [
    { message: "Preparing your workout", icon: Dumbbell, color: "#00E0FF" },
    { message: "Setting up exercises", icon: Zap, color: "#9747FF" },
    { message: "Loading AI model", icon: Brain, color: "#FF47B5" },
    { message: "Almost ready", icon: CheckCircle, color: "#00E676" },
  ]

  // Current stage info
  const currentStage = loadingStages[loadingStage]

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }

        // Update loading stage based on progress
        if (prev >= 75 && loadingStage !== 3) {
          setLoadingStage(3)
        } else if (prev >= 50 && loadingStage !== 2) {
          setLoadingStage(2)
        } else if (prev >= 25 && loadingStage !== 1) {
          setLoadingStage(1)
        }

        return prev + 0.5
      })
    }, 150)

    return () => clearInterval(interval)
  }, [loadingStage])

  // Animated fitness figure
  const FitnessFigure = () => (
    <motion.div
      className="relative w-40 h-40 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated figure doing exercises */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.circle
          cx="50"
          cy="25"
          r="10"
          fill="#00E0FF"
          animate={{ y: [0, -5, 0, -5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Body */}
        <motion.line
          x1="50"
          y1="35"
          x2="50"
          y2="60"
          stroke="#00E0FF"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Arms */}
        <motion.line
          x1="50"
          y1="45"
          x2="30"
          y2="40"
          stroke="#00E0FF"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, 20, 0, -20, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.line
          x1="50"
          y1="45"
          x2="70"
          y2="40"
          stroke="#00E0FF"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, -20, 0, 20, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Legs */}
        <motion.line
          x1="50"
          y1="60"
          x2="35"
          y2="85"
          stroke="#00E0FF"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, 15, 0, -15, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.line
          x1="50"
          y1="60"
          x2="65"
          y2="85"
          stroke="#00E0FF"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: [0, -15, 0, 15, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Dumbbells */}
        <motion.rect
          x="20"
          y="40"
          width="10"
          height="5"
          rx="2"
          fill="#FF47B5"
          animate={{ rotate: [0, 20, 0, -20, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.rect
          x="70"
          y="40"
          width="10"
          height="5"
          rx="2"
          fill="#FF47B5"
          animate={{ rotate: [0, -20, 0, 20, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </svg>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ background: `radial-gradient(circle, ${currentStage.color} 0%, rgba(0,0,0,0) 70%)` }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </motion.div>
  )

  return (
    <div className="fixed inset-0 bg-tnua-dark flex flex-col items-center justify-center z-50">
      <div className="relative mb-4">
        <TnuaLogo size="lg" />
        <motion.div
          className="absolute -inset-4 rounded-full"
          initial={{ background: "radial-gradient(circle, rgba(0,224,255,0.2) 0%, rgba(0,0,0,0) 70%)" }}
          animate={{
            background: [
              "radial-gradient(circle, rgba(0,224,255,0.2) 0%, rgba(0,0,0,0) 70%)",
              "radial-gradient(circle, rgba(0,224,255,0.4) 0%, rgba(0,0,0,0) 70%)",
              "radial-gradient(circle, rgba(0,224,255,0.2) 0%, rgba(0,0,0,0) 70%)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      {/* Fitness figure animation */}
      <FitnessFigure />

      {/* Current loading stage */}
      <motion.div
        className="flex items-center mb-6"
        key={loadingStage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: `${currentStage.color}20` }}
        >
          <currentStage.icon className="h-5 w-5" style={{ color: currentStage.color }} />
        </div>
        <span className="text-xl font-medium text-white">{currentStage.message}</span>
      </motion.div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full"
          style={{
            background: `linear-gradient(to right, #00E0FF, #9747FF, #FF47B5)`,
            width: `${loadingProgress}%`,
          }}
          transition={{ ease: "easeInOut" }}
        />
      </div>

      {/* Loading dots */}
      <motion.div
        className="flex justify-center mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 mx-1 rounded-full"
            style={{ backgroundColor: currentStage.color }}
            animate={{ y: ["0%", "-100%", "0%"] }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Tips */}
      <motion.div
        className="absolute bottom-10 left-0 right-0 text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-gray-400 text-sm">
          {loadingStage === 0 && "Tip: Make sure your entire body is visible in the frame"}
          {loadingStage === 1 && "Tip: Keep a good distance from the camera for better tracking"}
          {loadingStage === 2 && "Tip: Wear contrasting clothes for better detection"}
          {loadingStage === 3 && "Tip: Follow the on-screen instructions for proper form"}
        </p>
      </motion.div>
    </div>
  )
}
