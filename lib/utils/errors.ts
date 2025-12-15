// Custom error classes for better error handling

export class R2RError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'R2RError'
  }
}

export class ClaudeCodeError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ClaudeCodeError'
  }
}

export class MCPError extends Error {
  constructor(
    message: string,
    public serverName: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'MCPError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function isR2RError(error: unknown): error is R2RError {
  return error instanceof R2RError
}

export function isClaudeCodeError(error: unknown): error is ClaudeCodeError {
  return error instanceof ClaudeCodeError
}

export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
