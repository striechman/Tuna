"use client"

import { useEffect, useRef } from "react"
import { Volume2 } from "lucide-react"
import { motion } from "framer-motion"

export default function AudioFeedback({
  isMuted,
  feedback,
}: {
  isMuted: boolean
  feedback: string
}) {
  const lastFeedbackRef = useRef("")

  // Simulate audio feedback
  useEffect(() => {
    if (isMuted || !feedback || feedback === lastFeedbackRef.current) return

    // Update last feedback to avoid repeating the same message
    lastFeedbackRef.current = feedback

    // In a real app, this would trigger the ElevenLabs voice API
    console.log("Playing audio feedback:", feedback)

    // For demo purposes, we'll show a visual indicator
    const audioIndicator = document.getElementById("audio-indicator")
    if (audioIndicator) {
      audioIndicator.classList.add("animate-pulse")
      setTimeout(() => {
        audioIndicator.classList.remove("animate-pulse")
      }, 2000)
    }
  }, [feedback, isMuted])

  if (isMuted) return null

  return (
    <motion.div
      id="audio-indicator"
      className="absolute bottom-24 left-4 bg-tnua-gray/90 backdrop-blur-md rounded-lg p-2 z-20 flex items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-8 h-8 rounded-lg bg-tnua-neon/20 flex items-center justify-center mr-2">
        <Volume2 className="h-4 w-4 text-tnua-neon" />
      </div>
      <span className="text-sm font-bold text-white uppercase">Audio feedback active</span>
    </motion.div>
  )
}
