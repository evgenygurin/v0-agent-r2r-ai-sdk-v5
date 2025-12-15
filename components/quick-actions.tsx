"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Search, Network, Settings } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button variant="outline" className="justify-start bg-transparent" asChild>
          <a href="/documents">
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </a>
        </Button>
        <Button variant="outline" className="justify-start bg-transparent" asChild>
          <a href="/search/hybrid">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </a>
        </Button>
        <Button variant="outline" className="justify-start bg-transparent" asChild>
          <a href="/knowledge-graph">
            <Network className="mr-2 h-4 w-4" />
            View Knowledge Graph
          </a>
        </Button>
        <Button variant="outline" className="justify-start bg-transparent" asChild>
          <a href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configure Settings
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
