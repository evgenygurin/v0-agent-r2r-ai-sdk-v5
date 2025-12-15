"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Brain,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Copy,
  Download,
  History,
  Network,
  ExternalLink,
  Settings2,
  Play,
} from "lucide-react"
import type { ResearchRun, StreamEvent } from "@/lib/types/research"

export function DeepResearchAgent() {
  const [query, setQuery] = useState("")
  const [currentRun, setCurrentRun] = useState<ResearchRun | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [useContext7, setUseContext7] = useState(true)
  const [history, setHistory] = useState<ResearchRun[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("answer")

  const scrollRef = useRef<HTMLDivElement>(null)
  const answerRef = useRef<string>("")

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("research_history")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistory(parsed.runs || [])
      } catch (error) {
        console.error("[v0] Failed to load history:", error)
      }
    }
  }, [])

  // Save to history
  const saveToHistory = (run: ResearchRun) => {
    const newHistory = [run, ...history].slice(0, 20) // Keep last 20
    setHistory(newHistory)
    localStorage.setItem("research_history", JSON.stringify({ runs: newHistory, lastUpdated: Date.now() }))
  }

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && activeTab === "answer") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentRun?.finalAnswer, activeTab])

  const handleSubmit = async () => {
    if (!query.trim() || isStreaming) return

    const runId = `run_${Date.now()}`
    const newRun: ResearchRun = {
      id: runId,
      query,
      status: "planning",
      startTime: Date.now(),
      steps: [],
      finalAnswer: "",
      citations: [],
      toolsUsed: [],
      model: "vertex_ai/gemini-3.0-pro",
      temperature,
    }

    setCurrentRun(newRun)
    setIsStreaming(true)
    answerRef.current = ""
    setActiveTab("answer")

    try {
      const response = await fetch("/api/research/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          temperature,
          useContext7,
        }),
      })

      if (!response.ok) {
        throw new Error("Research request failed")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response stream")
      }

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue

          try {
            const event: StreamEvent = JSON.parse(line.slice(6))

            setCurrentRun((prev) => {
              if (!prev) return prev

              const updated = { ...prev }

              if (event.type === "status") {
                updated.status = event.data.status
              }

              if (event.type === "step") {
                updated.steps = [...updated.steps, event.data]
              }

              if (event.type === "token") {
                answerRef.current += event.data.content
                updated.finalAnswer = answerRef.current
              }

              if (event.type === "citation") {
                updated.citations = [...updated.citations, event.data]
              }

              if (event.type === "tool") {
                const toolName = event.data.name
                const existing = updated.toolsUsed.find((t) => t.name === toolName)

                if (existing) {
                  existing.callCount++
                  existing.lastUsed = event.timestamp
                } else {
                  updated.toolsUsed.push({
                    name: toolName,
                    description: event.data.description || toolName,
                    callCount: 1,
                    avgDuration: 0,
                    lastUsed: event.timestamp,
                  })
                }
              }

              if (event.type === "complete") {
                updated.status = "complete"
                updated.endTime = Date.now()
                updated.conversationId = event.data.conversationId
              }

              if (event.type === "error") {
                updated.status = "error"
                updated.error = event.data.error
                updated.endTime = Date.now()
              }

              return updated
            })
          } catch (error) {
            console.error("[v0] Failed to parse event:", error)
          }
        }
      }

      // Save completed run to history
      setCurrentRun((prev) => {
        if (prev && prev.status === "complete") {
          saveToHistory(prev)
        }
        return prev
      })

      toast.success("Research complete!")
    } catch (error) {
      console.error("[v0] Research error:", error)
      setCurrentRun((prev) => (prev ? { ...prev, status: "error", error: (error as Error).message } : null))
      toast.error("Research failed. Please try again.")
    } finally {
      setIsStreaming(false)
    }
  }

  const copyAnswer = () => {
    if (currentRun?.finalAnswer) {
      navigator.clipboard.writeText(currentRun.finalAnswer)
      toast.success("Answer copied to clipboard")
    }
  }

  const copyCitations = () => {
    if (currentRun?.citations.length) {
      const text = currentRun.citations
        .map((c, i) => `[${i + 1}] ${c.title}\n${c.url || ""}\n${c.snippet}\n`)
        .join("\n")
      navigator.clipboard.writeText(text)
      toast.success("Citations copied to clipboard")
    }
  }

  const copyDebugJSON = () => {
    if (currentRun) {
      navigator.clipboard.writeText(JSON.stringify(currentRun, null, 2))
      toast.success("Debug JSON copied to clipboard")
    }
  }

  const loadHistoryRun = (run: ResearchRun) => {
    setCurrentRun(run)
    setQuery(run.query)
    setShowHistory(false)
    setActiveTab("answer")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Settings Panel */}
      <div className="border-b border-border bg-card p-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="temperature" className="text-sm">
                  Temperature: {temperature.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                className="w-32"
                disabled={isStreaming}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="context7" checked={useContext7} onCheckedChange={setUseContext7} disabled={isStreaming} />
              <Label htmlFor="context7" className="text-sm">
                Use Context7
              </Label>
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Input & Controls */}
        <div className="flex w-96 flex-col border-r border-border bg-card">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Deep Research Query</h2>
              <p className="text-sm text-muted-foreground">Ask complex questions requiring multi-step reasoning</p>
            </div>

            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Compare vector databases for multi-tenant SaaS and provide infrastructure diagram..."
              className="min-h-[200px] resize-none"
              disabled={isStreaming}
            />

            <Button onClick={handleSubmit} disabled={!query.trim() || isStreaming} className="mt-4 w-full" size="lg">
              {isStreaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Research
                </>
              )}
            </Button>
          </div>

          {/* Research Status */}
          {currentRun && (
            <div className="border-t border-border p-6">
              <h3 className="mb-4 text-sm font-medium text-foreground">Research Status</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={currentRun.status === "complete" ? "default" : "secondary"}>
                    {currentRun.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">
                    {currentRun.endTime
                      ? `${((currentRun.endTime - currentRun.startTime) / 1000).toFixed(1)}s`
                      : `${((Date.now() - currentRun.startTime) / 1000).toFixed(1)}s`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Steps</span>
                  <span className="text-foreground">{currentRun.steps.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Citations</span>
                  <span className="text-foreground">{currentRun.citations.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tools Used</span>
                  <span className="text-foreground">{currentRun.toolsUsed.length}</span>
                </div>
              </div>

              {currentRun.toolsUsed.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Active Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentRun.toolsUsed.map((tool) => (
                      <Badge key={tool.name} variant="outline" className="text-xs">
                        {tool.name} ({tool.callCount})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Tabbed Content */}
        <div className="flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
            <div className="border-b border-border px-6">
              <TabsList className="h-12">
                <TabsTrigger value="answer" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Answer
                </TabsTrigger>
                <TabsTrigger value="reasoning" className="gap-2">
                  <Brain className="h-4 w-4" />
                  Reasoning
                  {currentRun && currentRun.steps.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {currentRun.steps.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sources" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Sources
                  {currentRun && currentRun.citations.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {currentRun.citations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="graph" className="gap-2">
                  <Network className="h-4 w-4" />
                  Graph
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1">
              <div className="mx-auto max-w-4xl p-6">
                {/* Answer Tab */}
                <TabsContent value="answer" className="mt-0">
                  {!currentRun && (
                    <div className="flex h-96 items-center justify-center">
                      <div className="text-center">
                        <Brain className="mx-auto h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold text-foreground">Ready for Deep Research</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Enter your question and click Start Research to begin
                        </p>
                      </div>
                    </div>
                  )}

                  {currentRun && (
                    <div className="space-y-6">
                      {/* Query Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Research Query</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground">{currentRun.query}</p>
                        </CardContent>
                      </Card>

                      {/* Answer Card */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Research Answer</CardTitle>
                            {currentRun.finalAnswer && (
                              <Button variant="ghost" size="sm" onClick={copyAnswer}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isStreaming && !currentRun.finalAnswer && (
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-5/6" />
                              <Skeleton className="h-4 w-4/6" />
                            </div>
                          )}

                          {currentRun.finalAnswer && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentRun.finalAnswer}</p>
                            </div>
                          )}

                          {currentRun.status === "error" && (
                            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                              <div>
                                <p className="text-sm font-medium text-destructive">Research Error</p>
                                <p className="text-sm text-muted-foreground">{currentRun.error}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                {/* Reasoning Tab */}
                <TabsContent value="reasoning" className="mt-0">
                  {currentRun && currentRun.steps.length > 0 ? (
                    <div className="space-y-4">
                      {currentRun.steps.map((step, index) => (
                        <Card key={step.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {step.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                {step.status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                {step.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}

                                <div>
                                  <CardTitle className="text-sm">{step.description}</CardTitle>
                                  <CardDescription className="text-xs">
                                    Step {index + 1} • {new Date(step.timestamp).toLocaleTimeString()}
                                  </CardDescription>
                                </div>
                              </div>

                              {step.toolName && <Badge variant="outline">{step.toolName}</Badge>}
                            </div>
                          </CardHeader>

                          {step.content && (
                            <CardContent>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.content}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-96 items-center justify-center">
                      <p className="text-sm text-muted-foreground">No reasoning steps yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="mt-0">
                  {currentRun && currentRun.citations.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">
                          {currentRun.citations.length} Citation{currentRun.citations.length !== 1 ? "s" : ""}
                        </h3>
                        <Button variant="outline" size="sm" onClick={copyCitations}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All
                        </Button>
                      </div>

                      {currentRun.citations.map((citation, index) => (
                        <Card key={citation.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-sm">{citation.title}</CardTitle>
                                {citation.domain && (
                                  <CardDescription className="mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {citation.domain}
                                    </Badge>
                                  </CardDescription>
                                )}
                              </div>

                              {citation.url && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={citation.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{citation.snippet}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-96 items-center justify-center">
                      <p className="text-sm text-muted-foreground">No citations yet</p>
                    </div>
                  )}
                </TabsContent>

                {/* Graph Tab */}
                <TabsContent value="graph" className="mt-0">
                  {currentRun?.graph ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Knowledge Graph</CardTitle>
                        <CardDescription>
                          {currentRun.graph.nodes.length} nodes, {currentRun.graph.edges.length} edges
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
                          <Network className="mx-auto h-16 w-16 text-muted-foreground" />
                          <p className="mt-4 text-sm text-muted-foreground">
                            Graph visualization component placeholder
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Integration with React graph library coming soon
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex h-96 items-center justify-center">
                      <div className="text-center">
                        <Network className="mx-auto h-16 w-16 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">No knowledge graph data available</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>

            {/* Action Bar */}
            {currentRun && currentRun.status === "complete" && (
              <div className="border-t border-border bg-card p-4">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Research completed in {((currentRun.endTime! - currentRun.startTime) / 1000).toFixed(1)}s
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyAnswer}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Answer
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyDebugJSON}>
                      <Download className="mr-2 h-4 w-4" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Research History</DialogTitle>
            <DialogDescription>View and reload previous research sessions</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No research history yet</p>
              ) : (
                history.map((run) => (
                  <Card
                    key={run.id}
                    className="cursor-pointer transition-colors hover:bg-accent"
                    onClick={() => loadHistoryRun(run)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-sm">{run.query}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3" />
                            {new Date(run.startTime).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge variant={run.status === "complete" ? "default" : "secondary"}>{run.status}</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
