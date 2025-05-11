"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useProject } from "@/context/project-context"
import { motion } from "framer-motion"
import UniqueAiLogo from "@/components/unique-ai-logo"
import ModelSelector from "@/components/model-selector"
import StatusIndicator from "@/components/status-indicator"
import SettingsDialog from "@/components/settings-dialog"
import BackendSelector from "@/components/backend-selector"

export default function Header() {
  const [repoUrl, setRepoUrl] = useState("")
  const [isCloning, setIsCloning] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const { setProjectFiles } = useProject()

  const handleCloneRepo = async () => {
    if (!repoUrl) return

    setIsCloning(true)

    try {
      const response = await fetch("/api/github/clone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to clone repository")
      }

      const data = await response.json()
      setProjectFiles(data.files)

      toast({
        title: "Repository cloned successfully",
        description: `Cloned ${repoUrl}`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Failed to clone repository",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/70">
      <div className="container flex h-16 items-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UniqueAiLogo />

          <div className="flex flex-col">
            <motion.span
              className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 font-space-grotesk"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Aira AI
            </motion.span>
            <motion.span
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Advanced Intelligence Assistant
            </motion.span>
          </div>
        </motion.div>

        <div className="ml-auto flex items-center gap-2">
          <StatusIndicator />
          <BackendSelector />
          <ModelSelector />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 futuristic-button">
                <GitHubLogoIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Clone Repository</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] gradient-border glass-effect">
              <DialogHeader>
                <DialogTitle>Clone GitHub Repository</DialogTitle>
                <DialogDescription>Enter the URL of the GitHub repository you want to clone.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="futuristic-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloneRepo} disabled={isCloning} className="futuristic-button">
                  {isCloning ? (
                    <div className="ai-thinking">
                      <div className="ai-thinking-bar"></div>
                      <div className="ai-thinking-bar"></div>
                      <div className="ai-thinking-bar"></div>
                      <div className="ai-thinking-bar"></div>
                      <div className="ai-thinking-bar"></div>
                    </div>
                  ) : (
                    "Clone Repository"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <SettingsDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
