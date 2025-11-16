'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { MonitoringDashboard } from '@/components/monitoring-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Activity, MessageSquare, Settings } from 'lucide-react'
import BackgroundPaths from '@/components/background-paths'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <main className="relative flex h-full flex-col bg-background">
      <BackgroundPaths />
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Chat</h1>
            <p className="text-xs text-muted-foreground">Claude Code + R2R Agent</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-border bg-card">
            <TabsList className="mx-auto h-12 max-w-7xl bg-transparent px-4">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="h-full p-0">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="monitoring" className="h-full p-0">
            <MonitoringDashboard />
          </TabsContent>

          <TabsContent value="settings" className="h-full p-4">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure your Claude Code and R2R integration settings.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
