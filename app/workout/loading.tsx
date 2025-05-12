"use client"

import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function WorkoutLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <TnuaLogo size="lg" className="mb-8" />
      <div className="relative">
        <RefreshCw className="h-10 w-10 text-tnua-green animate-spin" />
        <motion.div
          className="absolute inset-0 bg-tnua-green rounded-full blur-xl"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
      <p className="mt-6 text-xl font-medium">Loading workout screen...</p>
      <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
    </div>
  )
}
