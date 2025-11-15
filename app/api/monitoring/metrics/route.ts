// Metrics endpoint for monitoring request performance

import { claudeCodeMiddleware } from '@/lib/claude-code/middleware'

export const runtime = 'edge'

export async function GET() {
  try {
    const metrics = claudeCodeMiddleware.getMetrics()

    const stats = {
      totalRequests: metrics.length,
      successfulRequests: metrics.filter(m => m.success).length,
      failedRequests: metrics.filter(m => !m.success).length,
      averageDuration: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length
        : 0,
      metrics: metrics.slice(-50), // Last 50 requests
    }

    return Response.json(stats)
  } catch (error) {
    console.error('[v0] Metrics error:', error)
    return Response.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    claudeCodeMiddleware.clearMetrics()
    return Response.json({ message: 'Metrics cleared' })
  } catch (error) {
    console.error('[v0] Metrics clear error:', error)
    return Response.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    )
  }
}
