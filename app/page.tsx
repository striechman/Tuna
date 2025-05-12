"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <TnuaLogo size="md" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 flex flex-col items-center justify-center text-center">
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Smart motion. <span className="text-tnua-green">Real protection.</span>
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg mb-12 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI-powered fitness coach that improves your technique and keeps you safe while training alone.
        </motion.p>

        <motion.div
          className="space-y-4 w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button onClick={() => router.push("/workout")} className="tnua-button-primary w-full py-4 text-lg">
            Start Workout <ArrowRight className="ml-2" size={18} />
          </button>

          <button onClick={() => router.push("/social")} className="tnua-button-secondary w-full py-4 text-lg">
            Social Feed
          </button>
        </motion.div>
      </main>
    </div>
  )
}
