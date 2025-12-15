// R2R Document Management API

import { getR2RClient } from "./client"
import { logger } from "@/lib/utils/logger"

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
    method?: "recursive" | "semantic" | "fixed"
    chunkSize?: number
    chunkOverlap?: number
  }
}

export async function createDocument(options: CreateDocumentOptions) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const formData = new FormData()
  formData.append("file", options.file)

  if (options.metadata) {
    formData.append("metadata", JSON.stringify(options.metadata))
  }

  if (options.collectionIds) {
    formData.append("collection_ids", JSON.stringify(options.collectionIds))
  }

  if (options.chunkingConfig) {
    formData.append("chunking_config", JSON.stringify(options.chunkingConfig))
  }

  const { "Content-Type": _, ...headersWithoutContentType } = headers as any

  const response = await fetch(`${client.getBaseUrl()}/v3/documents`, {
    method: "POST",
    headers: headersWithoutContentType,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Create document failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

const MOCK_DOCUMENTS = [
  {
    id: "mock-doc-1",
    title: "Getting Started Guide",
    status: "success" as const,
    created_at: new Date().toISOString(),
    metadata: { source: "demo", category: "documentation" },
  },
  {
    id: "mock-doc-2",
    title: "API Reference",
    status: "processing" as const,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    metadata: { source: "demo", category: "reference" },
  },
]

export async function listDocuments(options?: {
  offset?: number
  limit?: number
  filters?: Record<string, any>
}) {
  try {
    const client = getR2RClient()
    const headers = await client.getHeaders()

    const params = new URLSearchParams()
    if (options?.offset) params.append("offset", options.offset.toString())
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.filters) params.append("filters", JSON.stringify(options.filters))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${client.getBaseUrl()}/v3/documents?${params.toString()}`, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`List documents failed: ${response.statusText} - ${errorText}`)
    }

    return response.json()
  } catch (error) {
    logger.warn("R2R unavailable, using mock data", error as Error)
    return {
      results: MOCK_DOCUMENTS,
      total_entries: MOCK_DOCUMENTS.length,
    }
  }
}

export async function getDocument(documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const response = await fetch(`${client.getBaseUrl()}/v3/documents/${documentId}`, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Get document failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function deleteDocument(documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const response = await fetch(`${client.getBaseUrl()}/v3/documents/${documentId}`, {
    method: "DELETE",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Delete document failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function extractEntities(documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const response = await fetch(`${client.getBaseUrl()}/v3/documents/${documentId}/extract`, {
    method: "POST",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Extract entities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function deduplicateEntities(documentId: string) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const response = await fetch(`${client.getBaseUrl()}/v3/documents/${documentId}/deduplicate`, {
    method: "POST",
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Deduplicate entities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function listDocumentEntities(documentId: string, options?: { offset?: number; limit?: number }) {
  const client = getR2RClient()
  const headers = await client.getHeaders()

  const params = new URLSearchParams()
  if (options?.offset) params.append("offset", options.offset.toString())
  if (options?.limit) params.append("limit", options.limit.toString())

  const response = await fetch(`${client.getBaseUrl()}/v3/documents/${documentId}/entities?${params.toString()}`, {
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`List document entities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
