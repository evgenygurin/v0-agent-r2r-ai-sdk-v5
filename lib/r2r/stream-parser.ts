// Stream parser for R2R Server-Sent Events

import type { R2RStreamEvent } from '@/lib/types/r2r'

export class R2RStreamParser {
  private decoder = new TextDecoder()
  private buffer = ''

  parseChunk(chunk: Uint8Array): R2RStreamEvent[] {
    this.buffer += this.decoder.decode(chunk, { stream: true })
    
    const events: R2RStreamEvent[] = []
    const lines = this.buffer.split('\n')
    
    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim() || line.startsWith(':')) {
        continue
      }

      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          events.push(this.parseEvent(data))
        } catch (error) {
          console.error('[v0] Failed to parse SSE data:', error)
        }
      }
    }

    return events
  }

  private parseEvent(data: any): R2RStreamEvent {
    // Parse different event types from R2R stream
    if (data.type === 'thinking') {
      return {
        type: 'thinking',
        data: data.content,
      }
    }

    if (data.type === 'tool_call') {
      return {
        type: 'tool_call',
        data: {
          tool: data.tool_name,
          args: data.tool_args,
          result: data.tool_result,
        },
      }
    }

    if (data.type === 'citation') {
      return {
        type: 'citation',
        data: {
          source: data.source,
          text: data.text,
          metadata: data.metadata,
        },
      }
    }

    if (data.type === 'error') {
      return {
        type: 'error',
        data: {
          message: data.message,
          code: data.code,
        },
      }
    }

    // Default message type
    return {
      type: 'message',
      data: data.content || data,
    }
  }

  reset() {
    this.buffer = ''
  }
}
