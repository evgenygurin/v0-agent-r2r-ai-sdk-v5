// Direct Claude Code chat endpoint

import { streamText } from 'ai'
import { getClaudeCodeModel, getClaudeCodeConfig } from '@/lib/claude-code/provider'
import { logger } from '@/lib/utils/logger'
import { R2RError } from '@/lib/utils/errors'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, preset = 'balanced' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      logger.error('Invalid messages format received')
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    logger.info('Processing chat request', { preset, messageCount: messages.length })

    const model = getClaudeCodeModel(getClaudeCodeConfig(preset).model)
    const config = getClaudeCodeConfig(preset)

    const result = streamText({
      model,
      messages,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    logger.error('Chat endpoint error', error)
    return Response.json(
      { error: error instanceof R2RError ? error.message : 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
