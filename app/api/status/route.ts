import { NextResponse } from "next/server"

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    // Check if backend is running
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${BACKEND_API_URL}/health`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        // If backend is up, check Ollama status
        try {
          const ollamaResponse = await fetch(`${BACKEND_API_URL}/api/ollama/models`, {
            signal: AbortSignal.timeout(3000), // 3 second timeout for Ollama check
          })

          return NextResponse.json({
            online: ollamaResponse.ok,
            backendStatus: "online",
            ollamaStatus: ollamaResponse.ok ? "online" : "offline",
            timestamp: new Date().toISOString(),
            details: ollamaResponse.ok ? await ollamaResponse.json() : { error: "Ollama not responding" },
          })
        } catch (ollamaError) {
          return NextResponse.json({
            online: false,
            backendStatus: "online",
            ollamaStatus: "offline",
            error: ollamaError instanceof Error ? ollamaError.message : "Ollama connection failed",
            timestamp: new Date().toISOString(),
          })
        }
      } else {
        return NextResponse.json({
          online: false,
          backendStatus: "error",
          error: `Backend error: ${response.status}`,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.log("Fetch error details:", fetchError instanceof Error ? fetchError.message : "Unknown fetch error")

      return NextResponse.json({
        online: false,
        backendStatus: "offline",
        error: fetchError instanceof Error ? fetchError.message : "Connection failed",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error checking status:", error)
    return NextResponse.json({
      online: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}
