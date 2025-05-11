"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import ChatMessage from "@/components/chat-message"
import FileAttachmentButton from "@/components/file-attachment-button"
import { useProject } from "@/context/project-context"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, Sparkles, Zap, Send, Trash } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function ChatInterface() {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { projectFiles } = useProject()
  const { toast } = useToast()

  useEffect(() => {
    // Check if the backend is available
    const checkBackend = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/health`)
        if (!response.ok) {
          toast({
            title: "Backend Connection Issue",
            description: "Could not connect to the backend server. Please make sure it's running.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Backend connection error:", error)
        toast({
          title: "Backend Connection Error",
          description: "Failed to connect to the backend server. Check the console for details.",
          variant: "destructive",
        })
      }
    }

    checkBackend()
  }, [toast])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatLoading,
    reload,
    stop,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: () => {
      setIsLoading(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to communicate with AI service",
        variant: "destructive",
      })
      setIsLoading(false)
    },
    body: {
      attachments,
      projectFiles: projectFiles.length > 0 ? projectFiles : undefined,
    },
  })

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "" && attachments.length === 0) return

    setIsLoading(true)
    handleSubmit(e)
    setAttachments([])
  }

  const handleFileAttachment = (files: any[]) => {
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  const handleNewChat = () => {
    setMessages([])
    setAttachments([])
  }

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 h-14 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 futuristic-button" onClick={handleNewChat}>
            <Sparkles className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <Card className="flex-1 h-full overflow-hidden border shadow-sm gradient-border glass-effect">
          <ScrollArea className="h-full p-4 futuristic-scrollbar">
            {messages.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full text-center p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-full bg-primary/10 p-3 mb-4 floating brain-animation">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-space-grotesk bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                  Welcome to Aira AI
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything or upload files for me to analyze. I can help with questions, summarize documents,
                  analyze code, and more.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-md">
                  <motion.div
                    className="flex flex-col gap-2 p-4 border rounded-lg bg-card glow-effect glass-effect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="text-sm font-medium">Upload Files</div>
                    <div className="text-xs text-muted-foreground">
                      Upload ZIP files, code, or documents for analysis
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex flex-col gap-2 p-4 border rounded-lg bg-card glow-effect glass-effect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="text-sm font-medium">Clone Repositories</div>
                    <div className="text-xs text-muted-foreground">Clone GitHub repositories to analyze code</div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <div className="p-4 border-t backdrop-blur-sm bg-background/50">
        <div className="relative">
          <form onSubmit={handleFormSubmit} className="flex flex-col space-y-2">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-t-md border">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1 bg-background px-2 py-1 rounded-md text-sm border"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "flex items-end gap-2 p-2 bg-background rounded-md border gradient-border glass-effect",
                attachments.length > 0 && "rounded-t-none border-t-0",
              )}
            >
              <FileAttachmentButton onAttach={handleFileAttachment} />
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-3 futuristic-input"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (input.trim() !== "" || attachments.length > 0) {
                      handleFormSubmit(e as any)
                    }
                  }
                }}
              />
              <div className="flex gap-2">
                {chatLoading && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => stop()}
                          className="transition-all duration-300 hover:bg-destructive/90"
                        >
                          <Trash className="h-5 w-5" />
                          <span className="sr-only">Stop generation</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Stop generation</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || chatLoading || (input.trim() === "" && attachments.length === 0)}
                        className="transition-all duration-300 hover:bg-primary/90 futuristic-button"
                      >
                        {isLoading || chatLoading ? (
                          <div className="ai-thinking">
                            <div className="ai-thinking-bar"></div>
                            <div className="ai-thinking-bar"></div>
                            <div className="ai-thinking-bar"></div>
                          </div>
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                        <span className="sr-only">Send message</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
