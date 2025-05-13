"use client"

import { motion } from "framer-motion"
import { Dumbbell } from "lucide-react"

export default function AnimatedPreloader() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Logo animation */}
        <motion.div
          className="mb-8 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl font-bold">
            <span className="text-white">T</span>
            <span className="text-tnua-green">NUA</span>
          </div>
        </motion.div>

        {/* Fitness animation */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-tnua-green/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
          >
            <Dumbbell className="h-10 w-10 text-tnua-green" />
          </motion.div>
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-tnua-green/30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading text */}
        <div className="text-center mb-8">
          <motion.h2
            className="text-xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Preparing Your Workout
          </motion.h2>
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Setting up your personalized fitness experience...
          </motion.p>
        </div>

        {/* Loading bar */}
        <motion.div
          className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-tnua-green"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading steps */}
        <div className="w-full mt-6">
          <motion.div
            className="flex items-center text-sm text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-tnua-green/20 flex items-center justify-center mr-3"
              animate={{
                backgroundColor: ["rgba(0, 230, 118, 0.2)", "rgba(0, 230, 118, 0.5)", "rgba(0, 230, 118, 0.2)"],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <motion.div className="w-2 h-2 rounded-full bg-tnua-green" />
            </motion.div>
            <span>Loading fitness models...</span>
          </motion.div>

          <motion.div
            className="flex items-center text-sm text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-tnua-green/20 flex items-center justify-center mr-3"
              animate={{
                backgroundColor: ["rgba(0, 230, 118, 0.2)", "rgba(0, 230, 118, 0.5)", "rgba(0, 230, 118, 0.2)"],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
            >
              <motion.div className="w-2 h-2 rounded-full bg-tnua-green" />
            </motion.div>
            <span>Initializing pose detection...</span>
          </motion.div>

          <motion.div
            className="flex items-center text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 0.5 }}
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-tnua-green/20 flex items-center justify-center mr-3"
              animate={{
                backgroundColor: ["rgba(0, 230, 118, 0.2)", "rgba(0, 230, 118, 0.5)", "rgba(0, 230, 118, 0.2)"],
              }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
            >
              <motion.div className="w-2 h-2 rounded-full bg-tnua-green" />
            </motion.div>
            <span>Preparing workout interface...</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
