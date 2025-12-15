// Knowledge Graph Visualization Page

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Network, Users, GitBranch, Sparkles } from "lucide-react"
import { listCollections } from "@/lib/r2r/collections"
import { listEntities, listRelationships, buildCommunities, listCommunities } from "@/lib/r2r/graphs"

export default function KnowledgeGraphPage() {
  const [collections, setCollections] = useState<any[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
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
      console.error("[v0] Failed to load collections:", error)
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
      console.error("[v0] Failed to load graph data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuildCommunities = async () => {
    if (!selectedCollection) return

    try {
      await buildCommunities(selectedCollection)
      alert("Community building started. Check Hatchet dashboard for progress.")
      setTimeout(() => loadGraphData(), 5000)
    } catch (error) {
      console.error("[v0] Failed to build communities:", error)
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
            <Sparkles className="mr-2 h-4 w-4" />
            Build Communities
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : selectedCollection ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entities</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entities.length}</div>
                <p className="text-xs text-muted-foreground">Extracted concepts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relationships</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relationships.length}</div>
                <p className="text-xs text-muted-foreground">Connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Communities</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communities.length}</div>
                <p className="text-xs text-muted-foreground">Clusters</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="entities" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="entities">Entities</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
            </TabsList>

            <TabsContent value="entities" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Entity List</CardTitle>
                  <CardDescription>All entities extracted from documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Accordion type="single" collapsible className="w-full">
                      {entities.map((entity) => (
                        <AccordionItem key={entity.id} value={entity.id}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{entity.category}</Badge>
                              <span>{entity.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">{entity.description}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relationships" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relationship List</CardTitle>
                  <CardDescription>Connections between entities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] space-y-2">
                    {relationships.map((rel) => (
                      <div key={rel.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{rel.subject}</Badge>
                          <span className="text-muted-foreground">→ {rel.predicate} →</span>
                          <Badge variant="outline">{rel.object}</Badge>
                        </div>
                        {rel.description && <p className="text-xs text-muted-foreground mt-2">{rel.description}</p>}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communities" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community List</CardTitle>
                  <CardDescription>Clustered entity groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] space-y-2">
                    {communities.map((community) => (
                      <div key={community.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{community.name}</h4>
                          <Badge>{community.size} entities</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{community.description}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
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
