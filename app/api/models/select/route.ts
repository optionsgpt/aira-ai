import { type NextRequest, NextResponse } from "next/server"

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_API_URL}/api/ollama/models/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Failed to select model: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error selecting model:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to select model" },
      { status: 500 },
    )
  }
}
