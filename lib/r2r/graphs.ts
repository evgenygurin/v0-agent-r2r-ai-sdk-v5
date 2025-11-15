// R2R Knowledge Graph API

import { getR2RClient } from './client'

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

export async function listEntities(options: {
  collectionId: string
  offset?: number
  limit?: number
}) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  params.append('collection_id', options.collectionId)
  if (options.offset) params.append('offset', options.offset.toString())
  if (options.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/graphs/entities?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List entities failed: ${response.statusText}`)
  }

  return response.json()
}

export async function listRelationships(options: {
  collectionId: string
  entityId?: string
  offset?: number
  limit?: number
}) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  params.append('collection_id', options.collectionId)
  if (options.entityId) params.append('entity_id', options.entityId)
  if (options.offset) params.append('offset', options.offset.toString())
  if (options.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/graphs/relationships?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List relationships failed: ${response.statusText}`)
  }

  return response.json()
}

export async function buildCommunities(
  collectionId: string,
  options?: { levels?: number[] }
) {
  const client = getR2RClient()
  const headers = await client['getHeaders']()

  const response = await fetch(
    `${client['baseUrl']}/v3/graphs/communities/build`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection_id: collectionId,
        levels: options?.levels || [0, 1, 2],
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Build communities failed: ${response.statusText}`)
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
  const headers = await client['getHeaders']()

  const params = new URLSearchParams()
  params.append('collection_id', options.collectionId)
  if (options.level !== undefined) params.append('level', options.level.toString())
  if (options.offset) params.append('offset', options.offset.toString())
  if (options.limit) params.append('limit', options.limit.toString())

  const response = await fetch(
    `${client['baseUrl']}/v3/graphs/communities?${params.toString()}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`List communities failed: ${response.statusText}`)
  }

  return response.json()
}
