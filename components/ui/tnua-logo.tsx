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
      <div className={`font-bold ${sizeClasses[size]}`}>
        <span className="text-white">T</span>
        <span className="text-tnua-green">NUA</span>
      </div>
    </div>
  )
}

export default TnuaLogo
