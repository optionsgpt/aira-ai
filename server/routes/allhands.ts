import express, { type Request, type Response, type NextFunction } from "express"
import fetch from "node-fetch"

const router = express.Router()

// AllHands AI configuration
const ALLHANDS_API_KEY = process.env.ALLHANDS_API_KEY
const ALLHANDS_API_URL = process.env.ALLHANDS_API_URL || "https://api.allhands.ai"

// Middleware to check if AllHands API key is configured
const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (!ALLHANDS_API_KEY) {
    return res.status(500).json({ error: "AllHands API key is not configured" })
  }
  next()
}

// Get AllHands AI status
router.get("/status", checkApiKey, async (req, res) => {
  try {
    const response = await fetch(`${ALLHANDS_API_URL}/status`, {
      headers: {
        Authorization: `Bearer ${ALLHANDS_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`AllHands API error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error("Error checking AllHands status:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to check AllHands status",
    })
  }
})

// Process a query with AllHands AI
router.post("/query", checkApiKey, async (req, res) => {
  try {
    const { query, context, options = {} } = req.body

    if (!query) {
      return res.status(400).json({ error: "Query is required" })
    }

    // Set up headers for streaming if requested
    if (options.stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache, no-transform")
      res.setHeader("Connection", "keep-alive")
    }

    // Call AllHands API
    const allhandsResponse = await fetch(`${ALLHANDS_API_URL}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ALLHANDS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        context,
        stream: options.stream || false,
        model: options.model || "default",
        parameters: options.parameters || {},
      }),
    })

    if (!allhandsResponse.ok) {
      throw new Error(`AllHands API error: ${allhandsResponse.status}`)
    }

    // Handle streaming response
    if (options.stream && allhandsResponse.body) {
      // Use Node.js stream events instead of getReader()
      let buffer = ""

      allhandsResponse.body.on("data", (chunk) => {
        // Convert Buffer to string and add to our buffer
        buffer += chunk.toString()

        // Process complete JSON objects from the buffer
        let newlineIndex
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex)
          buffer = buffer.slice(newlineIndex + 1)

          if (line.trim() === "") continue

          try {
            // Forward the data to the client
            res.write(`data: ${line}\n\n`)
          } catch (e) {
            console.error("Error processing AllHands stream:", e, "Line:", line)
          }
        }
      })

      allhandsResponse.body.on("end", () => {
        res.write(`data: [DONE]\n\n`)
        res.end()
      })

      allhandsResponse.body.on("error", (error) => {
        console.error("Error streaming from AllHands:", error)
        res.write(`data: ${JSON.stringify({ error: "Error connecting to AllHands AI" })}\n\n`)
        res.end()
      })
    } else {
      // Handle regular response
      const data = await allhandsResponse.json()
      res.json(data)
    }
  } catch (error) {
    console.error("Error processing AllHands query:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process AllHands query",
    })
  }
})

// Get available models from AllHands
router.get("/models", checkApiKey, async (req, res) => {
  try {
    const response = await fetch(`${ALLHANDS_API_URL}/models`, {
      headers: {
        Authorization: `Bearer ${ALLHANDS_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`AllHands API error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error("Error fetching AllHands models:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch AllHands models",
    })
  }
})

export const allhandsRouter = router
