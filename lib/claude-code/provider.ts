// Claude Code SDK provider setup for AI SDK v5

import { claudeCode } from 'ai-sdk-provider-claude-code'
import type { ClaudeCodeModel, ClaudeCodeConfig } from '@/lib/types/claude-code'
import { claudePresets } from '@/lib/config/claude-config'

export function getClaudeCodeModel(model: ClaudeCodeModel = 'sonnet') {
  return claudeCode(model)
}

export function getClaudeCodeConfig(preset: keyof typeof claudePresets = 'balanced'): ClaudeCodeConfig {
  return claudePresets[preset]
}

export const claudeCodeModels = {
  haiku: claudeCode('haiku'),
  sonnet: claudeCode('sonnet'),
  opus: claudeCode('opus'),
}
