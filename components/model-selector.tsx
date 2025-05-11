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
import { Check, ChevronDown, Cpu, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface Model {
  name: string
  size: string
  quantization: string
  modified_at: string
}

export default function ModelSelector() {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("llama3")
  const [loading, setLoading] = useState(false)
  const [isMockMode, setIsMockMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/models")
      if (!response.ok) {
        throw new Error("Failed to fetch models")
      }
      const data = await response.json()

      setModels(data.models || [])
      setIsMockMode(data.mode === "mock")

      // Set the current model if available
      if (data.currentModel) {
        setSelectedModel(data.currentModel)
      }

      // Show toast if in mock mode
      if (data.mode === "mock" && data.error) {
        toast({
          title: "Using mock models",
          description: "Could not connect to Ollama. Using simulated models instead.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      setIsMockMode(true)
      // Use default mock models if fetch fails completely
      setModels([
        { name: "llama3", size: "8B", quantization: "Q4_0", modified_at: new Date().toISOString() },
        { name: "mistral", size: "7B", quantization: "Q4_0", modified_at: new Date().toISOString() },
      ])

      toast({
        title: "Error",
        description: "Failed to fetch available models. Using simulated models instead.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectModel = async (modelName: string) => {
    try {
      if (isMockMode) {
        // In mock mode, just update the UI without making API call
        setSelectedModel(modelName)
        toast({
          title: "Model Selected (Simulation)",
          description: `Now using ${modelName} in simulation mode`,
        })
        return
      }

      const response = await fetch("/api/models/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: modelName }),
      })

      if (!response.ok) {
        throw new Error("Failed to select model")
      }

      setSelectedModel(modelName)
      toast({
        title: "Model Selected",
        description: `Now using ${modelName}`,
      })
    } catch (error) {
      console.error("Error selecting model:", error)
      toast({
        title: "Error",
        description: "Failed to select model",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 futuristic-button">
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">
            {loading ? "Loading..." : selectedModel}
            {isMockMode && <span className="ml-1">(Sim)</span>}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Select Model</span>
          {isMockMode && (
            <Badge variant="outline" className="text-xs flex items-center gap-1 ml-2">
              <AlertTriangle className="h-3 w-3" /> Simulation
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.length > 0 ? (
          models.map((model) => (
            <DropdownMenuItem
              key={model.name}
              onClick={() => selectModel(model.name)}
              className="flex items-center justify-between"
            >
              <span>{model.name}</span>
              {selectedModel === model.name && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No models available</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={fetchModels}>Refresh Models</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
