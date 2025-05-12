"use client"

import { motion } from "framer-motion"

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
    if (!name || name === "unknown") return "Ready"

    // Convert snake_case or camelCase to Title Case with spaces
    return name
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
      .trim()
  }

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 bg-tnua-dark/80 backdrop-blur-md p-4 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">{formatExerciseName(exercise)}</h2>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-bold text-tnua-green">{repCount}</span>
            <span className="text-gray-300 ml-2">reps</span>
          </div>
        </div>

        {postureFeedback && (
          <motion.div
            className="bg-tnua-gray/80 border-l-4 border-tnua-green rounded-r-md px-3 py-2 max-w-[60%]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white font-medium text-sm">{postureFeedback}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
