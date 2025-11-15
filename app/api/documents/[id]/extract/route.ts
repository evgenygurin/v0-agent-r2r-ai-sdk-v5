// Document extraction endpoint

import { extractEntities } from '@/lib/r2r/documents'

export const runtime = 'edge'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await extractEntities(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Extract entities error:', error)
    return Response.json(
      { error: 'Failed to extract entities' },
      { status: 500 }
    )
  }
}
