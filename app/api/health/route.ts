// Health check endpoint for all services

import { checkAllServices } from '@/lib/monitoring/health'

export const runtime = 'edge'

export async function GET() {
  try {
    const healthChecks = await checkAllServices()

    const allHealthy = healthChecks.every(check => check.status === 'healthy')
    const statusCode = allHealthy ? 200 : 503

    return Response.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        services: healthChecks,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  } catch (error) {
    console.error('[v0] Health check error:', error)
    return Response.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
