import type { FC } from "react"

interface TnuaLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const TnuaLogo: FC<TnuaLogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeClasses[size]}`}>
          <path
            d="M20 0H100C111.046 0 120 8.95431 120 20C120 31.0457 111.046 40 100 40H20C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0Z"
            fill="url(#paint0_linear_logo)"
          />
          <path d="M35.5 12H29.5V28H35.5V12Z" fill="white" />
          <path d="M52.5 12H46.5V28H52.5V12Z" fill="white" />
          <path d="M40.5 12H29.5V18H40.5V12Z" fill="white" />
          <path d="M40.5 22H29.5V28H40.5V22Z" fill="white" />
          <path d="M63.5 12H57.5V28H63.5V12Z" fill="white" />
          <path d="M80.5 12H74.5V28H80.5V12Z" fill="white" />
          <path d="M74.5 12H63.5V18H74.5V12Z" fill="white" />
          <path d="M91.5 12H85.5V28H91.5V12Z" fill="white" />
          <path d="M91.5 12H80.5V18H91.5V12Z" fill="white" />
          <defs>
            <linearGradient id="paint0_linear_logo" x1="0" y1="20" x2="120" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E0FF" />
              <stop offset="0.5" stopColor="#9747FF" />
              <stop offset="1" stopColor="#FF47B5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default TnuaLogo
