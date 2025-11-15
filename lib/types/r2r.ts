// R2R Agent Types and Configurations

export interface R2RAgentConfig {
  mode: 'rag' | 'research'
  searchMode?: 'basic' | 'advanced' | 'custom'
  ragTools?: Array<
    | 'search_file_knowledge'
    | 'get_file_content'
    | 'web_search'
    | 'web_scrape'
    | 'search_file_descriptions'
  >
  researchTools?: Array<'rag' | 'reasoning' | 'critique' | 'python_executor'>
  generationConfig?: GenerationConfig
  conversationId?: string
}

export interface GenerationConfig {
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  model?: string
}

export interface R2RSearchSettings {
  useHybridSearch?: boolean
  limit?: number
  filters?: Record<string, any>
  searchMode?: 'basic' | 'advanced' | 'custom'
}

export interface R2RMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface R2RStreamEvent {
  type: 'thinking' | 'tool_call' | 'message' | 'citation' | 'error'
  data: any
}

// Default configurations
export const DEFAULT_RAG_CONFIG: R2RAgentConfig = {
  mode: 'rag',
  searchMode: 'advanced',
  ragTools: ['search_file_knowledge', 'web_search'],
  generationConfig: {
    temperature: 0.7,
    maxTokens: 2048,
    stream: true,
  },
}

export const RESEARCH_MODE_CONFIG: R2RAgentConfig = {
  mode: 'research',
  researchTools: ['rag', 'reasoning', 'critique'],
  generationConfig: {
    temperature: 0.8,
    maxTokens: 4096,
    stream: true,
  },
}
