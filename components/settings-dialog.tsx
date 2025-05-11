"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsConfig {
  ollama: {
    apiHost: string
    defaultModel: string
  }
  allhands: {
    apiUrl: string
    apiKey: string
  }
  preferredBackend: string
}

export default function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<SettingsConfig>({
    ollama: {
      apiHost: "http://localhost:11434",
      defaultModel: "llama3",
    },
    allhands: {
      apiUrl: "https://api.allhands.ai",
      apiKey: "",
    },
    preferredBackend: "ollama",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/config")
        if (response.ok) {
          const data = await response.json()
          setConfig({
            ollama: {
              apiHost: data.ollama?.apiHost || "http://localhost:11434",
              defaultModel: data.ollama?.defaultModel || "llama3",
            },
            allhands: {
              apiUrl: data.allhands?.apiUrl || "https://api.allhands.ai",
              apiKey: data.allhands?.apiKey || "",
            },
            preferredBackend: data.preferredBackend || "ollama",
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    if (isOpen) {
      fetchSettings()
    }
  }, [isOpen])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="futuristic-button">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] gradient-border glass-effect">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your Aira AI assistant</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ollama">Ollama</TabsTrigger>
            <TabsTrigger value="allhands">AllHands AI</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="preferred-backend">Preferred Backend</Label>
              <select
                id="preferred-backend"
                value={config.preferredBackend}
                onChange={(e) => setConfig({ ...config, preferredBackend: e.target.value })}
                className="futuristic-input w-full p-2 rounded-md border"
              >
                <option value="ollama">Ollama</option>
                <option value="allhands">AllHands AI</option>
              </select>
              <p className="text-xs text-muted-foreground">The AI backend to use for chat responses</p>
            </div>
          </TabsContent>

          <TabsContent value="ollama" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="ollama-host">Ollama API Host</Label>
              <Input
                id="ollama-host"
                value={config.ollama.apiHost}
                onChange={(e) => setConfig({ ...config, ollama: { ...config.ollama, apiHost: e.target.value } })}
                placeholder="http://localhost:11434"
                className="futuristic-input"
              />
              <p className="text-xs text-muted-foreground">The URL where your Ollama instance is running</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ollama-model">Default Model</Label>
              <Input
                id="ollama-model"
                value={config.ollama.defaultModel}
                onChange={(e) => setConfig({ ...config, ollama: { ...config.ollama, defaultModel: e.target.value } })}
                placeholder="llama3"
                className="futuristic-input"
              />
              <p className="text-xs text-muted-foreground">The default Ollama model to use</p>
            </div>
          </TabsContent>

          <TabsContent value="allhands" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="allhands-api-url">AllHands API URL</Label>
              <Input
                id="allhands-api-url"
                value={config.allhands.apiUrl}
                onChange={(e) => setConfig({ ...config, allhands: { ...config.allhands, apiUrl: e.target.value } })}
                placeholder="https://api.allhands.ai"
                className="futuristic-input"
              />
              <p className="text-xs text-muted-foreground">The URL for the AllHands AI API</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allhands-api-key">AllHands API Key</Label>
              <Input
                id="allhands-api-key"
                type="password"
                value={config.allhands.apiKey}
                onChange={(e) => setConfig({ ...config, allhands: { ...config.allhands, apiKey: e.target.value } })}
                placeholder="Enter your AllHands API key"
                className="futuristic-input"
              />
              <p className="text-xs text-muted-foreground">Your API key for accessing AllHands AI</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button onClick={handleSave} disabled={isSaving} className="futuristic-button">
            {isSaving ? (
              <div className="ai-thinking">
                <div className="ai-thinking-bar"></div>
                <div className="ai-thinking-bar"></div>
                <div className="ai-thinking-bar"></div>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
