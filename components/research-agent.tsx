"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, Loader2, CheckCircle2, AlertCircle, Lightbulb, Code, Search, FileText } from "lucide-react"

interface ThinkingStep {
  type: "thinking" | "tool_call" | "tool_result" | "citation" | "message" | "final_answer"
  content: string
  toolName?: string
  timestamp: number
}

interface ResearchSession {
  query: string
  steps: ThinkingStep[]
  conclusion: string
  status: "idle" | "thinking" | "complete" | "error"
  conversationId?: string
}

export function ResearchAgent() {
  const [query, setQuery] = useState("")
  const [session, setSession] = useState<ResearchSession | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [session?.steps])

  const handleSubmit = async () => {
    if (!query.trim() || isStreaming) return

    const newSession: ResearchSession = {
      query,
      steps: [],
      conclusion: "",
      status: "thinking",
    }
    setSession(newSession)
    setIsStreaming(true)

    try {
      // Call R2R agent in research mode with Vertex AI Gemini Pro 3.0
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          conversationId: session?.conversationId,
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

          const data = line.slice(6)
          if (data === "[DONE]") continue

          try {
            const event = JSON.parse(data)

            setSession((prev) => {
              if (!prev) return prev

              const newSteps = [...prev.steps]

              if (event.type === "thinking") {
                newSteps.push({
                  type: "thinking",
                  content: event.content,
                  timestamp: Date.now(),
                })
              } else if (event.type === "tool_call") {
                newSteps.push({
                  type: "tool_call",
                  content: event.content,
                  toolName: event.tool_name,
                  timestamp: Date.now(),
                })
              } else if (event.type === "tool_result") {
                newSteps.push({
                  type: "tool_result",
                  content: event.content,
                  toolName: event.tool_name,
                  timestamp: Date.now(),
                })
              } else if (event.type === "citation") {
                newSteps.push({
                  type: "citation",
                  content: event.content,
                  timestamp: Date.now(),
                })
              } else if (event.type === "message") {
                // Update the last message or add new one
                const lastStep = newSteps[newSteps.length - 1]
                if (lastStep && lastStep.type === "message") {
                  lastStep.content += event.content
                } else {
                  newSteps.push({
                    type: "message",
                    content: event.content,
                    timestamp: Date.now(),
                  })
                }
              } else if (event.type === "final_answer") {
                return {
                  ...prev,
                  conclusion: event.content,
                  status: "complete",
                  conversationId: event.conversation_id,
                }
              }

              return { ...prev, steps: newSteps }
            })
          } catch (e) {
            console.error("[v0] Failed to parse event:", e)
          }
        }
      }

      setSession((prev) => (prev ? { ...prev, status: "complete" } : null))
    } catch (error) {
      console.error("[v0] Research error:", error)
      setSession((prev) => (prev ? { ...prev, status: "error" } : null))
    } finally {
      setIsStreaming(false)
    }
  }

  const getToolIcon = (toolName?: string) => {
    switch (toolName) {
      case "reasoning":
        return <Brain className="h-4 w-4" />
      case "rag":
        return <Search className="h-4 w-4" />
      case "critique":
        return <Lightbulb className="h-4 w-4" />
      case "python_executor":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Research Display */}
        <div className="flex flex-1 flex-col">
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {!session && (
                <div className="flex h-full items-center justify-center py-20">
                  <div className="text-center">
                    <Brain className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold text-foreground">Start Your Research</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ask complex questions and watch the AI reason through them
                    </p>
                  </div>
                </div>
              )}

              {session && (
                <>
                  {/* Query */}
                  <Card className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">Q</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Question</h3>
                        <p className="mt-1 text-base text-foreground">{session.query}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Thinking Steps */}
                  {session.steps.map((step, index) => (
                    <Card key={index} className="p-4">
                      {step.type === "thinking" && (
                        <div className="flex items-start gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">Thinking</h4>
                            <p className="mt-1 text-sm text-muted-foreground">{step.content}</p>
                          </div>
                        </div>
                      )}

                      {step.type === "tool_call" && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                            {getToolIcon(step.toolName)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground">Tool: {step.toolName}</h4>
                              <Badge variant="secondary" className="text-xs">
                                Executing
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{step.content}</p>
                          </div>
                        </div>
                      )}

                      {step.type === "tool_result" && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">Result from {step.toolName}</h4>
                            <div className="mt-2 rounded-lg bg-muted p-3">
                              <p className="text-sm text-muted-foreground">{step.content}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.type === "citation" && (
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">Citation</h4>
                            <p className="mt-1 text-sm text-muted-foreground">{step.content}</p>
                          </div>
                        </div>
                      )}

                      {step.type === "message" && (
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <span className="text-sm font-medium text-primary-foreground">A</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">{step.content}</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}

                  {/* Conclusion */}
                  {session.conclusion && (
                    <Card className="border-2 border-primary p-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-foreground">Conclusion</h3>
                          <p className="mt-2 text-sm text-foreground leading-relaxed">{session.conclusion}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Error State */}
                  {session.status === "error" && (
                    <Card className="border-2 border-destructive p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-destructive">Error</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            An error occurred during research. Please try again.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-card p-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex gap-3">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a complex research question..."
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  disabled={isStreaming}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!query.trim() || isStreaming}
                  size="lg"
                  className="h-[80px] w-[80px] shrink-0"
                >
                  {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
