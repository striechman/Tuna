import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TNUA Fitness App",
  description: "AI-powered fitness app for teens",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Load TensorFlow.js from CDN to ensure it's available */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js"
          strategy="afterInteractive"
          id="tensorflow-script"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.0/dist/pose-detection.min.js"
          strategy="afterInteractive"
          id="pose-detection-script"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
