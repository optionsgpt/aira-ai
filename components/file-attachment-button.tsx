"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { v4 as uuidv4 } from "uuid"
import { Paperclip, FileArchive, FileCode, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useProject } from "@/context/project-context"
import JSZip from "jszip"

interface FileAttachmentButtonProps {
  onAttach: (files: any[]) => void
}

export default function FileAttachmentButton({ onAttach }: FileAttachmentButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { setProjectFiles } = useProject()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files))
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const processFiles = async (files: File[]) => {
    const fileAttachments = []
    const projectFilesList = []

    for (const file of files) {
      // Check if it's a zip file
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        try {
          const zipFiles = await extractZipFiles(file)
          projectFilesList.push(...zipFiles)

          // Add the zip file itself as an attachment
          fileAttachments.push({
            id: uuidv4(),
            name: file.name,
            type: file.type,
            size: file.size,
            isZip: true,
            fileCount: zipFiles.length,
          })

          toast({
            title: "ZIP file processed",
            description: `Extracted ${zipFiles.length} files from ${file.name}`,
          })
        } catch (error) {
          toast({
            title: "Failed to process ZIP file",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          })
        }
      } else {
        // Regular file
        const base64 = await fileToBase64(file)
        const fileAttachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: base64,
        }

        fileAttachments.push(fileAttachment)

        // If it's a code or text file, also add to project files
        if (isCodeOrTextFile(file)) {
          const content = await file.text()
          projectFilesList.push({
            path: file.name,
            content,
            type: getFileType(file.name),
          })
        }
      }
    }

    if (projectFilesList.length > 0) {
      setProjectFiles(projectFilesList)
    }

    if (fileAttachments.length > 0) {
      onAttach(fileAttachments)
    }
  }

  const extractZipFiles = async (zipFile: File): Promise<any[]> => {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipFile)
    const files = []

    const processZipEntry = async (relativePath: string, zipEntry: JSZip.JSZipObject) => {
      if (!zipEntry.dir) {
        const content = await zipEntry.async("string")
        files.push({
          path: relativePath,
          content,
          type: getFileType(relativePath),
        })
      }
    }

    const promises = []
    zipContent.forEach((relativePath, zipEntry) => {
      promises.push(processZipEntry(relativePath, zipEntry))
    })

    await Promise.all(promises)
    return files
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const isCodeOrTextFile = (file: File): boolean => {
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".html",
      ".css",
      ".scss",
      ".json",
      ".md",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".rb",
      ".php",
      ".swift",
      ".kt",
      ".rs",
      ".sh",
      ".bash",
      ".yml",
      ".yaml",
      ".toml",
      ".ini",
      ".cfg",
      ".conf",
      ".xml",
      ".svg",
      ".sql",
      ".graphql",
      ".prisma",
    ]

    return file.type.startsWith("text/") || codeExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  }

  const getFileType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    // Map extensions to types
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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "application/zip":
        return <FileArchive className="h-4 w-4" />
      case "text/plain":
      case "text/markdown":
        return <FileText className="h-4 w-4" />
      case "application/json":
      case "text/javascript":
      case "text/html":
      case "text/css":
        return <FileCode className="h-4 w-4" />
      default:
        return <Paperclip className="h-4 w-4" />
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${isDragging ? "ring-2 ring-primary" : ""}`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">Attach files (including .zip)</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".zip,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.txt,image/*,application/pdf"
      />
    </div>
  )
}
