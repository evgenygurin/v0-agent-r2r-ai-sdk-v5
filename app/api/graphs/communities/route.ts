// Graph communities API endpoint

import { listCommunities } from '@/lib/r2r/graphs'

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

    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await listCommunities({
      collectionId,
      level,
      offset,
      limit,
    })

    return Response.json(result)
  } catch (error) {
    console.error('[v0] List communities error:', error)
    return Response.json(
      { error: 'Failed to list communities' },
      { status: 500 }
    )
  }
}
