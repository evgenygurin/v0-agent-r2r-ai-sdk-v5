// R2R Deep Research Agent with multi-step reasoning and tool orchestration

import { getR2RClient } from "@/lib/r2r/client"
import { context7 } from "@/lib/mcp/context7"
import type { ResearchRun, ResearchStep, Citation, StreamEvent } from "@/lib/types/research"
import { logger } from "@/lib/utils/logger"

export class R2RResearchAgent {
  private r2rClient = getR2RClient()
  private currentRun: ResearchRun | null = null

  async startResearch(
    query: string,
    options: {
      temperature?: number
      model?: string
      useContext7?: boolean
      conversationId?: string
    } = {},
  ): Promise<ReadableStream<Uint8Array>> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(7)}`

    this.currentRun = {
      id: runId,
      query,
      status: "planning",
      startTime: Date.now(),
      steps: [],
      finalAnswer: "",
      citations: [],
      toolsUsed: [],
      model: options.model || "vertex_ai/gemini-3.0-pro",
      temperature: options.temperature || 0.7,
      conversationId: options.conversationId,
    }

    // Check if query mentions frameworks/libraries that need Context7
    const needsContext7 = options.useContext7 || this.shouldUseContext7(query)

    return this.createResearchStream(needsContext7)
  }

  private shouldUseContext7(query: string): boolean {
    const frameworks = [
      "next.js",
      "nextjs",
      "react",
      "shadcn",
      "tailwind",
      "typescript",
      "vercel",
      "app router",
      "middleware",
    ]

    const lowerQuery = query.toLowerCase()
    return frameworks.some((fw) => lowerQuery.includes(fw))
  }

  private async enrichWithContext7(query: string): Promise<string> {
    try {
      // Extract library mentions from query
      const libraries = this.extractLibraries(query)

      if (libraries.length === 0) return ""

      const contextParts: string[] = []

      for (const lib of libraries) {
        try {
          const docs = await context7.searchDocs(lib, query)
          contextParts.push(`## ${lib} Documentation\n${JSON.stringify(docs, null, 2)}`)
        } catch (error) {
          logger.error("Context7 error", error as Error, { library: lib })
        }
      }

      return contextParts.join("\n\n")
    } catch (error) {
      logger.error("Context7 enrichment failed", error as Error)
      return ""
    }
  }

  private extractLibraries(query: string): string[] {
    const libMap: Record<string, string> = {
      "next.js": "nextjs",
      nextjs: "nextjs",
      react: "react",
      shadcn: "shadcn-ui",
      tailwind: "tailwindcss",
      typescript: "typescript",
    }

    const lowerQuery = query.toLowerCase()
    const found: string[] = []

    for (const [pattern, libName] of Object.entries(libMap)) {
      if (lowerQuery.includes(pattern)) {
        found.push(libName)
      }
    }

    return [...new Set(found)]
  }

  private createResearchStream(useContext7: boolean): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream({
      start: async (controller) => {
        try {
          // Step 1: Planning phase
          this.emitEvent(controller, encoder, {
            type: "status",
            data: { status: "planning", message: "Planning research strategy..." },
            timestamp: Date.now(),
          })

          let enrichedQuery = this.currentRun!.query

          // Step 2: Context7 enrichment if needed
          if (useContext7) {
            this.emitEvent(controller, encoder, {
              type: "tool",
              data: {
                name: "context7",
                status: "running",
                description: "Fetching up-to-date documentation...",
              },
              timestamp: Date.now(),
            })

            const context = await this.enrichWithContext7(this.currentRun!.query)
            if (context) {
              enrichedQuery = `${this.currentRun!.query}\n\nRelevant Documentation:\n${context}`
            }

            this.emitEvent(controller, encoder, {
              type: "tool",
              data: {
                name: "context7",
                status: "complete",
                description: "Documentation fetched successfully",
              },
              timestamp: Date.now(),
            })
          }

          // Step 3: Start R2R deep research
          this.emitEvent(controller, encoder, {
            type: "status",
            data: { status: "researching", message: "Running deep research..." },
            timestamp: Date.now(),
          })

          const response = await this.r2rClient.agent(enrichedQuery, {
            mode: "research",
            researchTools: ["rag", "reasoning", "critique", "python_executor"],
            conversationId: this.currentRun!.conversationId,
            generationConfig: {
              model: this.currentRun!.model,
              temperature: this.currentRun!.temperature,
              maxTokens: 4096,
              stream: true,
            },
          })

          if (!response.body) {
            throw new Error("No response body from R2R")
          }

          // Step 4: Stream R2R responses
          const reader = response.body.getReader()
          let buffer = ""
          let currentStep: ResearchStep | null = null

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

                // Parse R2R event and emit appropriate stream events
                if (event.type === "thinking") {
                  const step: ResearchStep = {
                    id: `step_${Date.now()}`,
                    type: "thinking",
                    status: "running",
                    timestamp: Date.now(),
                    description: "Analyzing and reasoning...",
                    content: event.content,
                  }
                  currentStep = step

                  this.emitEvent(controller, encoder, {
                    type: "step",
                    data: step,
                    timestamp: Date.now(),
                  })
                }

                if (event.type === "tool_call") {
                  const step: ResearchStep = {
                    id: `step_${Date.now()}`,
                    type: "tool_call",
                    status: "running",
                    timestamp: Date.now(),
                    description: `Using ${event.tool_name}...`,
                    toolName: event.tool_name,
                    content: event.content,
                  }
                  currentStep = step

                  this.emitEvent(controller, encoder, {
                    type: "step",
                    data: step,
                    timestamp: Date.now(),
                  })

                  this.emitEvent(controller, encoder, {
                    type: "tool",
                    data: {
                      name: event.tool_name,
                      status: "running",
                      description: event.content,
                    },
                    timestamp: Date.now(),
                  })
                }

                if (event.type === "tool_result") {
                  if (currentStep) {
                    currentStep.status = "complete"
                    currentStep.duration = Date.now() - currentStep.timestamp
                  }

                  const step: ResearchStep = {
                    id: `step_${Date.now()}`,
                    type: "tool_result",
                    status: "complete",
                    timestamp: Date.now(),
                    description: `Result from ${event.tool_name}`,
                    toolName: event.tool_name,
                    content: event.content,
                  }

                  this.emitEvent(controller, encoder, {
                    type: "step",
                    data: step,
                    timestamp: Date.now(),
                  })

                  this.emitEvent(controller, encoder, {
                    type: "tool",
                    data: {
                      name: event.tool_name,
                      status: "complete",
                      result: event.content,
                    },
                    timestamp: Date.now(),
                  })
                }

                if (event.type === "citation") {
                  const citation: Citation = {
                    id: `cite_${Date.now()}`,
                    title: event.title || "Source",
                    url: event.url,
                    snippet: event.content,
                    domain: event.url ? new URL(event.url).hostname : undefined,
                    sections: [],
                  }

                  this.emitEvent(controller, encoder, {
                    type: "citation",
                    data: citation,
                    timestamp: Date.now(),
                  })
                }

                if (event.type === "message" || event.type === "token") {
                  this.emitEvent(controller, encoder, {
                    type: "token",
                    data: { content: event.content },
                    timestamp: Date.now(),
                  })
                }

                if (event.type === "final_answer") {
                  this.emitEvent(controller, encoder, {
                    type: "complete",
                    data: {
                      answer: event.content,
                      conversationId: event.conversation_id,
                    },
                    timestamp: Date.now(),
                  })
                }
              } catch (error) {
                logger.error("Failed to parse stream event", error as Error)
              }
            }
          }
        } catch (error) {
          logger.error("Research stream error", error as Error)

          this.emitEvent(controller, encoder, {
            type: "error",
            data: { error: (error as Error).message },
            timestamp: Date.now(),
          })
        } finally {
          controller.close()
        }
      },
    })
  }

  private emitEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, event: StreamEvent) {
    const line = `data: ${JSON.stringify(event)}\n\n`
    controller.enqueue(encoder.encode(line))
  }
}
