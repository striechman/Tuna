"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"
import HamburgerMenu from "@/components/hamburger-menu"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/workout-tracking.png"
          alt="Workout with motion tracking"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tnua-dark via-tnua-dark/70 to-tnua-dark/30" />
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu />

      {/* Header */}
      <header className="p-6 z-10">
        <TnuaLogo size="md" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-32 flex flex-col items-center justify-end z-10 mt-auto">
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Smart Movement. <span className="text-tnua-green">Real Protection.</span>
        </motion.h1>

        <motion.p
          className="text-gray-300 text-lg mb-16 max-w-md text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI-powered fitness coach that improves your technique and keeps you safe while working out alone.
        </motion.p>

        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button onClick={() => router.push("/workout")} className="tnua-button-primary w-full py-4 text-lg">
            Start Workout <ArrowRight className="ml-2" size={18} />
          </button>
        </motion.div>
      </main>
    </div>
  )
}
