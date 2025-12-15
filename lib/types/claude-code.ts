// Claude Code SDK Types

export type ClaudeCodeModel = 'haiku' | 'sonnet' | 'opus'

export interface ClaudeCodeConfig {
  model: ClaudeCodeModel
  temperature?: number
  maxTokens?: number
  topP?: number
  thinkingEnabled?: boolean
  extendedContext?: boolean
}

export const CLAUDE_CODE_MODELS = {
  haiku: 'haiku', // Fast, cost-effective
  sonnet: 'sonnet', // Balanced performance
  opus: 'opus', // Maximum capability
} as const

export const DEFAULT_CLAUDE_CONFIG: ClaudeCodeConfig = {
  model: 'sonnet',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  thinkingEnabled: true,
  extendedContext: true,
}
