"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Sparkles } from "lucide-react"

export default function ChatInterfaceFixed() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; id: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message to the chat
    const userMessage = { role: "user", content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    setInput("")

    // Set loading state
    setIsLoading(true)

    try {
      // Call your backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001"}/api/ollama/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Process the response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let assistantMessage = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantMessage += parsed.text
                // Update the assistant message in real-time
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const assistantIdx = newMessages.findIndex((m) => m.role === "assistant" && m.id === "current")

                  if (assistantIdx >= 0) {
                    newMessages[assistantIdx] = {
                      ...newMessages[assistantIdx],
                      content: assistantMessage,
                    }
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                      id: "current",
                    })
                  }

                  return newMessages
                })
              }
            } catch (e) {
              console.error("Error parsing JSON:", e)
            }
          }
        }
      }

      // Finalize the assistant message
      setMessages((prev) => {
        const newMessages = prev.filter((m) => m.id !== "current")
        newMessages.push({
          role: "assistant",
          content: assistantMessage,
          id: Date.now().toString(),
        })
        return newMessages
      })
    } catch (error) {
      console.error("Error:", error)
      // Add an error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          id: Date.now().toString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle new chat
  const handleNewChat = () => {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 h-14">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Chat</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat}>
          <Sparkles className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <Card className="h-full overflow-hidden">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h3 className="text-lg font-semibold mb-2">Welcome to Aira AI</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything! I can help with questions, summarize documents, analyze code, and more.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? "Sending..." : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
