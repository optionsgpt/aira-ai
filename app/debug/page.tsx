"use client"

import { useState, useEffect } from "react"

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...")
  const [apiStatus, setApiStatus] = useState<string>("Checking...")
  const [ollamaStatus, setOllamaStatus] = useState<string>("Checking...")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    // Check internal API
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        setApiStatus("Working")
        addLog("Internal API test successful")
      })
      .catch((err) => {
        setApiStatus("Error")
        addLog(`Internal API error: ${err.message}`)
      })

    // Check backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"
    fetch(`${backendUrl}/health`)
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus("Connected")
        addLog("Backend connection successful")
      })
      .catch((err) => {
        setBackendStatus("Disconnected")
        addLog(`Backend connection error: ${err.message}`)
      })

    // Check Ollama
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setOllamaStatus(data.online ? "Online" : "Offline")
        addLog(`Ollama status: ${data.online ? "Online" : "Offline"}`)
      })
      .catch((err) => {
        setOllamaStatus("Error")
        addLog(`Ollama status check error: ${err.message}`)
      })
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Internal API</h2>
          <div className={`text-${apiStatus === "Working" ? "green" : "red"}-500 font-bold`}>{apiStatus}</div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Backend Server</h2>
          <div className={`text-${backendStatus === "Connected" ? "green" : "red"}-500 font-bold`}>{backendStatus}</div>
          <div className="text-sm mt-2">URL: {process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"}</div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Ollama Status</h2>
          <div className={`text-${ollamaStatus === "Online" ? "green" : "red"}-500 font-bold`}>{ollamaStatus}</div>
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
