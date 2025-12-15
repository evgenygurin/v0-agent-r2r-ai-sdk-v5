import type { NextRequest } from "next/server"
import { getR2RClient } from "@/lib/r2r/client"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query) {
      return new Response("Query is required", { status: 400 })
    }

    const client = getR2RClient()

    const response = await client.agent(query, {
      mode: "research",
      researchTools: ["rag", "reasoning", "critique", "python_executor"],
      generationConfig: {
        // model is set in R2R server config - using vertex_ai/gemini-3.0-pro
        temperature: 0.8,
        maxTokens: 16000,
        stream: true,
      },
    })

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Research stream error:", error)
    return new Response(JSON.stringify({ error: "Research request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
