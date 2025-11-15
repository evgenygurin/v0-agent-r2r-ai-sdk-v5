// Middleware for Claude Code request processing

import type { ClaudeCodeConfig } from '@/lib/types/claude-code'

export interface RequestContext {
  userId?: string
  conversationId?: string
  metadata?: Record<string, any>
}

export interface RequestMetrics {
  startTime: number
  endTime?: number
  duration?: number
  tokenCount?: number
  modelUsed?: string
  success: boolean
  error?: string
}

export class ClaudeCodeMiddleware {
  private metrics: RequestMetrics[] = []

  async preProcess(
    messages: any[],
    config: ClaudeCodeConfig,
    context: RequestContext
  ) {
    const metric: RequestMetrics = {
      startTime: Date.now(),
      modelUsed: config.model,
      success: false,
    }

    console.log('[v0] Claude Code request started:', {
      model: config.model,
      messageCount: messages.length,
      conversationId: context.conversationId,
    })

    return { metric, processedMessages: messages }
  }

  async postProcess(
    response: any,
    metric: RequestMetrics,
    context: RequestContext
  ) {
    metric.endTime = Date.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = true

    this.metrics.push(metric)

    console.log('[v0] Claude Code request completed:', {
      duration: metric.duration,
      model: metric.modelUsed,
      success: metric.success,
    })

    return response
  }

  async handleError(error: Error, metric: RequestMetrics) {
    metric.endTime = Date.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = false
    metric.error = error.message

    this.metrics.push(metric)

    console.error('[v0] Claude Code request failed:', {
      duration: metric.duration,
      error: error.message,
    })

    throw error
  }

  getMetrics() {
    return this.metrics
  }

  clearMetrics() {
    this.metrics = []
  }
}

export const claudeCodeMiddleware = new ClaudeCodeMiddleware()
