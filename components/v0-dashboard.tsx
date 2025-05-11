"use client"

import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import V0ChatInterface from "@/components/v0-chat-interface"
import { ProjectProvider } from "@/context/project-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import CursorTrail from "@/components/cursor-trail"

export default function V0Dashboard() {
  const [activeTab, setActiveTab] = useState("chat")
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background">
        <AnimatedBackground />
        <Header />
        <CursorTrail />

        <div className="flex-1 overflow-hidden">
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
                  <V0ChatInterface />
                </TabsContent>
                <TabsContent value="files" className="h-full m-0 p-0 data-[state=active]:fade-in">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Files panel will be available soon</p>
                  </div>
                </TabsContent>
                <TabsContent value="editor" className="h-full m-0 p-0 data-[state=active]:fade-in">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Editor panel will be available soon</p>
                  </div>
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
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Files panel will be available soon</p>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-primary/20 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={60} minSize={30} className="backdrop-blur-sm bg-background/50">
                <V0ChatInterface />
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-primary/20 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={20} minSize={15} className="backdrop-blur-sm bg-background/50">
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Editor panel will be available soon</p>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </ProjectProvider>
  )
}
