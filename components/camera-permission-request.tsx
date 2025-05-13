"use client"

import { useState } from "react"
import { Camera, X } from "lucide-react"
import { motion } from "framer-motion"

interface CameraPermissionRequestProps {
  onPermissionGranted: () => void
  onCancel: () => void
}

export default function CameraPermissionRequest({ onPermissionGranted, onCancel }: CameraPermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPermission = async () => {
    setIsRequesting(true)
    setError(null)

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach((track) => track.stop())

      // Notify parent that permission was granted
      onPermissionGranted()
    } catch (err) {
      console.error("Error requesting camera permission:", err)
      setIsRequesting(false)

      // Set appropriate error message
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera access was denied. Please allow camera access to use this feature.")
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No camera was found on your device.")
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Your camera is in use by another application.")
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError("An unknown error occurred while accessing the camera.")
      }
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 text-center relative">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="w-20 h-20 bg-tnua-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="h-10 w-10 text-tnua-green" />
        </div>

        <h2 className="text-2xl font-bold mb-3">Camera Access Required</h2>

        <p className="text-gray-300 mb-6">
          TNUA needs access to your camera to track your movements and provide real-time feedback on your workout.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">{error}</div>
        )}

        <button
          onClick={requestPermission}
          disabled={isRequesting}
          className="bg-tnua-green text-black font-bold py-3 px-6 rounded-full w-full disabled:opacity-70 mb-3"
        >
          {isRequesting ? "Requesting Access..." : "Allow Camera Access"}
        </button>

        <button
          onClick={onCancel}
          className="bg-transparent border border-gray-600 text-white py-3 px-6 rounded-full w-full hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>

        <p className="mt-4 text-sm text-gray-400">
          Your privacy is important to us. Camera data is processed on-device and never stored or sent to our servers.
        </p>
      </div>
    </motion.div>
  )
}
