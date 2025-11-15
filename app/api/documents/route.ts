// Documents API endpoint

import { createDocument, listDocuments } from '@/lib/r2r/documents'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await listDocuments({ offset, limit })
    return Response.json(result)
  } catch (error) {
    console.error('[v0] List documents error:', error)
    return Response.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const metadataStr = formData.get('metadata') as string
    const collectionIdsStr = formData.get('collectionIds') as string

    if (!file) {
      return Response.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : undefined
    const collectionIds = collectionIdsStr ? JSON.parse(collectionIdsStr) : undefined

    const result = await createDocument({
      file,
      metadata,
      collectionIds,
    })

    return Response.json(result)
  } catch (error) {
    console.error('[v0] Create document error:', error)
    return Response.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
