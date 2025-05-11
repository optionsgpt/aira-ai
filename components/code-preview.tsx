"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useTheme } from "next-themes"

interface CodePreviewProps {
  code: string
  language?: string
}

export default function CodePreview({ code, language = "javascript" }: CodePreviewProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="rounded-md overflow-hidden border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted">
        <div className="text-sm font-medium">{language}</div>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 gap-1">
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{isCopied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <pre className={`p-4 overflow-auto ${isDark ? "bg-[#1e1e1e] text-white" : "bg-[#f5f5f5] text-black"}`}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
