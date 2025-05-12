"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Dumbbell, Shield, Activity, Zap, ChevronRight } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const startWorkout = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/workout")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <TnuaLogo size="md" />
        <button className="text-tnua-neon font-bold">Sign In</button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 flex flex-col">
        {/* Hero Section */}
        <section className="mt-8 mb-12">
          <motion.h1
            className="text-4xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            TRAIN <span className="text-tnua-neon">SMARTER</span>
          </motion.h1>
          <motion.p
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            AI-powered workouts with real-time form correction
          </motion.p>
        </section>

        {/* Workout Card */}
        <motion.div
          className="bg-tnua-gray rounded-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-tnua-dark z-10"></div>
            <img src="/placeholder.svg?key=89mdj" alt="Workout" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 p-4 z-20">
              <span className="bg-tnua-neon text-tnua-dark px-2 py-1 rounded text-xs font-bold">FEATURED</span>
              <h2 className="text-2xl font-bold mt-2">High Intensity</h2>
              <p className="text-gray-300">Full Body Workout</p>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Dumbbell size={16} className="text-tnua-neon mr-2" />
                <span className="text-sm text-gray-400">4 exercises</span>
              </div>
              <div className="flex items-center">
                <Activity size={16} className="text-tnua-neon mr-2" />
                <span className="text-sm text-gray-400">20 min</span>
              </div>
            </div>

            <div className="tnua-progress mb-4">
              <div className="tnua-progress-bar w-[75%]"></div>
            </div>

            <button onClick={startWorkout} disabled={isLoading} className="tnua-button-primary w-full py-3 text-lg">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-tnua-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  START WORKOUT <ArrowRight className="ml-2" size={18} />
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Workout Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <button className="text-tnua-neon text-sm font-bold flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tnua-gray rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-tnua-neon/20 flex items-center justify-center mb-3">
                <Dumbbell size={20} className="text-tnua-neon" />
              </div>
              <h3 className="font-bold">Strength</h3>
              <p className="text-xs text-gray-400 mt-1">12 workouts</p>
            </div>

            <div className="bg-tnua-gray rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-tnua-neon/20 flex items-center justify-center mb-3">
                <Activity size={20} className="text-tnua-neon" />
              </div>
              <h3 className="font-bold">Cardio</h3>
              <p className="text-xs text-gray-400 mt-1">8 workouts</p>
            </div>

            <div className="bg-tnua-gray rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-tnua-neon/20 flex items-center justify-center mb-3">
                <Zap size={20} className="text-tnua-neon" />
              </div>
              <h3 className="font-bold">HIIT</h3>
              <p className="text-xs text-gray-400 mt-1">10 workouts</p>
            </div>

            <div className="bg-tnua-gray rounded-xl p-4 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-tnua-neon/20 flex items-center justify-center mb-3">
                <Shield size={20} className="text-tnua-neon" />
              </div>
              <h3 className="font-bold">Recovery</h3>
              <p className="text-xs text-gray-400 mt-1">6 workouts</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent</h2>
            <button className="text-tnua-neon text-sm font-bold flex items-center">
              History <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-tnua-gray rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-tnua-neon/10 flex items-center justify-center mr-4">
                  <Dumbbell size={24} className="text-tnua-neon" />
                </div>
                <div>
                  <h3 className="font-bold">Upper Body</h3>
                  <p className="text-xs text-gray-400">Yesterday • 32 min</p>
                </div>
              </div>
              <div className="bg-tnua-neon text-tnua-dark px-2 py-1 rounded text-xs font-bold">320 CAL</div>
            </div>

            <div className="bg-tnua-gray rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-tnua-neon/10 flex items-center justify-center mr-4">
                  <Activity size={24} className="text-tnua-neon" />
                </div>
                <div>
                  <h3 className="font-bold">Cardio Blast</h3>
                  <p className="text-xs text-gray-400">2 days ago • 45 min</p>
                </div>
              </div>
              <div className="bg-tnua-neon text-tnua-dark px-2 py-1 rounded text-xs font-bold">480 CAL</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
