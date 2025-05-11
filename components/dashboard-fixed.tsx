"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ChatInterfaceFixed from "@/components/chat-interface-fixed"
import { ProjectProvider } from "@/context/project-context"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function DashboardFixed() {
  const [activeTab, setActiveTab] = useState("chat")
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <ProjectProvider>
      <div className="flex flex-col h-screen bg-background">
        <header className="border-b h-14 flex items-center px-4">
          <h1 className="text-xl font-bold">Aira AI</h1>
        </header>

        <div className="flex-1 overflow-hidden">
          {isMobile ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b px-4">
                <TabsList className="h-14">
                  <TabsTrigger value="chat" className="flex-1">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex-1">
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="flex-1">
                    Editor
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-hidden">
                <TabsContent value="chat" className="h-full m-0 p-0">
                  <ChatInterfaceFixed />
                </TabsContent>
                <TabsContent value="files" className="h-full m-0 p-0">
                  <div className="p-4">Files Panel (Coming Soon)</div>
                </TabsContent>
                <TabsContent value="editor" className="h-full m-0 p-0">
                  <div className="p-4">Editor Panel (Coming Soon)</div>
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r">
                <div className="p-4">Files Panel (Coming Soon)</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <ChatInterfaceFixed />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="p-4">Editor Panel (Coming Soon)</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>
    </ProjectProvider>
  )
}
