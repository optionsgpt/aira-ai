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
        const ollamaResponse = await fetch(`${BACKEND_API_URL}/api/ollama/models`)
        return NextResponse.json({
          online: ollamaResponse.ok,
          backendStatus: "online",
          ollamaStatus: ollamaResponse.ok ? "online" : "offline",
        })
      } else {
        return NextResponse.json({
          online: false,
          backendStatus: "error",
          error: `Backend error: ${response.status}`,
        })
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.log("Fetch error details:", fetchError instanceof Error ? fetchError.message : "Unknown fetch error")

      return NextResponse.json({
        online: false,
        backendStatus: "offline",
        error: fetchError instanceof Error ? fetchError.message : "Connection failed",
      })
    }
  } catch (error) {
    console.error("Error checking status:", error)
    return NextResponse.json({
      online: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
