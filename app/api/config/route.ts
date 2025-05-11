import { type NextRequest, NextResponse } from "next/server"

// Backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_API_URL}/api/config`)

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching config:", error)

    // Return default config in case of error
    return NextResponse.json({
      ollama: {
        apiHost: "http://localhost:11434",
        defaultModel: "llama3",
      },
      allhands: {
        apiUrl: "https://api.allhands.ai",
      },
      preferredBackend: "ollama",
      features: {
        fileAttachments: true,
        codeExecution: true,
        projectExplorer: true,
      },
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json()

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_API_URL}/api/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating config:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update configuration" },
      { status: 500 },
    )
  }
}
