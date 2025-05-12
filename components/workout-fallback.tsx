"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WorkoutFallback() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/")
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col items-center justify-center p-6">
      <motion.div
        className="bg-tnua-gray/80 rounded-lg p-6 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Workout Mode Unavailable</h2>
        <p className="text-gray-300 mb-6">We couldn't initialize the pose detection system. This could be due to:</p>

        <ul className="text-left text-gray-300 mb-6 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Your browser doesn't support the required features</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Camera access was denied or unavailable</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Network issues prevented loading the necessary resources</span>
          </li>
        </ul>

        <button
          onClick={() => router.push("/")}
          className="tnua-button-primary w-full py-3 flex items-center justify-center"
        >
          Return to Home <ArrowRight className="ml-2 h-4 w-4" />
        </button>

        <p className="text-gray-400 mt-4">Redirecting in {countdown} seconds...</p>
      </motion.div>
    </div>
  )
}
