// Unified agent endpoint with Claude Code SDK + R2R integration

import { streamText } from 'ai'
import { getClaudeCodeModel, getClaudeCodeConfig } from '@/lib/claude-code/provider'
import { claudeCodeTools } from '@/lib/claude-code/tools'
import { hybridAgent } from '@/lib/claude-code/hybrid'
import { getR2RClient } from '@/lib/r2r/client'
import { retryableR2RRequest } from '@/lib/r2r/retry'
import { ragPresets } from '@/lib/config/r2r-config'
import { logger } from '@/lib/utils/logger'
import { R2RError, ClaudeCodeError } from '@/lib/utils/errors'
import type { R2RAgentConfig } from '@/lib/types/r2r'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const {
      messages,
      conversationId,
      useR2R = false,
      useHybrid = false,
      r2rConfig,
      preset = 'balanced',
      enableTools = true,
    } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      logger.error('Invalid messages format received')
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1].content

    logger.info('Processing agent request', {
      useR2R,
      useHybrid,
      preset,
      messageCount: messages.length,
      conversationId,
    })

    // Strategy 1: Hybrid Mode (intelligent routing)
    if (useHybrid) {
      logger.info('Using hybrid mode for intelligent routing')
      
      const result = await hybridAgent({
        messages,
        claudeModel: getClaudeCodeConfig(preset).model,
        r2rConfig: r2rConfig || ragPresets[preset === 'research' ? 'research' : 'advanced'],
        conversationId,
        enableR2RTools: enableTools,
      })

      // If result is a Response (from R2R), return it directly
      if (result instanceof Response) {
        return result
      }

      // Otherwise it's a streamText result
      return result.toUIMessageStreamResponse()
    }

    // Strategy 2: R2R Agent Only
    if (useR2R) {
      logger.info('Using R2R agent', { preset })
      
      const r2r = getR2RClient()

      const config: R2RAgentConfig = r2rConfig || ragPresets[preset] || {
        mode: 'rag',
        searchMode: 'advanced',
        ragTools: ['search_file_knowledge', 'web_search'],
        generationConfig: {
          stream: true,
        },
      }

      if (conversationId) {
        config.conversationId = conversationId
      }

      const response = await retryableR2RRequest(() =>
        r2r.agent(lastMessage, config)
      )

      logger.info('R2R agent response received')

      // Return R2R stream
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Strategy 3: Claude Code SDK Only
    logger.info('Using Claude Code SDK', { preset, enableTools })
    
    const model = getClaudeCodeModel(getClaudeCodeConfig(preset).model)
    const config = getClaudeCodeConfig(preset)

    const result = streamText({
      model,
      messages,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      tools: enableTools ? claudeCodeTools : undefined,
    })

    logger.info('Claude Code SDK response initiated')

    return result.toUIMessageStreamResponse()
  } catch (error) {
    logger.error('Agent endpoint error', error)
    
    if (error instanceof R2RError) {
      return Response.json(
        { error: 'R2R request failed', details: error.message },
        { status: 500 }
      )
    }
    
    if (error instanceof ClaudeCodeError) {
      return Response.json(
        { error: 'Claude Code request failed', details: error.message },
        { status: 500 }
      )
    }

    return Response.json(
      { error: 'Failed to process agent request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
