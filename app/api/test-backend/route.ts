import { NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"
    const response = await fetch(`${backendUrl}/health`)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Backend connection successful",
      backendResponse: data,
      backendUrl,
    })
  } catch (error) {
    console.error("Backend connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001",
      },
      { status: 500 },
    )
  }
}
