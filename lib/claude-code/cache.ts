// Caching layer for Claude Code responses (optional)

interface CacheEntry {
  response: any
  timestamp: number
  expiresAt: number
}

export class ClaudeCodeCache {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 3600000 // 1 hour in milliseconds

  generateKey(messages: any[], config: any): string {
    return JSON.stringify({ messages, config })
  }

  set(key: string, value: any, ttl: number = this.defaultTTL) {
    const now = Date.now()
    this.cache.set(key, {
      response: value,
      timestamp: now,
      expiresAt: now + ttl,
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.response
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  clear() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

export const claudeCodeCache = new ClaudeCodeCache()

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    claudeCodeCache.cleanup()
  }, 300000)
}
