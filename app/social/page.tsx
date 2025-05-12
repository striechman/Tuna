"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, User, ChevronLeft } from "lucide-react"
import TnuaLogo from "@/components/ui/tnua-logo"
import NavBar from "@/components/nav-bar"
import { useRouter } from "next/navigation"

export default function SocialPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-tnua-dark text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center">
        <button onClick={() => router.push("/")} className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <TnuaLogo size="md" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Social Feed</h1>

        <div className="space-y-6">
          <SocialPost
            username="sarah_fitness"
            time="2 hours ago"
            content="Just completed a 30-minute HIIT workout with TNUA! The form correction was super helpful."
            likes={24}
            comments={5}
          />

          <SocialPost
            username="fitness_mike"
            time="Yesterday"
            content="TNUA helped me perfect my squat form. Check out my progress!"
            likes={42}
            comments={8}
          />

          <SocialPost
            username="training_with_alex"
            time="2 days ago"
            content="The emergency detection feature on TNUA is a game-changer for home workouts. Safety first!"
            likes={56}
            comments={12}
          />
        </div>
      </main>

      {/* Bottom navigation */}
      <NavBar />
    </div>
  )
}

function SocialPost({
  username,
  time,
  content,
  likes,
  comments,
}: {
  username: string
  time: string
  content: string
  likes: number
  comments: number
}) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  return (
    <motion.div
      className="bg-tnua-gray/80 rounded-md p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-tnua-green/20 flex items-center justify-center mr-3">
          <User className="h-5 w-5 text-tnua-green" />
        </div>
        <div>
          <p className="font-medium">{username}</p>
          <p className="text-gray-400 text-xs">{time}</p>
        </div>
      </div>

      <p className="mb-4">{content}</p>

      <div className="flex items-center gap-4">
        <button className={`flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-400"}`} onClick={handleLike}>
          <Heart className="h-5 w-5" />
          <span className="text-sm">{likeCount}</span>
        </button>

        <button className="flex items-center gap-1 text-gray-400">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{comments}</span>
        </button>

        <button className="flex items-center gap-1 text-gray-400 ml-auto">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}
