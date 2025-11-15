// Document Management Page

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Trash2, Download, Loader2 } from 'lucide-react'
import { createDocument, listDocuments, deleteDocument, extractEntities } from '@/lib/r2r/documents'

interface Document {
  id: string
  title: string
  status: 'success' | 'processing' | 'failed'
  created_at: string
  metadata?: any
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const result = await listDocuments({ limit: 50 })
      setDocuments(result.results || [])
    } catch (error) {
      console.error('[v0] Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await createDocument({
        file,
        metadata: { source: 'web_upload' },
      })
      await loadDocuments()
    } catch (error) {
      console.error('[v0] Failed to upload document:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(documentId)
      await loadDocuments()
    } catch (error) {
      console.error('[v0] Failed to delete document:', error)
    }
  }

  const handleExtract = async (documentId: string) => {
    try {
      await extractEntities(documentId)
      alert('Entity extraction started. Check Hatchet dashboard for progress.')
    } catch (error) {
      console.error('[v0] Failed to start extraction:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage your document library</p>
        </div>
        <div>
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Document
            </label>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents yet. Upload one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {doc.title || 'Untitled'}
                </CardTitle>
                <CardDescription>
                  Uploaded {new Date(doc.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge
                  variant={
                    doc.status === 'success'
                      ? 'default'
                      : doc.status === 'processing'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {doc.status}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExtract(doc.id)}
                  >
                    Extract Entities
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
