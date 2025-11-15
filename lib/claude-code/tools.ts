// Claude Code tools for integration with R2R

import { tool } from 'ai'
import { z } from 'zod'
import { getR2RClient } from '@/lib/r2r/client'
import { retryableR2RRequest } from '@/lib/r2r/retry'

export const r2rSearchTool = tool({
  description: 'Search through ingested documents and knowledge base using R2R',
  parameters: z.object({
    query: z.string().describe('The search query'),
    limit: z.number().optional().describe('Maximum number of results (default: 10)'),
    useHybridSearch: z.boolean().optional().describe('Enable hybrid search (default: true)'),
  }),
  execute: async ({ query, limit = 10, useHybridSearch = true }) => {
    const r2r = getR2RClient()
    
    const results = await retryableR2RRequest(() =>
      r2r.search(query, {
        limit,
        useHybridSearch,
      })
    )

    return results
  },
})

export const r2rReasoningTool = tool({
  description: 'Use dedicated reasoning model for complex analytical tasks via R2R research mode',
  parameters: z.object({
    query: z.string().describe('The complex query requiring deep reasoning'),
    conversationId: z.string().optional().describe('Conversation ID for context'),
  }),
  execute: async ({ query, conversationId }) => {
    const r2r = getR2RClient()

    const response = await retryableR2RRequest(() =>
      r2r.agent(query, {
        mode: 'research',
        researchTools: ['reasoning', 'rag', 'critique'],
        conversationId,
      })
    )

    // Parse the streamed response
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let result = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += decoder.decode(value)
    }

    return result
  },
})

export const r2rConversationTool = tool({
  description: 'Create or retrieve a conversation in R2R for maintaining context',
  parameters: z.object({
    action: z.enum(['create', 'get', 'delete']).describe('Action to perform'),
    conversationId: z.string().optional().describe('Conversation ID (required for get/delete)'),
  }),
  execute: async ({ action, conversationId }) => {
    const r2r = getR2RClient()

    switch (action) {
      case 'create':
        return await r2r.createConversation()
      case 'get':
        if (!conversationId) throw new Error('conversationId required for get action')
        return await r2r.getConversation(conversationId)
      case 'delete':
        if (!conversationId) throw new Error('conversationId required for delete action')
        return await r2r.deleteConversation(conversationId)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  },
})

export const claudeCodeTools = {
  r2rSearch: r2rSearchTool,
  r2rReasoning: r2rReasoningTool,
  r2rConversation: r2rConversationTool,
}
