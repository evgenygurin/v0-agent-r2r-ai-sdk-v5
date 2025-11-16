import { type R2RAgentConfig } from '../types/r2r'

export const r2rConfig = {
  baseUrl: process.env.R2R_BASE_URL || 'http://136.119.36.216:7272',
  apiKey: process.env.R2R_API_KEY,
  adminEmail: process.env.R2R_ADMIN_EMAIL,
  adminPassword: process.env.R2R_ADMIN_PASSWORD,
  dashboardUrl: 'http://136.119.36.216:7273',
  hatchetUrl: process.env.HATCHET_URL || 'http://136.119.36.216:7274',
}

export const ragPresets: Record<string, R2RAgentConfig> = {
  basic: {
    mode: 'rag',
    searchMode: 'basic',
    ragTools: ['search_file_knowledge'],
    generationConfig: {
      temperature: 0.5,
      maxTokens: 1024,
      stream: true,
    },
  },
  advanced: {
    mode: 'rag',
    searchMode: 'advanced',
    ragTools: ['search_file_knowledge', 'web_search', 'get_file_content'],
    generationConfig: {
      temperature: 0.7,
      maxTokens: 2048,
      stream: true,
    },
  },
  research: {
    mode: 'research',
    researchTools: ['rag', 'reasoning', 'critique'],
    generationConfig: {
      temperature: 0.8,
      maxTokens: 4096,
      stream: true,
    },
  },
  deepReasoning: {
    mode: 'research',
    researchTools: ['reasoning', 'rag', 'critique', 'python_executor'],
    generationConfig: {
      temperature: 0.9,
      maxTokens: 8192,
      stream: true,
    },
  },
}
