import type { NextRequest } from "next/server"
import { R2RResearchAgent } from "@/lib/agent/r2rResearchAgent"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { query, temperature, useContext7 } = await req.json()

    if (!query) {
      return new Response("Query is required", { status: 400 })
    }

    const agent = new R2RResearchAgent()

    const stream = await agent.startResearch(query, {
      temperature: temperature || 0.7,
      model: "vertex_ai/gemini-3.0-pro",
      useContext7: useContext7 ?? true,
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Deep research API error:", error)
    return new Response(JSON.stringify({ error: "Deep research request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
