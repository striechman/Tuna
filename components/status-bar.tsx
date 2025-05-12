"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"

export default function StatusBar({
  exercise,
  repCount,
  postureFeedback,
}: {
  exercise: string
  repCount: number
  postureFeedback: string
}) {
  // Format exercise name for display
  const formatExerciseName = (name: string) => {
    if (!name || name === "unknown") return "READY"

    // Convert snake_case or camelCase to Title Case with spaces
    return name
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
      .trim()
      .toUpperCase()
  }

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 bg-tnua-dark/90 backdrop-blur-md p-4 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">{formatExerciseName(exercise)}</h2>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-bold text-tnua-neon">{repCount}</span>
            <span className="text-gray-400 ml-2 uppercase">reps</span>

            <div className="ml-4 flex items-center bg-tnua-gray/50 px-2 py-1 rounded">
              <Flame className="h-4 w-4 text-tnua-neon mr-1" />
              <span className="text-xs font-bold">{Math.floor(repCount * 12.5)} CAL</span>
            </div>
          </div>
        </div>

        {postureFeedback && (
          <motion.div
            className="bg-tnua-gray border-l-4 border-tnua-neon rounded-r-lg px-3 py-2 max-w-[60%]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white font-bold text-sm">{postureFeedback}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
