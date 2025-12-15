"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Send, Loader2, User, Sparkles, Wrench, FileText, CheckCircle2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  thinking?: string[]
  toolCalls?: Array<{ name: string; args: string }>
  toolResults?: string[]
  citations?: Array<{ id: string; title: string; snippet: string }>
  isStreaming?: boolean
}

export function ResearchChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      thinking: [],
      toolCalls: [],
      toolResults: [],
      citations: [],
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      abortControllerRef.current = new AbortController()

      const response = await fetch("/api/research/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error("Request failed")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No reader")

      let buffer = ""
      let currentThinking = ""
      let currentMessage = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue

          try {
            const data = JSON.parse(line.slice(6))

            setMessages((prev) => {
              const updated = [...prev]
              const lastMsg = updated[updated.length - 1]

              if (lastMsg.role !== "assistant") return prev

              switch (data.event) {
                case "thinking":
                  currentThinking += data.data?.delta?.content?.[0]?.payload?.value || ""
                  lastMsg.thinking = lastMsg.thinking || []
                  if (currentThinking) {
                    lastMsg.thinking = [currentThinking]
                  }
                  break

                case "tool_call":
                  lastMsg.toolCalls = lastMsg.toolCalls || []
                  lastMsg.toolCalls.push({
                    name: data.data?.name || "unknown",
                    args: JSON.stringify(data.data?.arguments || {}),
                  })
                  break

                case "tool_result":
                  lastMsg.toolResults = lastMsg.toolResults || []
                  lastMsg.toolResults.push(data.data?.content?.substring(0, 100) + "..." || "Result received")
                  break

                case "citation":
                  lastMsg.citations = lastMsg.citations || []
                  const citation = data.data
                  if (citation && !lastMsg.citations.find((c) => c.id === citation.id)) {
                    lastMsg.citations.push({
                      id: citation.id || `cite_${Date.now()}`,
                      title: citation.title || citation.document_id || "Source",
                      snippet: citation.text?.substring(0, 150) || "",
                    })
                  }
                  break

                case "message":
                  currentMessage += data.data?.delta?.content?.[0]?.payload?.value || ""
                  lastMsg.content = currentMessage
                  break

                case "final_answer":
                  lastMsg.content = data.data?.generated_answer || currentMessage
                  lastMsg.isStreaming = false

                  if (data.data?.citations?.length > 0) {
                    lastMsg.citations = data.data.citations.map((c: any, i: number) => ({
                      id: c.id || `cite_${i}`,
                      title: c.title || c.document_id || `Source ${i + 1}`,
                      snippet: c.text?.substring(0, 150) || "",
                    }))
                  }
                  break
              }

              return updated
            })
          } catch (error) {
            console.error("[v0] Parse error:", error)
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("[v0] Request aborted")
      } else {
        console.error("[v0] Stream error:", error)
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg.role === "assistant") {
            lastMsg.content = "Sorry, I encountered an error. Please try again."
            lastMsg.isStreaming = false
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">R2R Research Agent</h1>
            <p className="text-sm text-muted-foreground">Powered by Vertex AI Gemini 3.0 Pro with extended thinking</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Research Mode
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {messages.length === 0 && (
            <div className="flex h-96 items-center justify-center">
              <div className="text-center">
                <Brain className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Ready to Research</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Ask complex questions that require multi-step reasoning and I'll use advanced tools to find
                  comprehensive answers.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={message.role === "user" ? "bg-primary" : "bg-secondary"}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {message.role === "user" ? "You" : "Research Agent"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* User message */}
                {message.role === "user" && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-foreground">{message.content}</p>
                  </div>
                )}

                {/* Assistant message */}
                {message.role === "assistant" && (
                  <div className="space-y-3">
                    {/* Thinking */}
                    {message.thinking && message.thinking.length > 0 && (
                      <Card className="border-primary/20 bg-primary/5 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                          <Brain className="h-4 w-4" />
                          Thinking
                        </div>
                        <p className="text-sm text-muted-foreground">{message.thinking[0]}</p>
                      </Card>
                    )}

                    {/* Tool Calls */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <Card className="border-orange-500/20 bg-orange-500/5 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                          <Wrench className="h-4 w-4" />
                          Tool Calls ({message.toolCalls.length})
                        </div>
                        <div className="space-y-1">
                          {message.toolCalls.map((tool, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <code className="text-xs">{tool.name}</code>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Main Content */}
                    {message.content && (
                      <div className="rounded-lg border border-border bg-card p-4">
                        {message.isStreaming && !message.content ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                              {message.content}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          Sources ({message.citations.length})
                        </div>
                        <div className="grid gap-2">
                          {message.citations.map((citation, i) => (
                            <Card key={citation.id} className="p-3">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="shrink-0">
                                  {i + 1}
                                </Badge>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium text-foreground">{citation.title}</p>
                                  {citation.snippet && (
                                    <p className="text-xs text-muted-foreground">{citation.snippet}...</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.isStreaming && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating response...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a research question..."
              disabled={isLoading}
              className="flex-1"
            />
            {isLoading ? (
              <Button type="button" onClick={stopGeneration} variant="destructive">
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
