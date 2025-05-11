"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ProjectFile {
  path: string
  content: string
  type?: string
}

interface ProjectContextType {
  projectFiles: ProjectFile[]
  setProjectFiles: (files: ProjectFile[]) => void
  addProjectFile: (file: ProjectFile) => void
  removeProjectFile: (path: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])

  const addProjectFile = (file: ProjectFile) => {
    setProjectFiles((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.some((f) => f.path === file.path)
      if (exists) {
        return prev.map((f) => (f.path === file.path ? file : f))
      } else {
        return [...prev, file]
      }
    })
  }

  const removeProjectFile = (path: string) => {
    setProjectFiles((prev) => prev.filter((f) => f.path !== path))
  }

  return (
    <ProjectContext.Provider value={{ projectFiles, setProjectFiles, addProjectFile, removeProjectFile }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
