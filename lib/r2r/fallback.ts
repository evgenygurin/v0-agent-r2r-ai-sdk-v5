// Fallback mechanism when R2R is unavailable

import { getR2RClient } from './client'

export interface FallbackConfig {
  enableFallback: boolean
  fallbackProvider?: 'claude-code' | 'none'
  onFallback?: (error: Error) => void
}

export async function executeWithFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>,
  config: FallbackConfig = { enableFallback: true }
): Promise<T> {
  try {
    return await primaryFn()
  } catch (error) {
    console.error('[v0] Primary provider (R2R) failed:', error)

    if (!config.enableFallback || !fallbackFn) {
      throw error
    }

    console.log('[v0] Falling back to alternative provider')
    
    if (config.onFallback) {
      config.onFallback(error as Error)
    }

    try {
      return await fallbackFn()
    } catch (fallbackError) {
      console.error('[v0] Fallback provider also failed:', fallbackError)
      throw new Error(
        `Both primary and fallback providers failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }
}

export async function checkR2RAvailability(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.R2R_BASE_URL}/v3/health`,
      {
        signal: AbortSignal.timeout(5000),
      }
    )
    return response.ok
  } catch (error) {
    console.error('[v0] R2R availability check failed:', error)
    return false
  }
}
