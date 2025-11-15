'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MonitoringDashboard() {
  const { data: health, error: healthError } = useSWR('/api/health', fetcher, {
    refreshInterval: 10000,
  })

  const { data: metrics, error: metricsError } = useSWR('/api/monitoring/metrics', fetcher, {
    refreshInterval: 5000,
  })

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">System Monitoring</h2>
        <p className="text-sm text-muted-foreground">
          Real-time status of Claude Code SDK and R2R services
        </p>
      </div>

      {/* Service Health */}
      <div className="grid gap-4 md:grid-cols-2">
        {health?.services?.map((service: any) => (
          <Card key={service.service}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {service.service === 'r2r' ? 'R2R Agent' : 'Claude Code SDK'}
              </CardTitle>
              {service.status === 'healthy' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : service.status === 'degraded' ? (
                <Activity className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    service.status === 'healthy'
                      ? 'default'
                      : service.status === 'degraded'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {service.status}
                </Badge>
                {service.responseTime && (
                  <span className="text-xs text-muted-foreground">
                    {service.responseTime}ms
                  </span>
                )}
              </div>
              {service.error && (
                <p className="mt-2 text-xs text-destructive">{service.error}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.successfulRequests} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.averageDuration)}ms
              </div>
              <p className="text-xs text-muted-foreground">Average latency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalRequests > 0
                  ? Math.round((metrics.successfulRequests / metrics.totalRequests) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.failedRequests} failed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* External Dashboards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>R2R Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access the R2R dashboard for document management and conversation history.
            </p>
            <a
              href="http://136.119.36.216:7273"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open R2R Dashboard →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hatchet Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor workflow execution and job status in Hatchet.
            </p>
            <a
              href="http://136.119.36.216:7274"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open Hatchet Dashboard →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
