"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProject } from "@/context/project-context"
import { useTheme } from "next-themes"
import { FileCode } from "lucide-react"
import { motion } from "framer-motion"

interface CodeEditorProps {
  filePath: string | null
}

export default function CodeEditor({ filePath }: CodeEditorProps) {
  const { projectFiles } = useProject()
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string>("text")
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (filePath) {
      const file = projectFiles.find((f) => f.path === filePath)
      if (file) {
        setFileContent(file.content)
        setFileType(file.type || getLanguageFromPath(filePath))
      }
    } else {
      setFileContent(null)
    }
  }, [filePath, projectFiles])

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split(".").pop()?.toLowerCase() || ""

    const extensionMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rb: "ruby",
      php: "php",
      swift: "swift",
      kt: "kotlin",
      rs: "rust",
      sh: "shell",
      bash: "shell",
      yml: "yaml",
      yaml: "yaml",
      toml: "toml",
      xml: "xml",
      svg: "svg",
      sql: "sql",
      graphql: "graphql",
      prisma: "prisma",
    }

    return extensionMap[extension] || "text"
  }

  const renderPreview = () => {
    if (!fileContent) return null

    if (fileType === "html") {
      return (
        <div className="h-full">
          <iframe
            srcDoc={fileContent}
            title="HTML Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      )
    }

    return (
      <div className="p-4 text-sm">
        <p>Preview not available for this file type.</p>
      </div>
    )
  }

  const canPreview = fileType === "html"

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 h-14 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          <h2 className="font-semibold font-space-grotesk">{filePath ? filePath.split("/").pop() : "Code Editor"}</h2>
        </div>

        {filePath && canPreview && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "preview")}>
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {!filePath ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FileCode className="h-12 w-12 text-muted-foreground mb-4 opacity-50 floating" />
            <h3 className="text-sm font-medium mb-1 font-space-grotesk">No file selected</h3>
            <p className="text-xs text-muted-foreground">
              Select a file from the Project Explorer to view and edit its content
            </p>
          </motion.div>
        ) : (
          <TabsContent value={activeTab} className="m-0 h-full">
            {activeTab === "code" ? (
              <ScrollArea className="h-full futuristic-scrollbar">
                <motion.div
                  className="p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <pre
                    className={`p-4 rounded-lg overflow-x-auto ${
                      isDark ? "bg-[#1e1e1e] text-white" : "bg-[#f5f5f5] text-black"
                    } shadow-sm border border-primary/10 glass-effect`}
                  >
                    <code>{fileContent || ""}</code>
                  </pre>
                </motion.div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full futuristic-scrollbar">{renderPreview()}</ScrollArea>
            )}
          </TabsContent>
        )}
      </div>
    </div>
  )
}
