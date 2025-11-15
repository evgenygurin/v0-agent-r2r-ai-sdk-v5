// R2R conversation management endpoint

import { getR2RClient } from '@/lib/r2r/client'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { action, conversationId } = await req.json()

    if (!action) {
      return Response.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    const r2r = getR2RClient()

    let result

    switch (action) {
      case 'create':
        result = await r2r.createConversation()
        break
      case 'get':
        if (!conversationId) {
          return Response.json(
            { error: 'conversationId is required for get action' },
            { status: 400 }
          )
        }
        result = await r2r.getConversation(conversationId)
        break
      case 'delete':
        if (!conversationId) {
          return Response.json(
            { error: 'conversationId is required for delete action' },
            { status: 400 }
          )
        }
        result = await r2r.deleteConversation(conversationId)
        break
      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return Response.json(result)
  } catch (error) {
    console.error('[v0] R2R conversation error:', error)
    return Response.json(
      { error: 'Conversation operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
