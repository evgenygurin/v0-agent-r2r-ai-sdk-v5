import type { NextRequest } from "next/server"
import { getR2RClient } from "@/lib/r2r/client"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { query, conversationId } = await req.json()

    if (!query) {
      return new Response("Query is required", { status: 400 })
    }

    const r2rClient = getR2RClient()

    const response = await r2rClient.agent(query, {
      mode: "research",
      researchTools: ["rag", "reasoning", "critique", "python_executor"],
      conversationId,
      generationConfig: {
        // Use Vertex AI Gemini Pro 3.0
        model: "vertex_ai/gemini-3.0-pro",
        temperature: 0.8,
        maxTokens: 4096,
        stream: true,
      },
    })

    if (!response.body) {
      throw new Error("No response body from R2R")
    }

    // Stream the response back to client
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data: ")) continue

              // Forward the SSE event to the client
              controller.enqueue(encoder.encode(line + "\n"))
            }
          }
        } catch (error) {
          console.error("[v0] Stream error:", error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Research API error:", error)
    return new Response(JSON.stringify({ error: "Research request failed" }), { status: 500 })
  }
}
