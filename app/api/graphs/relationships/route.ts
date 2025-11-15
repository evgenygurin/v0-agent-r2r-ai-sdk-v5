// Graph relationships API endpoint

import { listRelationships } from '@/lib/r2r/graphs'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const collectionId = searchParams.get('collectionId')
    
    if (!collectionId) {
      return Response.json(
        { error: 'collectionId is required' },
        { status: 400 }
      )
    }

    const entityId = searchParams.get('entityId') || undefined
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '100')

    const result = await listRelationships({
      collectionId,
      entityId,
      offset,
      limit,
    })

    return Response.json(result)
  } catch (error) {
    console.error('[v0] List relationships error:', error)
    return Response.json(
      { error: 'Failed to list relationships' },
      { status: 500 }
    )
  }
}
