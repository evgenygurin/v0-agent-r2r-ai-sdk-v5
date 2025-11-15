// Collections API endpoint

import { createCollection, listCollections } from '@/lib/r2r/collections'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await listCollections({ offset, limit })
    return Response.json(result)
  } catch (error) {
    console.error('[v0] List collections error:', error)
    return Response.json(
      { error: 'Failed to list collections' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await createCollection(body)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Create collection error:', error)
    return Response.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
