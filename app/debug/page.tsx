"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...")
  const [backendDetails, setBackendDetails] = useState<any>(null)
  const [ollamaStatus, setOllamaStatus] = useState<string>("Checking...")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const checkBackend = async () => {
    try {
      addLog("Testing backend connection...")
      const response = await fetch("/api/test-backend")
      const data = await response.json()

      if (data.success) {
        setBackendStatus("Connected")
        setBackendDetails(data)
        addLog(`Backend connection successful: ${JSON.stringify(data.backendResponse)}`)
      } else {
        setBackendStatus("Error")
        setBackendDetails(data)
        addLog(`Backend connection error: ${data.error}`)
      }
    } catch (error) {
      setBackendStatus("Error")
      addLog(`Backend test error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const checkOllama = async () => {
    try {
      addLog("Testing Ollama connection...")
      const response = await fetch("/api/status")
      const data = await response.json()

      setOllamaStatus(data.online ? "Online" : "Offline")
      addLog(`Ollama status: ${data.online ? "Online" : "Offline"}`)
    } catch (error) {
      setOllamaStatus("Error")
      addLog(`Ollama status check error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    checkBackend()
    checkOllama()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Backend Server</h2>
          <div
            className={`font-bold ${
              backendStatus === "Connected"
                ? "text-green-500"
                : backendStatus === "Checking..."
                  ? "text-yellow-500"
                  : "text-red-500"
            }`}
          >
            {backendStatus}
          </div>
          <div className="text-sm mt-2">URL: {process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"}</div>
          {backendDetails && (
            <div className="mt-2 text-xs">
              <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(backendDetails, null, 2)}
              </pre>
            </div>
          )}
          <Button onClick={checkBackend} className="mt-2" size="sm">
            Recheck Backend
          </Button>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Ollama Status</h2>
          <div
            className={`font-bold ${
              ollamaStatus === "Online"
                ? "text-green-500"
                : ollamaStatus === "Checking..."
                  ? "text-yellow-500"
                  : "text-red-500"
            }`}
          >
            {ollamaStatus}
          </div>
          <Button onClick={checkOllama} className="mt-2" size="sm">
            Recheck Ollama
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">System Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm">
          NEXT_PUBLIC_BACKEND_API_URL: {process.env.NEXT_PUBLIC_BACKEND_API_URL || "Not set"}
        </div>
      </div>
    </div>
  )
}
