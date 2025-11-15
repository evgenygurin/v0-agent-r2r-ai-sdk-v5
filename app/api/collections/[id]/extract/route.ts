// Collection extraction endpoint

import { extractCollectionEntities } from '@/lib/r2r/collections'

export const runtime = 'edge'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await extractCollectionEntities(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Extract collection entities error:', error)
    return Response.json(
      { error: 'Failed to extract collection entities' },
      { status: 500 }
    )
  }
}
