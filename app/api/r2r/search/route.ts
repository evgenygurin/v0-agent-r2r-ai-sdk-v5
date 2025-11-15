// R2R search endpoint

import { getR2RClient } from '@/lib/r2r/client'
import { retryableR2RRequest } from '@/lib/r2r/retry'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { query, limit = 10, useHybridSearch = true, filters } = await req.json()

    if (!query) {
      return Response.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const r2r = getR2RClient()

    const results = await retryableR2RRequest(() =>
      r2r.search(query, {
        limit,
        useHybridSearch,
        filters,
      })
    )

    return Response.json(results)
  } catch (error) {
    console.error('[v0] R2R search error:', error)
    return Response.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
