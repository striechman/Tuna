"use client"

import type React from "react"

import { Home, Activity, BarChart2, User } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function NavBar() {
  return (
    <motion.div
      className="bg-tnua-dark/95 backdrop-blur-md border-t border-tnua-gray py-2 px-4 flex justify-around items-center z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir="rtl"
    >
      <NavButton icon={<Home className="h-6 w-6" />} label="בית" href="/" />
      <NavButton icon={<Activity className="h-6 w-6" />} label="אימון" href="/workout" active />
      <NavButton icon={<BarChart2 className="h-6 w-6" />} label="סטטיסטיקות" href="/progress" />
      <NavButton icon={<User className="h-6 w-6" />} label="פרופיל" href="/profile" />
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
        active ? "text-tnua-green" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
      {active && (
        <motion.div
          className="absolute -bottom-2 h-1 w-8 bg-tnua-green rounded-t-md"
          layoutId="nav-indicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  )
}
