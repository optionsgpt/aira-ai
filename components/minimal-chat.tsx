"use client"

import type React from "react"

import { useState } from "react"

export default function MinimalChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simple fetch to test backend connection
      const response = await fetch("/api/status")
      const data = await response.json()

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Backend status: ${data.online ? "Online" : "Offline"}. This is a test response to show the chat is working.`,
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please check your backend connection.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Minimal Chat Test</h1>

      <div className="border rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg mb-2 ${msg.role === "user" ? "bg-blue-100 ml-12" : "bg-gray-100 mr-12"}`}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  )
}
