import { NextResponse } from "next/server"

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_API_URL}/api/ollama/models`)

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching models:", error)

    // Return mock data in case of error
    return NextResponse.json({
      models: [
        { name: "llama3", size: "8B", quantization: "Q4_0", modified_at: new Date().toISOString() },
        { name: "mistral", size: "7B", quantization: "Q4_0", modified_at: new Date().toISOString() },
      ],
      currentModel: "llama3",
      mode: "mock",
      error: error instanceof Error ? error.message : "Failed to fetch models",
    })
  }
}
