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
    model: 'haiku',
    temperature: 0.5,
    maxTokens: 2048,
    thinkingEnabled: false,
  },
  balanced: {
    model: 'sonnet',
    temperature: 0.7,
    maxTokens: 4096,
    thinkingEnabled: true,
  },
  powerful: {
    model: 'opus',
    temperature: 0.8,
    maxTokens: 8192,
    thinkingEnabled: true,
    extendedContext: true,
  },
}
