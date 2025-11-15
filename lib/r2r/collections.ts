// R2R Collections Management API

import { getR2RClient } from './client'

export interface CreateCollectionOptions {
  name: string
  description?: string
}

export async function createCollection(options: CreateCollectionOptions) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(`${client['baseUrl']}/v3/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    throw new Error(`Create collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function listCollections(options?: {
  offset?: number
  limit?: number
}) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  if (options?.offset) params.append('offset', options.offset.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/collections?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List collections failed: ${response.statusText}`)
  }

  return response.json()
}

export async function getCollection(collectionId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`Get collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function updateCollection(
  collectionId: string,
  updates: Partial<CreateCollectionOptions>
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(updates),
    }
  )

  if (!response.ok) {
    throw new Error(`Update collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function deleteCollection(collectionId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}`,
    {
      method: 'DELETE',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Delete collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function addDocumentToCollection(
  collectionId: string,
  documentId: string
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}/documents/${documentId}`,
    {
      method: 'POST',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Add document to collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function removeDocumentFromCollection(
  collectionId: string,
  documentId: string
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}/documents/${documentId}`,
    {
      method: 'DELETE',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Remove document from collection failed: ${response.statusText}`)
  }

  return response.json()
}

export async function listCollectionDocuments(
  collectionId: string,
  options?: { offset?: number; limit?: number }
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  if (options?.offset) params.append('offset', options.offset.toString())
  if (options?.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}/documents?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List collection documents failed: ${response.statusText}`)
  }

  return response.json()
}

export async function extractCollectionEntities(collectionId: string) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/collections/${collectionId}/extract`,
    {
      method: 'POST',
      headers,
    }
  )

  if (!response.ok) {
    throw new Error(`Extract collection entities failed: ${response.statusText}`)
  }

  return response.json()
}
