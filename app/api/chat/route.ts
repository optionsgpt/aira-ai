import { type NextRequest, NextResponse } from "next/server"

// Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()

    // Set up timeout for the request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Forward the request to the backend
      const response = await fetch(`${BACKEND_API_URL}/api/ollama/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Return the streaming response
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      // Handle specific fetch errors
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          return NextResponse.json(
            { error: "Request timed out. The backend server took too long to respond." },
            { status: 504 },
          )
        }

        // Check if it's a network error (ECONNREFUSED, etc.)
        if (
          fetchError.message.includes("ECONNREFUSED") ||
          fetchError.message.includes("Failed to fetch") ||
          fetchError.message.includes("Network error")
        ) {
          return NextResponse.json(
            { error: "Could not connect to the backend server. Please check if it's running." },
            { status: 503 },
          )
        }
      }

      throw fetchError // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process request",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
