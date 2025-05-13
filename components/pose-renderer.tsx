"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import type { PoseData } from "@/services/pose-detection-service"

interface PoseRendererProps {
  poses: PoseData[]
  videoRef: React.RefObject<HTMLVideoElement>
  color?: string
  lineWidth?: number
  pointRadius?: number
  hidden?: boolean
}

const connections = [
  ["nose", "left_eye"],
  ["left_eye", "left_ear"],
  ["nose", "right_eye"],
  ["right_eye", "right_ear"],
  ["nose", "left_shoulder"],
  ["nose", "right_shoulder"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
]

export default function PoseRenderer({
  poses,
  videoRef,
  color = "#00E0FF",
  lineWidth = 4,
  pointRadius = 6,
  hidden = false,
}: PoseRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Draw the poses on the canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || hidden) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Match canvas size to video container
    const updateCanvasSize = () => {
      if (!canvasRef.current || !videoRef.current) return

      const videoContainer = videoRef.current.parentElement
      if (!videoContainer) return

      const { clientWidth, clientHeight } = videoContainer
      canvasRef.current.width = clientWidth
      canvasRef.current.height = clientHeight
    }

    // Initialize canvas size
    updateCanvasSize()

    // Add resize listener
    window.addEventListener("resize", updateCanvasSize)

    // Animation function
    const renderFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set up drawing styles
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = lineWidth
      ctx.shadowColor = color
      ctx.shadowBlur = 10

      // Draw each pose
      poses.forEach((pose) => {
        // Create a map of keypoint name to position for easy access
        const keypointMap = new Map()
        pose.keypoints.forEach((keypoint) => {
          keypointMap.set(keypoint.name, {
            x: keypoint.x * canvas.width,
            y: keypoint.y * canvas.height,
            score: keypoint.score,
          })
        })

        // Draw connections
        connections.forEach(([start, end]) => {
          const startPoint = keypointMap.get(start)
          const endPoint = keypointMap.get(end)

          if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
            ctx.beginPath()
            ctx.moveTo(startPoint.x, startPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)
            ctx.stroke()
          }
        })

        // Draw keypoints
        pose.keypoints.forEach((keypoint) => {
          if (keypoint.score > 0.3) {
            ctx.beginPath()
            ctx.arc(keypoint.x * canvas.width, keypoint.y * canvas.height, pointRadius, 0, 2 * Math.PI)
            ctx.fill()
          }
        })
      })

      // Reset shadow for performance
      ctx.shadowBlur = 0

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(renderFrame)
    }

    // Start animation loop
    renderFrame()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [poses, videoRef, color, lineWidth, pointRadius, hidden])

  return <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full" style={{ opacity: hidden ? 0 : 1 }} />
}
