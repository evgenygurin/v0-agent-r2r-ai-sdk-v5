// Collections Management Page

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Folder, Plus, Trash2, Loader2, Network } from "lucide-react"
import { createCollection, listCollections, deleteCollection, extractCollectionEntities } from "@/lib/r2r/collections"

interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  document_count?: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: "", description: "" })

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      const result = await listCollections({ limit: 50 })
      setCollections(result.results || [])
    } catch (error) {
      // Silent fail with mock data from lib
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCollection.name.trim()) return

    try {
      await createCollection(newCollection)
      setNewCollection({ name: "", description: "" })
      setShowCreate(false)
      await loadCollections()
    } catch (error) {
      alert("Failed to create collection. Please try again.")
    }
  }

  const handleDelete = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return

    try {
      await deleteCollection(collectionId)
      await loadCollections()
    } catch (error) {
      alert("Failed to delete collection.")
    }
  }

  const handleExtractAll = async (collectionId: string) => {
    try {
      await extractCollectionEntities(collectionId)
      alert("Collection extraction started. Check Hatchet dashboard for progress.")
    } catch (error) {
      alert("Failed to start extraction.")
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Organize documents into collections</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
              <DialogDescription>Create a new collection to organize your documents</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="Technical Documentation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="Product docs and API references"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : collections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No collections yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      {collection.name}
                    </CardTitle>
                    <CardDescription>{collection.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documents</span>
                      <Badge variant="secondary">{collection.document_count || 0}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Processing</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleExtractAll(collection.id)}
                      >
                        <Network className="mr-2 h-4 w-4" />
                        Extract All
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(collection.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {collections.map((collection, idx) => (
                <div key={collection.id}>
                  {idx > 0 && <Separator />}
                  <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <Folder className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">{collection.description || "No description"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{collection.document_count || 0} docs</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleExtractAll(collection.id)}>
                        Extract
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(collection.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
