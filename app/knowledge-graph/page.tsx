// Knowledge Graph Visualization Page

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Network, Users } from 'lucide-react'
import { listCollections } from '@/lib/r2r/collections'
import { listEntities, listRelationships, buildCommunities, listCommunities } from '@/lib/r2r/graphs'

export default function KnowledgeGraphPage() {
  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [entities, setEntities] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    if (selectedCollection) {
      loadGraphData()
    }
  }, [selectedCollection])

  const loadCollections = async () => {
    try {
      const result = await listCollections()
      setCollections(result.results || [])
    } catch (error) {
      console.error('[v0] Failed to load collections:', error)
    }
  }

  const loadGraphData = async () => {
    if (!selectedCollection) return

    setIsLoading(true)
    try {
      const [entitiesResult, relationshipsResult, communitiesResult] = await Promise.all([
        listEntities({ collectionId: selectedCollection, limit: 100 }),
        listRelationships({ collectionId: selectedCollection, limit: 100 }),
        listCommunities({ collectionId: selectedCollection, level: 0, limit: 50 }),
      ])

      setEntities(entitiesResult.results || [])
      setRelationships(relationshipsResult.results || [])
      setCommunities(communitiesResult.results || [])
    } catch (error) {
      console.error('[v0] Failed to load graph data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuildCommunities = async () => {
    if (!selectedCollection) return

    try {
      await buildCommunities(selectedCollection)
      alert('Community building started. Check Hatchet dashboard for progress.')
      setTimeout(() => loadGraphData(), 5000)
    } catch (error) {
      console.error('[v0] Failed to build communities:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Graph</h1>
        <p className="text-muted-foreground">Explore entities, relationships, and communities</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCollection && (
          <Button onClick={handleBuildCommunities} variant="outline">
            Build Communities
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : selectedCollection ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Entities
              </CardTitle>
              <CardDescription>Extracted concepts and entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{entities.length}</div>
              {entities.slice(0, 5).map((entity) => (
                <div key={entity.id} className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{entity.category}</Badge>
                  <span className="text-sm truncate">{entity.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Relationships
              </CardTitle>
              <CardDescription>Connections between entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{relationships.length}</div>
              {relationships.slice(0, 5).map((rel) => (
                <div key={rel.id} className="mt-2 text-sm text-muted-foreground truncate">
                  {rel.subject} → {rel.predicate} → {rel.object}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Communities
              </CardTitle>
              <CardDescription>Clustered entity groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{communities.length}</div>
              {communities.slice(0, 5).map((community) => (
                <div key={community.id} className="mt-2">
                  <div className="text-sm font-medium">{community.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {community.size} entities
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a collection to view its knowledge graph</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
