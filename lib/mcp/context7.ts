// Context7 MCP Server integration for up-to-date documentation

import { MCPClient } from './client'
import { logger } from '@/lib/utils/logger'

export class Context7Client extends MCPClient {
  constructor() {
    super({
      name: 'context7',
      url: process.env.CONTEXT7_MCP_URL || 'https://mcp.context7.com/mcp',
      transport: 'http',
    })
  }

  async resolveLibraryId(libraryName: string): Promise<string> {
    logger.info('Resolving library ID', { libraryName })
    
    const result = await this.callTool('resolve-library-id', {
      libraryName,
    })

    return result.libraryId
  }

  async getLibraryDocs(libraryId: string, query?: string): Promise<any> {
    logger.info('Fetching library docs', { libraryId, query })
    
    const result = await this.callTool('get-library-docs', {
      libraryId,
      query,
    })

    return result
  }

  async searchDocs(libraryName: string, query: string): Promise<any> {
    logger.info('Searching documentation', { libraryName, query })
    
    // First resolve the library ID
    const libraryId = await this.resolveLibraryId(libraryName)
    
    // Then get the docs
    return await this.getLibraryDocs(libraryId, query)
  }
}

// Export singleton instance
export const context7 = new Context7Client()
