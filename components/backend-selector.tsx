"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Server } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function BackendSelector() {
  const [selectedBackend, setSelectedBackend] = useState<string>("ollama")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/config")
      if (!response.ok) {
        throw new Error("Failed to fetch configuration")
      }
      const data = await response.json()

      if (data.preferredBackend) {
        setSelectedBackend(data.preferredBackend)
      }
    } catch (error) {
      console.error("Error fetching configuration:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectBackend = async (backend: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferredBackend: backend }),
      })

      if (!response.ok) {
        throw new Error("Failed to update configuration")
      }

      setSelectedBackend(backend)
      toast({
        title: "Backend Updated",
        description: `Now using ${backend === "ollama" ? "Ollama" : "AllHands AI"} as the backend`,
      })
    } catch (error) {
      console.error("Error updating backend:", error)
      toast({
        title: "Error",
        description: "Failed to update backend",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 futuristic-button">
          <Server className="h-4 w-4" />
          <span className="hidden sm:inline">
            {loading ? "Loading..." : selectedBackend === "ollama" ? "Ollama" : "AllHands AI"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select Backend</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => selectBackend("ollama")} className="flex items-center justify-between">
          <span>Ollama</span>
          {selectedBackend === "ollama" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectBackend("allhands")} className="flex items-center justify-between">
          <span>AllHands AI</span>
          {selectedBackend === "allhands" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
