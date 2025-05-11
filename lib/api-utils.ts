/**
 * Utility function to fetch with retry capability
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  retryDelay = 1000,
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options)

      // If the response is ok, return it immediately
      if (response.ok) {
        return response
      }

      // If we get a 5xx error, we'll retry
      if (response.status >= 500) {
        lastError = new Error(`Server error: ${response.status}`)
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        continue
      }

      // For other error codes, don't retry
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error occurred")

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Failed to fetch after multiple retries")
}

/**
 * Check if the backend is available
 */
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetchWithRetry("/api/status", {}, 2, 500)
    const data = await response.json()
    return data.online || false
  } catch (error) {
    console.error("Backend status check failed:", error)
    return false
  }
}

/**
 * Create a streaming fetch that handles reconnection
 */
export async function createStreamingFetch(
  url: string,
  body: any,
  onChunk: (chunk: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
) {
  let retries = 0
  const maxRetries = 3
  const retryDelay = 1000

  const attemptFetch = async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete()
          break
        }

        // Convert the chunk to text and add to buffer
        const chunk = new TextDecoder().decode(value)
        buffer += chunk

        // Process complete lines from the buffer
        let newlineIndex
        while ((newlineIndex = buffer.indexOf("\n\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex)
          buffer = buffer.slice(newlineIndex + 2)

          if (line.trim() === "") continue

          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") {
              onComplete()
              return
            }

            onChunk(data)
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)

      if (retries < maxRetries) {
        retries++
        console.log(`Retrying connection (${retries}/${maxRetries})...`)

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * retries))
        return attemptFetch()
      } else {
        onError(error instanceof Error ? error : new Error("Unknown streaming error"))
      }
    }
  }

  return attemptFetch()
}
