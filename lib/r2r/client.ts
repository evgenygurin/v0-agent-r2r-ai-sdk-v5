// R2R Client wrapper with authentication and error handling

import { r2rConfig } from '../config/r2r-config'
import type { R2RAgentConfig, R2RSearchSettings, R2RMessage } from '../types/r2r'

export class R2RClient {
  private baseUrl: string
  private apiKey?: string
  private accessToken?: string

  constructor() {
    this.baseUrl = r2rConfig.baseUrl
    this.apiKey = r2rConfig.apiKey
    // Authenticate if no API key is provided
    if (!this.apiKey) {
      this.authenticate()
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  async authenticate(email?: string, password?: string): Promise<void> {
    const authEmail = email || r2rConfig.adminEmail
    const authPassword = password || r2rConfig.adminPassword

    if (!authEmail || !authPassword) {
      console.log('[v0] No authentication credentials provided, using default admin')
      return
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.results.access_token

      console.log('[v0] R2R authentication successful')
    } catch (error) {
      console.error('[v0] R2R authentication error:', error)
      throw error
    }
  }

  async refreshToken(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No access token available to refresh')
    }

    try {
      const response = await fetch(`${this.baseUrl}/v3/users/refresh_access_token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.results.access_token

      console.log('[v0] R2R token refreshed successfully')
    } catch (error) {
      console.error('[v0] R2R token refresh error:', error)
      throw error
    }
  }

  async search(query: string, settings?: R2RSearchSettings) {
    const headers = await this.getHeaders()

    const response = await fetch(`${this.baseUrl}/v3/retrieval/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        search_settings: {
          use_hybrid_search: settings?.useHybridSearch ?? true,
          limit: settings?.limit ?? 10,
          filters: settings?.filters,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    return response.json()
  }

  async agent(
    message: string,
    config: R2RAgentConfig & { conversationId?: string }
  ) {
    const headers = await this.getHeaders()

    const body: any = {
      message: { content: message },
      mode: config.mode,
    }

    if (config.conversationId) {
      body.conversation_id = config.conversationId
    }

    if (config.mode === 'rag' && config.ragTools) {
      body.rag_tools = config.ragTools
    }

    if (config.mode === 'research' && config.researchTools) {
      body.research_tools = config.researchTools
    }

    if (config.generationConfig) {
      body.rag_generation_config = {
        temperature: config.generationConfig.temperature,
        max_tokens: config.generationConfig.maxTokens,
        top_p: config.generationConfig.topP,
        stream: config.generationConfig.stream ?? true,
      }
    }

    const response = await fetch(`${this.baseUrl}/v3/retrieval/agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Agent request failed: ${response.statusText}`)
    }

    return response
  }

  async createConversation() {
    const headers = await this.getHeaders()

    const response = await fetch(`${this.baseUrl}/v3/conversations`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Create conversation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getConversation(conversationId: string) {
    const headers = await this.getHeaders()

    const response = await fetch(
      `${this.baseUrl}/v3/conversations/${conversationId}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`Get conversation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteConversation(conversationId: string) {
    const headers = await this.getHeaders()

    const response = await fetch(
      `${this.baseUrl}/v3/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Delete conversation failed: ${response.statusText}`)
    }

    return response.json()
  }
}

// Singleton instance
let r2rClientInstance: R2RClient | null = null

export function getR2RClient(): R2RClient {
  if (!r2rClientInstance) {
    r2rClientInstance = new R2RClient()
  }
  return r2rClientInstance
}
