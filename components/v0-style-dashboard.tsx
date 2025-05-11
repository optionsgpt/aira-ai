"use client"

import { ProjectProvider } from "@/context/project-context"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import CursorTrail from "@/components/cursor-trail"
import V0StyleInterface from "@/components/v0-style-interface"

export default function V0StyleDashboard() {
  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background">
        <AnimatedBackground />
        <Header />
        <CursorTrail />

        <div className="flex-1 overflow-hidden">
          <V0StyleInterface />
        </div>
      </div>
    </ProjectProvider>
  )
}
