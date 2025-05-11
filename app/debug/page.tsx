"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodePreview from "@/components/code-preview"

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...")
  const [backendDetails, setBackendDetails] = useState<any>(null)
  const [ollamaStatus, setOllamaStatus] = useState<string>("Checking...")
  const [logs, setLogs] = useState<string[]>([])
  const [testMessage, setTestMessage] = useState<string>("")
  const [activeTab, setActiveTab] = useState("connections")

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

  const testChatMessage = async () => {
    try {
      addLog("Testing chat message...")
      setTestMessage("Sending test message to backend...")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"}/api/ollama/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Hello, this is a test message." }],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`)
      }

      setTestMessage("Message sent successfully! Check the logs for details.")
      addLog("Test message sent successfully to backend.")
    } catch (error) {
      setTestMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      addLog(`Test message error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    checkBackend()
    checkOllama()
  }, [])

  const testCode = `// Example code for testing
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Debug</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="interface">Interface Tests</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
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
              <div className="text-sm mt-2">
                URL: {process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"}
              </div>
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

          <div className="border rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold mb-2">Test Chat Message</h2>
            <p className="mb-4">
              Click the button below to send a test message to the backend and check if it responds correctly.
            </p>
            <Button onClick={testChatMessage}>Send Test Message</Button>
            {testMessage && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p>{testMessage}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="interface">
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Code Preview Test</h2>
              <CodePreview code={testCode} language="javascript" />
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Interface Components</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Chat Interface</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Test the chat interface at the main page or at{" "}
                    <a href="/test-v0" className="text-primary underline">
                      /test-v0
                    </a>
                  </p>
                  <Button asChild>
                    <a href="/test-v0">Open Test Page</a>
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Tab Navigation</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The main interface should have tabs for Chat, Code, and Preview sections.
                  </p>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-primary text-white rounded-md">Chat</div>
                    <div className="px-3 py-1 bg-muted rounded-md">Code</div>
                    <div className="px-3 py-1 bg-muted rounded-md">Preview</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
