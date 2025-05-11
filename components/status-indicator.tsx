"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { XCircle, CheckCircle, Loader, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function StatusIndicator() {
  const [status, setStatus] = useState<"online" | "offline" | "checking" | "error">("checking")
  const [statusDetails, setStatusDetails] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setStatus("checking")
        const response = await fetch("/api/status")
        const data = await response.json()

        if (data.online) {
          setStatus("online")
          setStatusDetails("Connected to Ollama")
        } else {
          setStatus("offline")
          setStatusDetails(data.error || "Ollama is not responding")

          // Only show toast on first load or when status changes from online to offline
          if (status === "checking" || status === "online") {
            toast({
              title: "Ollama Connection Issue",
              description: `Unable to connect to Ollama: ${data.error || "Service unavailable"}. Make sure Ollama is running on your machine.`,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        setStatus("error")
        setStatusDetails("Connection error")
        console.error("Status check error:", error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [status, toast])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {status === "online" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === "offline" && <XCircle className="h-4 w-4 text-red-500" />}
            {status === "checking" && <Loader className="h-4 w-4 text-yellow-500 animate-spin" />}
            {status === "error" && <AlertCircle className="h-4 w-4 text-orange-500" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold">Ollama Status</div>
            <div className="text-xs mt-1">{statusDetails}</div>
            {status === "offline" && (
              <div className="text-xs mt-1 text-red-400">Make sure Ollama is running on your machine</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
