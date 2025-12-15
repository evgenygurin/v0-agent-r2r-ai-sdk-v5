// Codegen MCP Server integration for codebase parsing

import { MCPClient } from './client'
import { logger } from '@/lib/utils/logger'

export class CodegenClient extends MCPClient {
  constructor() {
    super({
      name: 'codegen',
      url: process.env.CODEGEN_MCP_URL || 'http://localhost:3001/api/mcp',
      transport: 'http',
    })
  }

  async parseCodebase(path: string): Promise<any> {
    logger.info('Parsing codebase', { path })
    
    const result = await this.callTool('parse_codebase', {
      path,
    })

    return result
  }

  async checkParseStatus(jobId: string): Promise<any> {
    logger.info('Checking parse status', { jobId })
    
    const result = await this.callTool('check_parse_status', {
      job_id: jobId,
    })

    return result
  }

  async executeCodemod(script: string, files: string[]): Promise<any> {
    logger.info('Executing codemod', { files: files.length })
    
    const result = await this.callTool('execute_codemod', {
      script,
      files,
    })

    return result
  }
}

// Export singleton instance
export const codegen = new CodegenClient()
