// Direct Claude Code chat endpoint

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1].content

    // Mock streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const response = `Response to: ${lastMessage}`
        const words = response.split(' ')
        
        for (const word of words) {
          controller.enqueue(encoder.encode(`0:"${word} "\n`))
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('[v0] Chat endpoint error:', error)
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
