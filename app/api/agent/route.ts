// Unified agent endpoint with R2R integration

import { getR2RClient } from '@/lib/r2r/client'
import { retryableR2RRequest } from '@/lib/r2r/retry'
import { ragPresets } from '@/lib/config/r2r-config'
import type { R2RAgentConfig } from '@/lib/types/r2r'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const {
      messages,
      conversationId,
      useR2R = false,
      r2rConfig,
      preset,
    } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1].content

    // Use preset if provided
    let finalR2RConfig: R2RAgentConfig | undefined = r2rConfig
    if (preset && ragPresets[preset]) {
      finalR2RConfig = ragPresets[preset]
    }

    // Use R2R Agent
    if (useR2R) {
      const r2r = getR2RClient()

      const config: R2RAgentConfig = finalR2RConfig || {
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

      // Return R2R stream
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Simple mock response for now (Claude Code integration would require API key)
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const response = `This is a response from the Claude Code agent. You asked: "${lastMessage}"\n\nThe system is configured with preset: ${preset}`
        
        // Stream the response word by word
        const words = response.split(' ')
        for (const word of words) {
          controller.enqueue(encoder.encode(`0:"${word} "\n`))
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[v0] Agent endpoint error:', error)
    return Response.json(
      { error: 'Failed to process agent request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
