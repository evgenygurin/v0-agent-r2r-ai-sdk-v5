// R2R Knowledge Graph API

import { getR2RClient } from "./client"
import { logger } from "@/lib/utils/logger"

export interface Entity {
  id: string
  name: string
  category: string
  description: string
  embedding?: number[]
  documentId: string
  metadata?: Record<string, any>
}

export interface Relationship {
  id: string
  subject: string
  predicate: string
  object: string
  description?: string
  strength?: number
  documentId: string
}

export interface Community {
  id: string
  level: number
  name: string
  summary: string
  entities: string[]
  size: number
}

const MOCK_ENTITIES = [
  {
    id: "entity-1",
    name: "Next.js",
    category: "Framework",
    description: "React framework for production",
    documentId: "mock-doc-1",
  },
  {
    id: "entity-2",
    name: "R2R",
    category: "System",
    description: "RAG system with agentic capabilities",
    documentId: "mock-doc-1",
  },
  {
    id: "entity-3",
    name: "Vercel",
    category: "Platform",
    description: "Deployment and hosting platform",
    documentId: "mock-doc-2",
  },
]

const MOCK_RELATIONSHIPS = [
  {
    id: "rel-1",
    subject: "Next.js",
    predicate: "deployed_on",
    object: "Vercel",
    strength: 0.9,
    documentId: "mock-doc-1",
  },
  {
    id: "rel-2",
    subject: "R2R",
    predicate: "integrates_with",
    object: "Next.js",
    strength: 0.85,
    documentId: "mock-doc-2",
  },
]

export async function listEntities(options: { collectionId: string; offset?: number; limit?: number }) {
  try {
    const client = getR2RClient()
    const headers = await client.getHeaders()
    const baseUrl = client.getBaseUrl()

    const params = new URLSearchParams()
    params.append("collection_id", options.collectionId)
    if (options.offset) params.append("offset", options.offset.toString())
    if (options.limit) params.append("limit", options.limit.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${baseUrl}/v3/graphs/entities?${params.toString()}`, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`List entities failed: ${response.statusText} - ${errorText}`)
    }

    return response.json()
  } catch (error) {
    logger.warn("R2R unavailable for entities, using mock data", error as Error)
    return {
      results: MOCK_ENTITIES,
      total_entries: MOCK_ENTITIES.length,
    }
  }
}

export async function listRelationships(options: {
  collectionId: string
  entityId?: string
  offset?: number
  limit?: number
}) {
  try {
    const client = getR2RClient()
    const headers = await client.getHeaders()
    const baseUrl = client.getBaseUrl()

    const params = new URLSearchParams()
    params.append("collection_id", options.collectionId)
    if (options.entityId) params.append("entity_id", options.entityId)
    if (options.offset) params.append("offset", options.offset.toString())
    if (options.limit) params.append("limit", options.limit.toString())

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${baseUrl}/v3/graphs/relationships?${params.toString()}`, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`List relationships failed: ${response.statusText} - ${errorText}`)
    }

    return response.json()
  } catch (error) {
    logger.warn("R2R unavailable for relationships, using mock data", error as Error)
    return {
      results: MOCK_RELATIONSHIPS,
      total_entries: MOCK_RELATIONSHIPS.length,
    }
  }
}

export async function buildCommunities(collectionId: string, options?: { levels?: number[] }) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const response = await fetch(`${baseUrl}/v3/graphs/communities/build`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      collection_id: collectionId,
      levels: options?.levels || [0, 1, 2],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Build communities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function listCommunities(options: {
  collectionId: string
  level?: number
  offset?: number
  limit?: number
}) {
  const client = getR2RClient()
  const headers = await client.getHeaders()
  const baseUrl = client.getBaseUrl()

  const params = new URLSearchParams()
  params.append("collection_id", options.collectionId)
  if (options.level !== undefined) params.append("level", options.level.toString())
  if (options.offset) params.append("offset", options.offset.toString())
  if (options.limit) params.append("limit", options.limit.toString())

  const response = await fetch(`${baseUrl}/v3/graphs/communities?${params.toString()}`, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`List communities failed: ${response.statusText} - ${errorText}`)
  }

  return response.json()
}
