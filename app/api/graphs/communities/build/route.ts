// Build communities endpoint

import { buildCommunities } from '@/lib/r2r/graphs'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { collectionId, levels } = await req.json()
    
    if (!collectionId) {
      return Response.json(
        { error: 'collectionId is required' },
        { status: 400 }
      )
    }

    const result = await buildCommunities(collectionId, { levels })
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Build communities error:', error)
    return Response.json(
      { error: 'Failed to build communities' },
      { status: 500 }
    )
  }
}
