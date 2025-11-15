// R2R Document Management API

import { getR2RClient } from './client'

export interface DocumentMetadata {
  source?: string
  category?: string
  [key: string]: any
}

export interface CreateDocumentOptions {
  file: File
  metadata?: DocumentMetadata
  collectionIds?: string[]
  chunkingConfig?: {
    method?: 'recursive' | 'semantic' | 'fixed'
    chunkSize?: number
    chunkOverlap?: number
  }
}

export async function createDocument(options: CreateDocumentOptions) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const formData = new FormData()
  formData.append('file', options.file)
  
  if (options.metadata) {
    formData.append('metadata', JSON.stringify(options.metadata))
  }
  
  if (options.collectionIds) {
    formData.append('collection_ids', JSON.stringify(options.collectionIds))
  }
  
  if (options.chunkingConfig) {
    formData.append('chunking_config', JSON.stringify(options.chunkingConfig))
  }

  const response = await fetch(`${client['baseUrl']}/v3/documents`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': undefined, // Let browser set it for FormData
    } as any,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Create document failed: ${response.statusText}`)
  }

  return response.json()
}

export async function listDocuments(options?: {
  offset?: number
  limit?: number
  filters?: Record<string, any>
}) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  if (options?.offset) params.append('offset', options.offset.toString())
  if (options?.limit) params.append('limit', options.limit.toString())
  if (options?.filters) params.append('filters', JSON.stringify(options.filters))

  const response = await fetch(
    `${client['baseUrl']}/v3/documents?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List documents failed: ${response.statusText}`)
  }

  return response.json()
}

export async function getDocument(documentId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/documents/${documentId}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`Get document failed: ${response.statusText}`)
  }

  return response.json()
}

export async function deleteDocument(documentId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/documents/${documentId}`,
    {
      method: 'DELETE',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Delete document failed: ${response.statusText}`)
  }

  return response.json()
}

export async function extractEntities(documentId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/documents/${documentId}/extract`,
    {
      method: 'POST',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Extract entities failed: ${response.statusText}`)
  }

  return response.json()
}

export async function deduplicateEntities(documentId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/documents/${documentId}/deduplicate`,
    {
      method: 'POST',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Deduplicate entities failed: ${response.statusText}`)
  }

  return response.json()
}

export async function listDocumentEntities(
  documentId: string,
  options?: { offset?: number; limit?: number }
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  if (options?.offset) params.append('offset', options.offset.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/documents/${documentId}/entities?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List document entities failed: ${response.statusText}`)
  }

  return response.json()
}
