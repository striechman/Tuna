"use client"

import { AlertTriangle, Phone } from "lucide-react"
import { motion } from "framer-motion"

export default function EmergencyAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Alert header */}
        <div className="bg-red-500 p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Emergency Alert</h3>
            <p className="text-white/80">Possible fall or unsafe posture detected</p>
          </div>
        </div>

        {/* Alert content */}
        <div className="p-6">
          <p className="text-white text-lg mb-2">Are you okay?</p>
          <p className="text-gray-400 mb-6">
            Emergency contacts will be notified in <span className="font-bold text-white">30 seconds</span> if you don't
            cancel.
          </p>

          <div className="flex flex-col gap-3">
            <button
              className="bg-white text-black py-3 font-bold rounded-full hover:bg-white/90 active:scale-95"
              onClick={onDismiss}
            >
              I'm fine - Cancel
            </button>

            <button className="bg-red-600 text-white py-3 font-bold rounded-full hover:bg-red-700 active:scale-95 flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" /> Call emergency contact
            </button>
          </div>
        </div>

        {/* Countdown timer */}
        <div className="px-6 pb-6">
          <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="bg-red-500 h-full animate-[shrink_30s_linear_forwards]"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
