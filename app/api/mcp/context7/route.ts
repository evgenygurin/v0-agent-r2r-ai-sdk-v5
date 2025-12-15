// Context7 MCP API endpoint

import { context7 } from '@/lib/mcp/context7'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { action, libraryName, query } = await req.json()

    logger.info('Context7 API request', { action, libraryName })

    switch (action) {
      case 'search':
        if (!libraryName || !query) {
          return Response.json(
            { error: 'libraryName and query are required' },
            { status: 400 }
          )
        }
        const result = await context7.searchDocs(libraryName, query)
        return Response.json({ result })

      case 'resolve':
        if (!libraryName) {
          return Response.json(
            { error: 'libraryName is required' },
            { status: 400 }
          )
        }
        const libraryId = await context7.resolveLibraryId(libraryName)
        return Response.json({ libraryId })

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Context7 API error', error)
    return Response.json(
      { error: 'Failed to process Context7 request' },
      { status: 500 }
    )
  }
}
