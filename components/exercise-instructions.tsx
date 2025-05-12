"use client"

import { motion } from "framer-motion"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import { useState } from "react"

interface ExerciseInstructionsProps {
  exercise: string
  onClose: () => void
}

export default function ExerciseInstructions({ exercise, onClose }: ExerciseInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Exercise instructions data
  const exerciseData: Record<
    string,
    {
      title: string
      steps: Array<{
        instruction: string
        tip: string
        image: string
      }>
    }
  > = {
    Squats: {
      title: "Squats",
      steps: [
        {
          instruction: "Stand with feet shoulder-width apart",
          tip: "Keep your feet parallel or slightly turned out",
          image: "/images/squat-step1.jpg",
        },
        {
          instruction: "Keep your back straight and look forward",
          tip: "Maintain a lifted chest and neutral spine",
          image: "/images/squat-step2.jpg",
        },
        {
          instruction: "Lower your hips back and down",
          tip: "Imagine sitting back into a chair behind you",
          image: "/images/squat-step3.jpg",
        },
        {
          instruction: "Lower until thighs are parallel to the floor",
          tip: "Make sure your knees don't go past your toes",
          image: "/images/squat-step4.jpg",
        },
        {
          instruction: "Push through your heels to return to standing",
          tip: "Breathe in as you lower, out as you rise",
          image: "/images/squat-step5.jpg",
        },
      ],
    },
    // Add more exercises as needed
  }

  // Get the current exercise data or use default
  const currentExerciseData = exerciseData[exercise] || {
    title: exercise,
    steps: [
      {
        instruction: "Stand in the starting position",
        tip: "Maintain proper posture",
        image: "/images/default-exercise.jpg",
      },
    ],
  }

  const totalSteps = currentExerciseData.steps.length
  const currentStepData = currentExerciseData.steps[currentStep]

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">{currentExerciseData.title}</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Progress indicators */}
      <div className="flex px-4 pt-2 gap-1">
        {currentExerciseData.steps.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full ${index === currentStep ? "bg-tnua-green" : "bg-gray-700"}`}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Step image */}
        <div className="relative flex-1 mb-4 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
          <img
            src={currentStepData.image || "/images/workout-tracking.png"}
            alt={`Step ${currentStep + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/workout-tracking.png"
            }}
          />

          {/* Step number */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white font-bold rounded-full w-10 h-10 flex items-center justify-center">
            {currentStep + 1}/{totalSteps}
          </div>
        </div>

        {/* Step instructions */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-2">{currentStepData.instruction}</h3>
          <p className="text-gray-400">{currentStepData.tip}</p>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between p-4">
        {currentStep > 0 ? (
          <button onClick={prevStep} className="bg-gray-800 text-white px-5 py-3 rounded-full flex items-center">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </button>
        ) : (
          <div></div> // Empty div for spacing
        )}

        <button
          onClick={nextStep}
          className="bg-tnua-green text-black font-bold px-5 py-3 rounded-full flex items-center"
        >
          {currentStep < totalSteps - 1 ? (
            <>
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </>
          ) : (
            "Finish"
          )}
        </button>
      </div>
    </motion.div>
  )
}
