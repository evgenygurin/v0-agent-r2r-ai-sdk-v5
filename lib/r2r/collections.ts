// R2R Collections Management API

import { getR2RClient } from "./client"
import { logger } from "@/lib/utils/logger"

export interface CreateCollectionOptions {
  name: string
  description?: string
}

const MOCK_COLLECTIONS = [
  {
    id: "mock-collection-1",
    name: "Technical Documentation",
    description: "Product docs and API references",
    created_at: new Date().toISOString(),
    document_count: 12,
  },
  {
    id: "mock-collection-2",
    name: "Research Papers",
    description: "Academic papers and research documents",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    document_count: 8,
  },
  {
    id: "mock-collection-3",
    name: "Meeting Notes",
    description: "Team meeting recordings and notes",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    document_count: 24,
  },
]

export async function createCollection(options: CreateCollectionOptions) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections`, {
    method: "POST",
    headers,
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Create collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function listCollections(options?: { offset?: number; limit?: number }) {
  try {
    const client = getR2RClient()
    const headers = await client.getHeaders()
    const baseUrl = client.getBaseUrl()

    const params = new URLSearchParams()
    if (options?.offset) params.append("offset", options.offset.toString())
    if (options?.limit) params.append("limit", options.limit.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${baseUrl}/v3/collections?${params.toString()}`, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`List collections failed: ${response.statusText} - ${errorText}`)
    }

    return response.json()
  } catch (error) {
    logger.warn("R2R unavailable for collections, using mock data", error as Error)
    return {
      results: MOCK_COLLECTIONS,
      total_entries: MOCK_COLLECTIONS.length,
    }
  }
}

export async function getCollection(collectionId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}`, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Get collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function updateCollection(collectionId: string, updates: Partial<CreateCollectionOptions>) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}`, {
    method: "POST",
    headers,
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Update collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function deleteCollection(collectionId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}`, {
    method: "DELETE",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Delete collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function addDocumentToCollection(collectionId: string, documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}/documents/${documentId}`, {
    method: "POST",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Add document to collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function removeDocumentFromCollection(collectionId: string, documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}/documents/${documentId}`, {
    method: "DELETE",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Remove document from collection failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function listCollectionDocuments(collectionId: string, options?: { offset?: number; limit?: number }) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const params = new URLSearchParams()
  if (options?.offset) params.append("offset", options.offset.toString())
  if (options?.limit) params.append("limit", options.limit.toString())

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}/documents?${params.toString()}`, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`List collection documents failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function extractCollectionEntities(collectionId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/collections/${collectionId}/extract`, {
    method: "POST",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Extract collection entities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
