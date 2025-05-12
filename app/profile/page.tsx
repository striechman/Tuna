"use client"

import { motion } from "framer-motion"
import { User, Award, Calendar, ChevronLeft, Settings } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"
import NavBar from "@/components/nav-bar"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.push("/")} className="mr-4">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <TnuaLogo size="md" />
        </div>
        <button>
          <Settings className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-tnua-green/20 flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-tnua-green" />
          </div>
          <h1 className="text-2xl font-bold">Alex Johnson</h1>
          <p className="text-gray-400">@fitness_alex</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-tnua-gray/80 rounded-md p-3 text-center">
            <p className="text-2xl font-bold text-tnua-green">24</p>
            <p className="text-sm text-gray-400">Workouts</p>
          </div>

          <div className="bg-tnua-gray/80 rounded-md p-3 text-center">
            <p className="text-2xl font-bold text-tnua-green">12</p>
            <p className="text-sm text-gray-400">Days Streak</p>
          </div>

          <div className="bg-tnua-gray/80 rounded-md p-3 text-center">
            <p className="text-2xl font-bold text-tnua-green">5</p>
            <p className="text-sm text-gray-400">Badges</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>

        <div className="space-y-4">
          <motion.div
            className="bg-tnua-gray/80 rounded-md p-4 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-full bg-tnua-green/20 flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-tnua-green" />
            </div>
            <div>
              <p className="font-medium">Perfect Form</p>
              <p className="text-gray-400 text-sm">Completed 10 squats with perfect form</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-tnua-gray/80 rounded-md p-4 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-full bg-tnua-green/20 flex items-center justify-center mr-4">
              <Calendar className="h-6 w-6 text-tnua-green" />
            </div>
            <div>
              <p className="font-medium">Consistency</p>
              <p className="text-gray-400 text-sm">Worked out 5 days in a row</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom navigation */}
      <NavBar />
    </div>
  )
}
