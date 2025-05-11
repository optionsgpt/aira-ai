import express, { type Request, type Response } from "express"
import fetch from "node-fetch"

const router = express.Router()

// Ollama API host
const OLLAMA_API_HOST = process.env.OLLAMA_API_HOST || "http://localhost:11434"

// Get available models
router.get("/models", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${OLLAMA_API_HOST}/api/tags`)

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    res.json({
      models: data.models || [],
      currentModel: process.env.OLLAMA_MODEL || "llama3",
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch models",
    })
  }
})

// Select a model
router.post("/models/select", async (req: Request, res: Response) => {
  try {
    const { model } = req.body

    if (!model) {
      return res.status(400).json({ error: "Model name is required" })
    }

    // Update the environment variable
    process.env.OLLAMA_MODEL = model

    res.json({ success: true, model })
  } catch (error) {
    console.error("Error selecting model:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to select model",
    })
  }
})

// Chat endpoint with streaming
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, attachments = [], projectFiles = [] } = req.body

    // Process attachments and files
    const processedMessages = await processAttachmentsAndFiles(messages, attachments, projectFiles)

    // Set up headers for streaming
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache, no-transform")
    res.setHeader("Connection", "keep-alive")

    // Format messages for Ollama
    const formattedMessages = formatMessagesForOllama(processedMessages)

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_API_HOST}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3",
        messages: formattedMessages,
        stream: true,
      }),
    })

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      throw new Error(`Ollama API error: ${ollamaResponse.status} ${ollamaResponse.statusText}`)
    }

    // Stream the response using Node.js streams
    let buffer = ""

    ollamaResponse.body.on("data", (chunk) => {
      // Convert Buffer to string and add to our buffer
      buffer += chunk.toString()

      // Process complete JSON objects from the buffer
      let newlineIndex
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex)
        buffer = buffer.slice(newlineIndex + 1)

        if (line.trim() === "") continue

        try {
          const data = JSON.parse(line)

          if (data.message?.content) {
            const chunk = data.message.content
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          }
        } catch (e) {
          console.error("Error parsing JSON from Ollama:", e, "Line:", line)
        }
      }
    })

    ollamaResponse.body.on("end", () => {
      res.write(`data: [DONE]\n\n`)
      res.end()
    })

    ollamaResponse.body.on("error", (error) => {
      console.error("Error streaming from Ollama:", error)
      res.write(`data: ${JSON.stringify({ error: "Error connecting to Ollama" })}\n\n`)
      res.end()
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    res.status(500).json({ error: "Failed to process request" })
  }
})

// Helper functions
function formatMessagesForOllama(messages: any[]) {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }))
}

async function processAttachmentsAndFiles(messages: any[], attachments: any[], projectFiles: any[]) {
  // Create a new message array
  const newMessages = [...messages]

  // Find the last user message
  const lastUserMessageIndex = newMessages.findIndex((message) => message.role === "user")

  if (lastUserMessageIndex !== -1) {
    // Modify the last user message to include information about the attachments and files
    const lastUserMessage = newMessages[lastUserMessageIndex]
    let additionalContent = ""

    // Add attachment information
    if (attachments && attachments.length > 0) {
      const attachmentDescriptions = attachments
        .map((attachment) => {
          if (attachment.isZip) {
            return `[Attached ZIP file: ${attachment.name}, containing ${attachment.fileCount} files]`
          }
          return `[Attached file: ${attachment.name}, Type: ${attachment.type}, Size: ${formatFileSize(attachment.size)}]`
        })
        .join("\n")

      additionalContent += `\n\n${attachmentDescriptions}`
    }

    // Add project files information
    if (projectFiles && projectFiles.length > 0) {
      const fileList = projectFiles.map((file) => `- ${file.path}`).join("\n")

      additionalContent += `\n\nProject files available for analysis:\n${fileList}`

      // Add content of small files directly (limit to avoid token issues)
      const smallFiles = projectFiles.filter((file) => file.content.length < 5000)
      if (smallFiles.length > 0) {
        const fileContents = smallFiles
          .map((file) => `File: ${file.path}\n\`\`\`${file.type || ""}\n${file.content}\n\`\`\``)
          .join("\n\n")

        additionalContent += `\n\nContent of selected files:\n\n${fileContents}`
      }

      // Mention larger files
      const largeFiles = projectFiles.filter((file) => file.content.length >= 5000)
      if (largeFiles.length > 0) {
        const largeFilesList = largeFiles
          .map((file) => `- ${file.path} (${formatFileSize(file.content.length)})`)
          .join("\n")

        additionalContent += `\n\nLarger files available (ask about specific sections if needed):\n${largeFilesList}`
      }
    }

    // Update the message content
    newMessages[lastUserMessageIndex] = {
      ...lastUserMessage,
      content: `${lastUserMessage.content}${additionalContent}`,
    }
  }

  return newMessages
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

export const ollamaRouter = router
