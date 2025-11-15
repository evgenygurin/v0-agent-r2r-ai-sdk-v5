'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { MonitoringDashboard } from '@/components/monitoring-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Activity, MessageSquare, Settings } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Claude Code + R2R</h1>
              <p className="text-xs text-muted-foreground">AI Agent Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Docs
            </Button>
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex-1">
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
