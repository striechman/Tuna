"use client"

import { AlertTriangle, X, Phone } from "lucide-react"
import { motion } from "framer-motion"

export default function EmergencyAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      className="absolute inset-x-4 top-1/4 bg-black/90 backdrop-blur-md rounded-md border-l-4 border-red-500 p-5 z-30 shadow-lg"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-lg bg-red-500/30 flex items-center justify-center mr-4 animate-pulse">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">Emergency Alert</h3>
          <p className="text-gray-300 mt-1">Possible fall or unsafe position detected. Are you okay?</p>
          <p className="text-gray-300 mt-1">
            Emergency contacts will be notified in <span className="font-bold text-white">30 seconds</span> if not
            dismissed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              className="bg-white text-black py-3 px-6 font-medium rounded-md hover:bg-white/90 active:scale-95"
              onClick={onDismiss}
            >
              I'm OK - Dismiss
            </button>

            <button className="bg-red-600 text-white py-3 px-6 font-medium rounded-md hover:bg-red-700 active:scale-95 flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" /> Call Emergency Contact
            </button>
          </div>
        </div>

        <button className="text-white/70 hover:text-white p-1" onClick={onDismiss}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Countdown timer */}
      <div className="mt-4 bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div className="bg-red-500 h-full animate-[shrink_30s_linear_forwards]"></div>
      </div>
    </motion.div>
  )
}
