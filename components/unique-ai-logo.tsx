"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function UniqueAiLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 60
    canvas.height = 60

    // Animation variables
    let time = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create hexagon points
    const createHexagon = (centerX: number, centerY: number, radius: number, rotation = 0) => {
      const points = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + rotation
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push({ x, y })
      }
      return points
    }

    // Create triangular points for the "iris"
    const createTriangularIris = (centerX: number, centerY: number, radius: number, rotation = 0) => {
      const points = []
      for (let i = 0; i < 3; i++) {
        const angle = ((Math.PI * 2) / 3) * i + rotation
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push({ x, y })
      }
      return points
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.01

      // Draw outer hexagon (rotating slowly)
      const outerRotation = time * 0.2
      const outerHexagon = createHexagon(centerX, centerY, 25, outerRotation)

      // Draw middle hexagon (counter-rotating)
      const middleRotation = -time * 0.3
      const middleHexagon = createHexagon(centerX, centerY, 18, middleRotation)

      // Draw inner triangular "iris" (rotating faster)
      const innerRotation = time * 0.5
      const innerIris = createTriangularIris(centerX, centerY, 10, innerRotation)

      // Draw outer hexagon
      ctx.beginPath()
      ctx.moveTo(outerHexagon[0].x, outerHexagon[0].y)
      for (let i = 1; i < outerHexagon.length; i++) {
        ctx.lineTo(outerHexagon[i].x, outerHexagon[i].y)
      }
      ctx.closePath()
      ctx.strokeStyle = isDark ? "rgba(180, 120, 255, 0.6)" : "rgba(124, 58, 237, 0.6)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw middle hexagon
      ctx.beginPath()
      ctx.moveTo(middleHexagon[0].x, middleHexagon[0].y)
      for (let i = 1; i < middleHexagon.length; i++) {
        ctx.lineTo(middleHexagon[i].x, middleHexagon[i].y)
      }
      ctx.closePath()
      ctx.strokeStyle = isDark ? "rgba(200, 140, 255, 0.8)" : "rgba(144, 78, 257, 0.8)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Draw inner triangular "iris"
      ctx.beginPath()
      ctx.moveTo(innerIris[0].x, innerIris[0].y)
      for (let i = 1; i < innerIris.length; i++) {
        ctx.lineTo(innerIris[i].x, innerIris[i].y)
      }
      ctx.closePath()
      const irisGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10)
      irisGradient.addColorStop(0, isDark ? "rgba(220, 160, 255, 1)" : "rgba(164, 98, 255, 1)")
      irisGradient.addColorStop(1, isDark ? "rgba(180, 120, 255, 0.8)" : "rgba(124, 58, 237, 0.8)")
      ctx.fillStyle = irisGradient
      ctx.fill()

      // Draw pulsing center circle
      const pulseSize = 3 + Math.sin(time * 2) * 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2)
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.9)"
      ctx.fill()

      // Draw energy lines
      const numLines = 12
      const maxLength = 30
      for (let i = 0; i < numLines; i++) {
        const angle = (Math.PI * 2 * i) / numLines + time * 0.5
        const length = (Math.sin(time * 3 + i) * 0.5 + 0.5) * maxLength
        const startX = centerX + Math.cos(angle) * 10
        const startY = centerY + Math.sin(angle) * 10
        const endX = centerX + Math.cos(angle) * (10 + length)
        const endY = centerY + Math.sin(angle) * (10 + length)

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = isDark
          ? `rgba(180, 120, 255, ${0.2 + Math.sin(time * 3 + i) * 0.1})`
          : `rgba(124, 58, 237, ${0.2 + Math.sin(time * 3 + i) * 0.1})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Draw small orbiting particles
      const numParticles = 5
      for (let i = 0; i < numParticles; i++) {
        const orbitRadius = 15 + i * 2
        const speed = 0.5 - i * 0.05
        const particleAngle = time * speed + (Math.PI * 2 * i) / numParticles
        const particleX = centerX + Math.cos(particleAngle) * orbitRadius
        const particleY = centerY + Math.sin(particleAngle) * orbitRadius
        const particleSize = 1 + Math.sin(time * 2 + i) * 0.5

        ctx.beginPath()
        ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "rgba(220, 160, 255, 0.9)" : "rgba(164, 98, 255, 0.9)"
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()
  }, [theme])

  return (
    <motion.div
      className="relative size-14 rounded-xl overflow-hidden shadow-glow"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 opacity-90" />

      {/* Animated geometric AI representation */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-fuchsia-500/30" />

      {/* Animated border */}
      <div className="absolute inset-0 border border-white/20 rounded-xl" />
    </motion.div>
  )
}
