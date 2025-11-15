// Hybrid mode: Use both Claude Code and R2R intelligently

import { streamText } from 'ai'
import { getClaudeCodeModel } from './provider'
import { getR2RClient } from '@/lib/r2r/client'
import { claudeCodeTools } from './tools'
import type { ClaudeCodeModel } from '@/lib/types/claude-code'
import type { R2RAgentConfig } from '@/lib/types/r2r'

export interface HybridOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  claudeModel?: ClaudeCodeModel
  r2rConfig?: R2RAgentConfig
  conversationId?: string
  enableR2RTools?: boolean
}

export async function hybridAgent(options: HybridOptions) {
  const {
    messages,
    claudeModel = 'sonnet',
    r2rConfig,
    conversationId,
    enableR2RTools = true,
  } = options

  // Determine if we should use R2R based on query complexity
  const lastMessage = messages[messages.length - 1].content
  const needsRAG = detectRAGIntent(lastMessage)
  const needsReasoning = detectReasoningIntent(lastMessage)

  // Strategy 1: Use R2R Agent for document search or complex reasoning
  if (needsRAG || needsReasoning) {
    const r2r = getR2RClient()
    
    const mode = needsReasoning ? 'research' : 'rag'
    const config: R2RAgentConfig = r2rConfig || {
      mode,
      ragTools: needsRAG ? ['search_file_knowledge', 'web_search'] : undefined,
      researchTools: needsReasoning ? ['reasoning', 'rag', 'critique'] : undefined,
      conversationId,
    }

    return await r2r.agent(lastMessage, config)
  }

  // Strategy 2: Use Claude Code with R2R tools available
  const model = getClaudeCodeModel(claudeModel)
  
  return streamText({
    model,
    messages,
    tools: enableR2RTools ? claudeCodeTools : undefined,
    temperature: 0.7,
    maxTokens: 4096,
  })
}

function detectRAGIntent(query: string): boolean {
  const ragKeywords = [
    'search',
    'find',
    'document',
    'file',
    'knowledge',
    'lookup',
    'retrieve',
    'what does',
    'show me',
    'get information',
  ]

  const lowerQuery = query.toLowerCase()
  return ragKeywords.some((keyword) => lowerQuery.includes(keyword))
}

function detectReasoningIntent(query: string): boolean {
  const reasoningKeywords = [
    'analyze',
    'reason',
    'think',
    'complex',
    'solve',
    'calculate',
    'explain why',
    'how does',
    'compare',
    'evaluate',
  ]

  const lowerQuery = query.toLowerCase()
  return reasoningKeywords.some((keyword) => lowerQuery.includes(keyword))
}
