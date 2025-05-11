"use client"

import { ProjectProvider } from "@/context/project-context"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import CursorTrail from "@/components/cursor-trail"
import V0StyleInterface from "@/components/v0-style-interface"
import { Suspense } from "react"

export default function V0StyleDashboard() {
  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background">
        <AnimatedBackground />
        <Header />
        <CursorTrail />

        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<div className="p-8 text-center">Loading interface...</div>}>
            <V0StyleInterface />
          </Suspense>
        </div>
      </div>
    </ProjectProvider>
  )
}
