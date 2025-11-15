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
    const response = await fetch(
      `${process.env.R2R_BASE_URL}/v3/health`,
      { 
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      }
    )
    
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
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    
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
