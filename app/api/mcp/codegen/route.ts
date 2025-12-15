// Codegen MCP API endpoint

import { codegen } from '@/lib/mcp/codegen'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'
export const maxDuration = 300 // 5 minutes for parsing large codebases

export async function POST(req: Request) {
  try {
    const { action, path, jobId, script, files } = await req.json()

    logger.info('Codegen API request', { action })

    switch (action) {
      case 'parse':
        if (!path) {
          return Response.json(
            { error: 'path is required' },
            { status: 400 }
          )
        }
        const parseResult = await codegen.parseCodebase(path)
        return Response.json({ result: parseResult })

      case 'status':
        if (!jobId) {
          return Response.json(
            { error: 'jobId is required' },
            { status: 400 }
          )
        }
        const statusResult = await codegen.checkParseStatus(jobId)
        return Response.json({ result: statusResult })

      case 'codemod':
        if (!script || !files) {
          return Response.json(
            { error: 'script and files are required' },
            { status: 400 }
          )
        }
        const codemodResult = await codegen.executeCodemod(script, files)
        return Response.json({ result: codemodResult })

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Codegen API error', error)
    return Response.json(
      { error: 'Failed to process Codegen request' },
      { status: 500 }
    )
  }
}
