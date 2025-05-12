"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

interface ExerciseInstructionsProps {
  exercise: string
  onClose: () => void
}

export default function ExerciseInstructions({ exercise, onClose }: ExerciseInstructionsProps) {
  // Exercise instructions data
  const exerciseData: Record<
    string,
    {
      title: string
      steps: string[]
      tips: string[]
      image: string
    }
  > = {
    סקווטים: {
      title: "סקווטים",
      steps: [
        "עמוד עם הרגליים ברוחב הכתפיים",
        "החזק את הגב ישר והסתכל קדימה",
        "הורד את הישבן לאחור ולמטה כאילו אתה מתיישב על כיסא",
        "הקפד שהברכיים לא יעברו את קצות האצבעות",
        "רד עד שהירכיים מקבילות לרצפה",
        "דחוף דרך העקבים כדי לחזור למצב עמידה",
      ],
      tips: ["שמור על הגב ישר לאורך כל התרגיל", "הקפד שהברכיים לא יתכופפו פנימה", "נשום פנימה בירידה, החוצה בעלייה"],
      image: "/images/squat-instruction.jpg",
    },
    // Add more exercises as needed
  }

  // Get the current exercise data or use default
  const currentExerciseData = exerciseData[exercise] || {
    title: exercise,
    steps: ["עמוד בתנוחת המוצא", "בצע את התרגיל בהתאם להנחיות", "שמור על טכניקה נכונה"],
    tips: ["שמור על נשימה סדירה", "הקפד על יציבה נכונה"],
    image: "/images/default-exercise.jpg",
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      dir="rtl"
    >
      <motion.div
        className="bg-tnua-dark rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/70 hover:text-white p-1"
            aria-label="סגור"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-4">{currentExerciseData.title}</h2>

          <div className="rounded-lg overflow-hidden mb-6 bg-tnua-gray/30">
            <img
              src={currentExerciseData.image || "/placeholder.svg"}
              alt={currentExerciseData.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/diverse-group-exercising.png"
              }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-tnua-green mb-2">שלבי ביצוע</h3>
            <ol className="space-y-2 text-white">
              {currentExerciseData.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="bg-tnua-green text-tnua-dark w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-bold text-tnua-green mb-2">טיפים</h3>
            <ul className="space-y-2 text-white">
              {currentExerciseData.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-tnua-green ml-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={onClose} className="mt-8 w-full bg-tnua-green text-tnua-dark font-bold py-3 rounded-md">
            הבנתי, בואו נתחיל
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
