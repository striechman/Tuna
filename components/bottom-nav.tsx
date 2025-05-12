"use client"

import type React from "react"

import { Home, Dumbbell, BarChart2, Settings } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function BottomNav() {
  return (
    <motion.div
      className="bg-tnua-dark/95 backdrop-blur-md border-t border-tnua-gray py-2 px-4 flex justify-around items-center z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <NavButton icon={<Home className="h-6 w-6" />} label="HOME" href="/" />
      <NavButton icon={<Dumbbell className="h-6 w-6" />} label="WORKOUT" href="/workout" active />
      <NavButton icon={<BarChart2 className="h-6 w-6" />} label="STATS" href="/progress" />
      <NavButton icon={<Settings className="h-6 w-6" />} label="SETTINGS" href="/settings" />
    </motion.div>
  )
}

function NavButton({
  icon,
  label,
  active = false,
  href,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center py-1 px-3 relative ${
        active ? "text-tnua-neon" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-xs mt-1 font-bold">{label}</span>
      {active && (
        <motion.div
          className="absolute -bottom-2 h-1 w-8 bg-tnua-neon rounded-t-md"
          layoutId="nav-indicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  )
}
