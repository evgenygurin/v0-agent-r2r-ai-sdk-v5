// Single collection API endpoint

import { getCollection, updateCollection, deleteCollection } from '@/lib/r2r/collections'

export const runtime = 'edge'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getCollection(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Get collection error:', error)
    return Response.json(
      { error: 'Failed to get collection' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json()
    const result = await updateCollection(params.id, updates)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Update collection error:', error)
    return Response.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteCollection(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Delete collection error:', error)
    return Response.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
