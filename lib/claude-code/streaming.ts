// Streaming utilities for Claude Code responses

export interface StreamMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamOptions {
  onToken?: (token: string) => void
  onThinking?: (thinking: string) => void
  onToolCall?: (toolName: string, args: any) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

export class ClaudeCodeStreamHandler {
  private fullText = ''
  private options: StreamOptions

  constructor(options: StreamOptions = {}) {
    this.options = options
  }

  async handleStream(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          if (this.options.onComplete) {
            this.options.onComplete(this.fullText)
          }
          break
        }

        const chunk = decoder.decode(value)
        this.fullText += chunk

        if (this.options.onToken) {
          this.options.onToken(chunk)
        }
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error)
      }
      throw error
    } finally {
      reader.releaseLock()
    }

    return this.fullText
  }

  reset() {
    this.fullText = ''
  }

  getFullText() {
    return this.fullText
  }
}
