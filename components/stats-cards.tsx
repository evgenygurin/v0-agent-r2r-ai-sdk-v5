"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, FileText, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  totalQueries?: number
  averageThinkingTime?: number
  documentsProcessed?: number
  successRate?: number
}

export function StatsCards({
  totalQueries = 0,
  averageThinkingTime = 0,
  documentsProcessed = 0,
  successRate = 100,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Queries",
      value: totalQueries.toString(),
      description: "Research questions processed",
      icon: MessageSquare,
      trend: "+12% from last month",
    },
    {
      title: "Avg Thinking Time",
      value: `${averageThinkingTime.toFixed(1)}s`,
      description: "Average reasoning duration",
      icon: Brain,
      trend: "-5% faster",
    },
    {
      title: "Documents",
      value: documentsProcessed.toString(),
      description: "Ingested and indexed",
      icon: FileText,
      trend: "+23% this week",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      description: "Successfully completed",
      icon: TrendingUp,
      trend: "Excellent performance",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">{stat.trend}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
