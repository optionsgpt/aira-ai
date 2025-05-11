"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, ExternalLink } from "lucide-react"

export default function OllamaSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Ollama Not Connected</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Ollama Connection Required</DialogTitle>
          <DialogDescription>
            Aira AI requires a connection to Ollama to function. Follow these steps to set up Ollama on your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Install Ollama</h3>
            <p className="text-sm text-muted-foreground">Download and install Ollama from the official website.</p>
            <div className="bg-muted p-3 rounded-md text-sm">
              <a
                href="https://ollama.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-1 hover:underline"
              >
                Download Ollama <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2. Start Ollama</h3>
            <p className="text-sm text-muted-foreground">
              Open a terminal or command prompt and run the following command:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">ollama serve</div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">3. Pull a Model</h3>
            <p className="text-sm text-muted-foreground">In a new terminal window, pull a model like Llama 3:</p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">ollama pull llama3</div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">4. Refresh Aira AI</h3>
            <p className="text-sm text-muted-foreground">
              Once Ollama is running with at least one model, refresh this page to connect.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
