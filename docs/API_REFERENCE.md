# API Reference

## Endpoints

### POST /api/chat
Direct Claude Code integration without R2R.

**Request:**
\`\`\`json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
\`\`\`

**Response:** Server-Sent Events stream

### POST /api/agent
Unified agent endpoint with R2R integration.

**Request:**
\`\`\`json
{
  "messages": [
    { "role": "user", "content": "Search documents" }
  ],
  "useR2R": true,
  "conversationId": "uuid",
  "r2rConfig": {
    "mode": "research",
    "researchTools": ["rag", "reasoning"]
  }
}
\`\`\`

**Response:** Server-Sent Events stream

### GET /api/health
Health check for all services.

**Response:**
\`\`\`json
[
  {
    "service": "r2r",
    "status": "healthy",
    "responseTime": 45,
    "timestamp": "2025-01-15T..."
  },
  {
    "service": "claude-code",
    "status": "healthy",
    "responseTime": 12,
    "timestamp": "2025-01-15T..."
  }
]
\`\`\`

## Configuration Presets

### RAG Presets
- `basic`: Simple search with minimal tools
- `advanced`: Hybrid search + web capabilities
- `research`: Deep reasoning with critique
- `deepReasoning`: Full capabilities including Python executor

### Claude Presets
- `fast`: Haiku model, quick responses
- `balanced`: Sonnet model, recommended
- `powerful`: Opus model, maximum capability
