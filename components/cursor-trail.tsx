"use client"

import { useEffect, useState } from "react"

export default function CursorTrail() {
  const [trail, setTrail] = useState<{ x: number; y: number; opacity: number; size: number }[]>([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return

      setTrail((prevTrail) => {
        const newTrail = [
          ...prevTrail,
          {
            x: e.clientX,
            y: e.clientY,
            opacity: 1,
            size: Math.random() * 5 + 5, // Random size between 5-10px
          },
        ]

        // Keep only the last 15 positions
        if (newTrail.length > 15) {
          return newTrail.slice(newTrail.length - 15)
        }

        return newTrail
      })
    }

    const fadeTrail = () => {
      setTrail((prevTrail) =>
        prevTrail
          .map((point) => ({
            ...point,
            opacity: point.opacity - 0.05,
            size: point.size * 0.95, // Gradually reduce size
          }))
          .filter((point) => point.opacity > 0),
      )
    }

    const trailInterval = setInterval(fadeTrail, 30)
    window.addEventListener("mousemove", handleMouseMove)

    // Disable trail after 30 seconds to avoid performance issues
    const disableTimeout = setTimeout(() => {
      setIsActive(false)
      setTrail([])
    }, 30000)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(trailInterval)
      clearTimeout(disableTimeout)
    }
  }, [isActive])

  if (!isActive || trail.length === 0) return null

  return (
    <>
      {trail.map((point, index) => (
        <div
          key={index}
          className="cursor-trail"
          style={{
            left: point.x,
            top: point.y,
            opacity: point.opacity,
            width: `${point.size}px`,
            height: `${point.size}px`,
            background: `hsla(var(--primary), ${point.opacity})`,
            boxShadow: `0 0 ${point.size * 2}px hsla(var(--primary), ${point.opacity * 0.5})`,
          }}
        />
      ))}
    </>
  )
}
