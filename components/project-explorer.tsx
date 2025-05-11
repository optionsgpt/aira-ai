"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useProject } from "@/context/project-context"
import { ChevronRight, ChevronDown, Search, Folder, FileText, FileCode, File } from "lucide-react"
import { motion } from "framer-motion"

interface ProjectExplorerProps {
  onFileSelect: (filePath: string) => void
}

export default function ProjectExplorer({ onFileSelect }: ProjectExplorerProps) {
  const { projectFiles } = useProject()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"])) // Root is expanded by default

  // Build file tree structure
  const fileTree = useMemo(() => {
    const tree: Record<string, any> = { "/": { type: "folder", children: {} } }

    projectFiles.forEach((file) => {
      const pathParts = file.path.split("/")
      let currentPath = ""
      let currentNode = tree["/"].children

      pathParts.forEach((part, index) => {
        if (!part) return // Skip empty parts

        const isLastPart = index === pathParts.length - 1
        currentPath += "/" + part

        if (!currentNode[part]) {
          currentNode[part] = {
            type: isLastPart ? "file" : "folder",
            path: currentPath,
            children: isLastPart ? null : {},
            fileType: isLastPart ? file.type : null,
            content: isLastPart ? file.content : null,
          }
        }

        if (!isLastPart) {
          currentNode = currentNode[part].children
        }
      })
    })

    return tree
  }, [projectFiles])

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return projectFiles

    return projectFiles.filter((file) => file.path.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [projectFiles, searchQuery])

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const getFileIcon = (fileType: string) => {
    const codeTypes = [
      "javascript",
      "typescript",
      "python",
      "java",
      "c",
      "cpp",
      "csharp",
      "go",
      "ruby",
      "php",
      "swift",
      "rust",
    ]

    if (codeTypes.includes(fileType)) {
      return <FileCode className="h-4 w-4 text-blue-500" />
    } else if (fileType === "markdown" || fileType === "text") {
      return <FileText className="h-4 w-4 text-gray-500" />
    } else {
      return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const renderTree = (node: any, nodeName: string, nodePath = "/", depth = 0) => {
    if (node.type === "file") {
      return (
        <motion.div
          key={nodePath}
          className="flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-muted rounded-md glow-effect"
          onClick={() => onFileSelect(nodePath)}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.05, duration: 0.2 }}
          whileHover={{ x: 3 }}
        >
          {getFileIcon(node.fileType || "text")}
          <span className="ml-2 truncate">{nodeName}</span>
        </motion.div>
      )
    }

    const isExpanded = expandedFolders.has(nodePath)

    return (
      <div key={nodePath}>
        <motion.div
          className="flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-muted rounded-md"
          onClick={() => toggleFolder(nodePath)}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.05, duration: 0.2 }}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Folder className="h-4 w-4 text-yellow-500 ml-1" />
          <span className="ml-1 font-medium">{nodeName === "/" ? "Project Root" : nodeName}</span>
        </motion.div>

        {isExpanded && node.children && (
          <div className="pl-4 border-l border-border ml-3 mt-1">
            {Object.entries(node.children)
              .sort(([aName, aNode]: [string, any], [bName, bNode]: [string, any]) => {
                // Folders first, then files
                if (aNode.type === "folder" && bNode.type === "file") return -1
                if (aNode.type === "file" && bNode.type === "folder") return 1
                // Alphabetical within same type
                return aName.localeCompare(bName)
              })
              .map(([childName, childNode]: [string, any]) =>
                renderTree(childNode, childName, childNode.path, depth + 1),
              )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 h-14 backdrop-blur-sm bg-background/50">
        <h2 className="font-semibold font-space-grotesk">Project Explorer</h2>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            className="pl-8 focus-visible:ring-primary/50 focus-visible:ring-offset-2 futuristic-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4 futuristic-scrollbar">
        {projectFiles.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Folder className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-sm font-medium mb-1 font-space-grotesk">No files yet</h3>
            <p className="text-xs text-muted-foreground mb-4">Upload files or clone a repository to get started</p>
          </motion.div>
        ) : searchQuery ? (
          <div className="space-y-1">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.path}
                className="flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-muted rounded-md"
                onClick={() => onFileSelect(file.path)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                {getFileIcon(file.type || "text")}
                <span className="ml-2 truncate">{file.path}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">{renderTree(fileTree["/"], "/")}</div>
        )}
      </ScrollArea>
    </div>
  )
}
