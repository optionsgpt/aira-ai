"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { checkBackendStatus } from "@/lib/api-utils"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ConnectionStatus() {
  const [status, setStatus] = useState<"online" | "offline" | "checking">("checking")
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    setIsChecking(true)
    const isOnline = await checkBackendStatus()
    setStatus(isOnline ? "online" : "offline")
    setIsChecking(false)
  }

  const handleRetry = async () => {
    setIsChecking(true)
    setStatus("checking")

    const isOnline = await checkBackendStatus()
    setStatus(isOnline ? "online" : "offline")

    toast({
      title: isOnline ? "Connection Restored" : "Connection Failed",
      description: isOnline
        ? "Successfully connected to the backend server."
        : "Could not connect to the backend server. Please check if it's running.",
      variant: isOnline ? "default" : "destructive",
    })

    setIsChecking(false)
  }

  return (
    <div className="flex items-center gap-2">
      {status === "online" ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : status === "offline" ? (
        <WifiOff className="h-4 w-4 text-red-500" />
      ) : (
        <RefreshCw className={`h-4 w-4 text-yellow-500 ${isChecking ? "animate-spin" : ""}`} />
      )}

      <span
        className={`text-xs ${
          status === "online" ? "text-green-500" : status === "offline" ? "text-red-500" : "text-yellow-500"
        }`}
      >
        {status === "online" ? "Connected" : status === "offline" ? "Offline" : "Checking..."}
      </span>

      {status === "offline" && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full"
          onClick={handleRetry}
          disabled={isChecking}
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
          <span className="sr-only">Retry connection</span>
        </Button>
      )}
    </div>
  )
}
