// MCP Server types and configurations

export interface MCPServerConfig {
  name: string
  enabled: boolean
  transport: 'stdio' | 'http' | 'sse'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export interface MCPToolCall {
  toolName: string
  arguments: any
  timestamp: Date
}

export interface MCPToolResult {
  success: boolean
  result?: any
  error?: string
  metadata?: Record<string, any>
}

export const mcpServers: Record<string, MCPServerConfig> = {
  codegen: {
    name: 'codegen',
    enabled: true,
    transport: 'stdio',
    command: 'uvx',
    args: [
      '--from',
      'git+https://github.com/codegen-sh/codegen-sdk.git#egg=codegen-mcp-server&subdirectory=codegen-examples/examples/codegen-mcp-server',
      'codegen-mcp-server',
    ],
  },
  context7: {
    name: 'context7',
    enabled: true,
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
  },
  linear: {
    name: 'linear',
    enabled: true,
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-linear'],
    env: {
      LINEAR_API_KEY: process.env.LINEAR_API_KEY || '',
    },
  },
  github: {
    name: 'github',
    enabled: true,
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    },
  },
}
