"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function AnimatedPreloader() {
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-tnua-dark flex flex-col items-center justify-center z-50">
      <div className="relative mb-8">
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

      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>

      <div className="relative">
        <motion.div
          className="text-xl font-medium text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Preparing your workout
        </motion.div>

        <motion.div
          className="flex justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 mx-1 bg-cyan-500 rounded-full"
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
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex justify-center items-center p-6">
          <div className="w-16 h-16 relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-500/20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-cyan-500/40"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-4 rounded-full bg-cyan-500/60"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
