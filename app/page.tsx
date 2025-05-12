"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"
import HamburgerMenu from "@/components/hamburger-menu"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col relative overflow-hidden" dir="rtl">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/workout-background.jpg" alt="אימון" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-tnua-dark via-tnua-dark/80 to-transparent" />
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu />

      {/* Header */}
      <header className="p-6 z-10">
        <TnuaLogo size="md" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 flex flex-col items-center justify-center text-center z-10 mt-12">
        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          תנועה חכמה. <span className="text-tnua-green">הגנה אמיתית.</span>
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg mb-12 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          מאמן כושר מבוסס בינה מלאכותית שמשפר את הטכניקה שלך ושומר עליך בטוח בזמן אימון לבד.
        </motion.p>

        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button onClick={() => router.push("/workout")} className="tnua-button-primary w-full py-4 text-lg">
            התחל אימון <ArrowRight className="mr-2" size={18} />
          </button>
        </motion.div>
      </main>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-tnua-dark to-transparent z-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  )
}
