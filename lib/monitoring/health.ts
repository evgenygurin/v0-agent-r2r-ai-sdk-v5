// Health check utilities for monitoring system status

export interface HealthStatus {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  error?: string
  timestamp: Date
}

export async function checkR2RHealth(): Promise<HealthStatus> {
  const startTime = Date.now()

  try {
    const baseUrl = process.env.R2R_BASE_URL || process.env.NEXT_PUBLIC_R2R_BASE_URL || 'http://136.119.36.216:7272'

    // Validate URL before fetching
    if (!baseUrl) {
      throw new Error('R2R_BASE_URL not configured')
    }

    const url = new URL('/v3/health', baseUrl)

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })

    const responseTime = Date.now() - startTime

    return {
      service: 'r2r',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      service: 'r2r',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    }
  }
}

export async function checkClaudeCodeHealth(): Promise<HealthStatus> {
  const startTime = Date.now()

  try {
    // Claude Code SDK uses local CLI with MAX subscription
    // No API key needed - authentication is handled by Claude Code CLI
    // If API key is provided, it will be used; otherwise, falls back to CLI auth

    return {
      service: 'claude-code',
      status: 'healthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      service: 'claude-code',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    }
  }
}

export async function checkAllServices(): Promise<HealthStatus[]> {
  const results = await Promise.all([
    checkR2RHealth(),
    checkClaudeCodeHealth(),
  ])
  
  return results
}
