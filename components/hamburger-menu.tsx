"use client"

import { useState, useEffect } from "react"
import { Menu, X, Home, Activity, BarChart2, User, Settings, Users, LogOut, Info, Bell, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import TnuaLogo from "@/components/ui/tnua-logo"

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest(".menu-container") && !target.closest(".menu-button")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  const menuItems = [
    { icon: <Home className="h-5 w-5 ml-3" />, label: "דף הבית", path: "/" },
    { icon: <Activity className="h-5 w-5 ml-3" />, label: "אימון", path: "/workout" },
    { icon: <BarChart2 className="h-5 w-5 ml-3" />, label: "סטטיסטיקות", path: "/progress" },
    { icon: <Users className="h-5 w-5 ml-3" />, label: "סושיאל", path: "/social" },
    { icon: <User className="h-5 w-5 ml-3" />, label: "פרופיל", path: "/profile" },
    { icon: <Bell className="h-5 w-5 ml-3" />, label: "התראות", path: "/notifications" },
    { icon: <Heart className="h-5 w-5 ml-3" />, label: "אנשי קשר לחירום", path: "/emergency-contacts" },
    { icon: <Info className="h-5 w-5 ml-3" />, label: "אודות", path: "/about" },
    { icon: <Settings className="h-5 w-5 ml-3" />, label: "הגדרות", path: "/settings" },
  ]

  return (
    <>
      {/* Hamburger button */}
      <button
        className="menu-button fixed top-6 right-6 z-50 bg-tnua-gray/80 backdrop-blur-sm p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="תפריט"
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </button>

      {/* Menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="menu-container fixed top-0 right-0 h-full w-3/4 max-w-xs bg-tnua-dark z-40 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex flex-col h-full p-6" dir="rtl">
              {/* Logo */}
              <div className="py-6 border-b border-tnua-gray/30 mb-6">
                <TnuaLogo size="md" />
              </div>

              {/* Menu items */}
              <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <button
                        className="flex items-center w-full py-3 px-4 rounded-md text-white hover:bg-tnua-gray/30 transition-colors"
                        onClick={() => handleNavigation(item.path)}
                      >
                        {item.icon}
                        <span className="text-lg">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Logout button */}
              <button className="flex items-center py-3 px-4 rounded-md text-red-400 hover:bg-red-500/10 transition-colors mt-auto">
                <LogOut className="h-5 w-5 ml-3" />
                <span className="text-lg">התנתק</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
