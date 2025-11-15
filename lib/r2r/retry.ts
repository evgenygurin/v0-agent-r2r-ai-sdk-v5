// Retry logic with exponential backoff for R2R requests

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: Error) => void
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries - 1) {
        break
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      
      console.log(
        `[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
      )

      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export async function retryableR2RRequest<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => {
      console.error(`[v0] R2R request failed (attempt ${attempt}):`, error.message)
    },
    ...options,
  })
}
