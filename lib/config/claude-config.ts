import { type ClaudeCodeConfig } from '@/lib/types/claude-code'

// Claude Code SDK Configuration
// NOTE: API key is OPTIONAL when using Claude MAX subscription
// The SDK automatically uses Claude Code CLI authentication
// Only set ANTHROPIC_API_KEY if you want to use direct API access instead
export const claudeConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
}

export const claudePresets: Record<string, ClaudeCodeConfig> = {
  fast: {
    model: 'claude-haiku-4-5-20251001',
    temperature: 0.5,
    maxTokens: 2048,
    thinkingEnabled: false,
  },
  balanced: {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 4096,
    thinkingEnabled: true,
  },
  powerful: {
    model: 'claude-opus-4-1-20250805',
    temperature: 0.8,
    maxTokens: 8192,
    thinkingEnabled: true,
    extendedContext: true,
    betas: ['context-1m-2025-08-07'],
  },
}
