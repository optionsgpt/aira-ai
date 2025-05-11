"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ChatInterface from "@/components/chat-interface"
import ProjectExplorer from "@/components/project-explorer"
import CodeEditor from "@/components/code-editor"
import Header from "@/components/header"
import { ProjectProvider } from "@/context/project-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import CursorTrail from "@/components/cursor-trail"
import AnimatedBackground from "@/components/animated-background"
import { motion } from "framer-motion"
import OllamaSetupGuide from "@/components/ollama-setup-guide"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [ollamaStatus, setOllamaStatus] = useState<"online" | "offline" | "checking">("checking")
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const response = await fetch("/api/status")
        const data = await response.json()
        setOllamaStatus(data.online ? "online" : "offline")
      } catch (error) {
        setOllamaStatus("offline")
      }
    }

    checkOllamaStatus()
  }, [])

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath)
    if (isMobile) {
      setActiveTab("editor")
    }
  }

  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background">
        <AnimatedBackground />
        <Header />
        <CursorTrail />

        {ollamaStatus === "offline" && (
          <div className="w-full bg-destructive/10 py-2 px-4 flex items-center justify-center">
            <OllamaSetupGuide />
          </div>
        )}

        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isMobile ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b px-4 backdrop-blur-sm bg-background/50">
                <TabsList className="h-14">
                  <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-primary/10">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex-1 data-[state=active]:bg-primary/10">
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="flex-1 data-[state=active]:bg-primary/10">
                    Editor
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-hidden">
                <TabsContent value="chat" className="h-full m-0 p-0 data-[state=active]:fade-in">
                  <ChatInterface />
                </TabsContent>
                <TabsContent value="files" className="h-full m-0 p-0 data-[state=active]:fade-in">
                  <ProjectExplorer onFileSelect={handleFileSelect} />
                </TabsContent>
                <TabsContent value="editor" className="h-full m-0 p-0 data-[state=active]:fade-in">
                  <CodeEditor filePath={selectedFile} />
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="border-r backdrop-blur-sm bg-background/50"
              >
                <ProjectExplorer onFileSelect={handleFileSelect} />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-primary/20 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={45} minSize={30} className="backdrop-blur-sm bg-background/50">
                <ChatInterface />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-primary/20 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={35} minSize={20} className="backdrop-blur-sm bg-background/50">
                <CodeEditor filePath={selectedFile} />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </motion.div>
      </div>
    </ProjectProvider>
  )
}
