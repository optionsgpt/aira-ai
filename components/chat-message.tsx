"use client"

import type { Message } from "ai"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Bot, User } from "lucide-react"
import { useTheme } from "next-themes"

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex items-start gap-3 max-w-[85%]", isUser && "flex-row-reverse")}>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <Card
          className={cn(
            "p-4 shadow-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-card border-primary/10 shadow-sm",
          )}
        >
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <div className="relative rounded-md overflow-hidden my-4">
                      <div className={`p-4 overflow-x-auto ${isDark ? "bg-[#1e1e1e]" : "bg-[#f5f5f5]"} rounded-md`}>
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
        </Card>
      </div>
    </div>
  )
}
