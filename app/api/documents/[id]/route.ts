// Single document API endpoint

import { getDocument, deleteDocument, extractEntities, deduplicateEntities } from '@/lib/r2r/documents'

export const runtime = 'edge'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getDocument(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Get document error:', error)
    return Response.json(
      { error: 'Failed to get document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteDocument(params.id)
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Delete document error:', error)
    return Response.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
