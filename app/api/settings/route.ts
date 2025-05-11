import { type NextRequest, NextResponse } from "next/server"

// In a production app, you would store these in a database
// For this demo, we'll use environment variables
export async function GET() {
  try {
    return NextResponse.json({
      ollamaHost: process.env.OLLAMA_API_HOST || "http://localhost:11434",
      defaultModel: process.env.OLLAMA_MODEL || "llama3",
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ollamaHost, defaultModel } = await req.json()

    // In a production app, you would update a database
    // For this demo, we'll update environment variables
    if (ollamaHost) {
      process.env.OLLAMA_API_HOST = ollamaHost
    }

    if (defaultModel) {
      process.env.OLLAMA_MODEL = defaultModel
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 },
    )
  }
}
