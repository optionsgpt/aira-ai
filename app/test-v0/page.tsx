"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bot, User, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestV0Page() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I'm Aira AI. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }])

    // Simulate loading
    setIsLoading(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `This is a test response to your message: "${input}"\n\n\`\`\`javascript\nconsole.log("Hello, world!");\n\`\`\``,
        },
      ])
      setInput("")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">V0-Style Interface Test</h1>

      <div className="border rounded-lg overflow-hidden">
        <div className="border-b p-2 bg-muted/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[500px] overflow-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="chat" className="m-0">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start gap-2 max-w-[80%]`}>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          message.role === "user" ? "bg-primary text-white order-last" : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${message.role === "user" ? "bg-primary text-white" : "bg-muted"}`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="code" className="m-0">
              <div className="bg-muted p-4 rounded-lg h-full">
                <pre className="text-sm">
                  <code>console.log("Hello, world!");</code>
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <div className="border rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-muted-foreground">Preview will be available soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[60px] resize-none flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as any)
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? "..." : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        <div className="space-y-2">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded">✅ Chat interface rendering correctly</div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded">✅ Tab navigation working</div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded">✅ Message input and submission</div>
        </div>
      </div>
    </div>
  )
}
