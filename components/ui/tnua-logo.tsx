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
          <rect width="120" height="40" rx="8" fill="#0A0A0A" />
          <path d="M35.5 12H29.5V28H35.5V12Z" fill="#CCFF00" />
          <path d="M52.5 12H46.5V28H52.5V12Z" fill="#CCFF00" />
          <path d="M40.5 12H29.5V18H40.5V12Z" fill="#CCFF00" />
          <path d="M40.5 22H29.5V28H40.5V22Z" fill="#CCFF00" />
          <path d="M63.5 12H57.5V28H63.5V12Z" fill="#CCFF00" />
          <path d="M80.5 12H74.5V28H80.5V12Z" fill="#CCFF00" />
          <path d="M74.5 12H63.5V18H74.5V12Z" fill="#CCFF00" />
          <path d="M91.5 12H85.5V28H91.5V12Z" fill="#CCFF00" />
          <path d="M91.5 12H80.5V18H91.5V12Z" fill="#CCFF00" />
        </svg>
      </div>
    </div>
  )
}

export default TnuaLogo
