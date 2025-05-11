"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Send, Sparkles, Bot, User, Code, Play, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function V0StyleInterface() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; id: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview">("chat")
  const [selectedCode, setSelectedCode] = useState<string>("")
  const [isCopied, setIsCopied] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to communicate with AI service",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSelectedCode("")
    setActiveTab("chat")
  }

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g
    const matches = [...content.matchAll(codeBlockRegex)]
    return matches.map((match) => match[1])
  }

  const handleViewCode = (content: string) => {
    const codeBlocks = extractCodeBlocks(content)
    if (codeBlocks.length > 0) {
      setSelectedCode(codeBlocks[0])
      setActiveTab("code")
    } else {
      toast({
        title: "No code found",
        description: "This message doesn't contain any code blocks.",
        variant: "default",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
      variant: "default",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 h-14 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Aira AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chat" | "code" | "preview")}>
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleNewChat}>
            <Sparkles className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="chat" className="h-full m-0 p-4">
          <div className="flex-1 h-full overflow-hidden border shadow-sm rounded-lg">
            <ScrollArea className="h-full p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to Aira AI</h3>
                  <p className="text-muted-foreground max-w-md">
                    Ask me anything! I can help with questions, summarize documents, analyze code, and more.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="flex">
                      <div
                        className={cn(
                          "flex items-start gap-3 max-w-[85%]",
                          message.role === "user" ? "ml-auto" : "mr-auto",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground order-last"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div
                          className={cn(
                            "p-4 rounded-lg shadow-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border-primary/10",
                          )}
                        >
                          <div className="prose dark:prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "")
                                  return !inline && match ? (
                                    <div className="relative rounded-md overflow-hidden my-4">
                                      <div
                                        className={`p-4 overflow-x-auto ${
                                          isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f5]"
                                        } rounded-md`}
                                      >
                                        <div className="absolute right-2 top-2 flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                                            onClick={() => copyToClipboard(String(children))}
                                          >
                                            {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                                            onClick={() => {
                                              setSelectedCode(String(children))
                                              setActiveTab("code")
                                            }}
                                          >
                                            <Code className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <code className={className} {...props}>
                                          {String(children).replace(/\n$/, "")}
                                        </code>
                                      </div>
                                    </div>
                                  ) : (
                                    <code className={cn("px-1 py-0.5 rounded-md bg-muted", className)} {...props}>
                                      {children}
                                    </code>
                                  )
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                          {message.role === "assistant" && extractCodeBlocks(message.content).length > 0 && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleViewCode(message.content)}
                              >
                                <Code className="h-3 w-3 mr-1" />
                                View Code
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="code" className="h-full m-0 p-4">
          <div className="flex-1 h-full overflow-hidden border shadow-sm rounded-lg">
            <div className="border-b p-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">Code Editor</h3>
              <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => copyToClipboard(selectedCode)}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <pre
                className={`p-4 ${isDark ? "bg-[#1e1e1e] text-white" : "bg-[#f5f5f5] text-black"} h-full overflow-auto`}
              >
                <code>{selectedCode}</code>
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="h-full m-0 p-4">
          <div className="flex-1 h-full overflow-hidden border shadow-sm rounded-lg">
            <div className="border-b p-2">
              <h3 className="text-sm font-medium">Preview</h3>
            </div>
            <div className="h-[calc(100%-40px)] p-4 bg-white dark:bg-gray-900">
              <div className="border rounded-lg h-full flex items-center justify-center">
                <p className="text-muted-foreground">Preview will be available soon</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>

      <div className="p-4 border-t backdrop-blur-sm bg-background/50">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="flex items-end gap-2 p-2 bg-background rounded-md border">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or type '/' for commands..."
              className="min-h-[60px] resize-none flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim() !== "") {
                    handleSubmit(e as any)
                  }
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || input.trim() === ""}
              className="transition-all duration-300 hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
