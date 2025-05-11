"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function AiLogo() {
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

    // Neural network nodes
    const nodes = [
      { x: 30, y: 15, radius: 3 },
      { x: 20, y: 25, radius: 3 },
      { x: 40, y: 25, radius: 3 },
      { x: 15, y: 35, radius: 3 },
      { x: 30, y: 35, radius: 3 },
      { x: 45, y: 35, radius: 3 },
      { x: 30, y: 45, radius: 3 },
    ]

    // Connections between nodes
    const connections = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ]

    // Pulse animation
    let pulsePhase = 0

    // Data flow animation
    const dataFlows = connections.map((conn) => ({
      from: conn.from,
      to: conn.to,
      progress: Math.random(), // Start at random positions
      speed: 0.005 + Math.random() * 0.01,
      active: Math.random() > 0.5,
      size: 1.5 + Math.random(),
    }))

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      connections.forEach((conn) => {
        const fromNode = nodes[conn.from]
        const toNode = nodes[conn.to]

        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(toNode.x, toNode.y)
        ctx.strokeStyle = isDark ? "rgba(180, 120, 255, 0.3)" : "rgba(124, 58, 237, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Update pulse
      pulsePhase += 0.03
      const pulseSize = Math.sin(pulsePhase) * 0.5 + 1.5

      // Draw nodes with pulse
      nodes.forEach((node, i) => {
        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4)

        gradient.addColorStop(0, isDark ? "rgba(180, 120, 255, 0.8)" : "rgba(124, 58, 237, 0.8)")
        gradient.addColorStop(1, "rgba(124, 58, 237, 0)")

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 3 * pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "#b388ff" : "#7c3aed"
        ctx.fill()
      })

      // Update and draw data flows
      dataFlows.forEach((flow) => {
        if (flow.active) {
          const fromNode = nodes[flow.from]
          const toNode = nodes[flow.to]

          // Calculate position along the connection
          const x = fromNode.x + (toNode.x - fromNode.x) * flow.progress
          const y = fromNode.y + (toNode.y - fromNode.y) * flow.progress

          // Draw data packet
          ctx.beginPath()
          ctx.arc(x, y, flow.size, 0, Math.PI * 2)
          ctx.fillStyle = isDark ? "#ffffff" : "#7c3aed"
          ctx.fill()

          // Update progress
          flow.progress += flow.speed

          // Reset when reaching the end
          if (flow.progress > 1) {
            flow.progress = 0
            flow.active = Math.random() > 0.3 // 70% chance to remain active
            flow.speed = 0.005 + Math.random() * 0.01 // Randomize speed
          }
        } else if (Math.random() > 0.99) {
          // Small chance to activate inactive flows
          flow.active = true
          flow.progress = 0
        }
      })

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
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 opacity-90" />

      {/* Animated neural network */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-violet-500/30 animate-pulse" />

      {/* Animated border */}
      <div className="absolute inset-0 border border-white/20 rounded-xl" />
    </motion.div>
  )
}
