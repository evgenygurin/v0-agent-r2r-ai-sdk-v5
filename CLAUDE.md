# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Project Overview

Next.js 15 application integrating:
- **Claude Code SDK** via Vercel AI SDK v5 (uses Claude Pro/Max subscription, no API costs)
- **R2R Agent** with hybrid RAG, knowledge graphs, and GraphRAG
- **Google Cloud R2R Deployment**: http://136.119.36.216:7272

### Key Architecture Decisions

**Why Vercel AI SDK v5 + Claude Code?**
- Unified streaming interface with automatic tool serialization
- Session management for multi-turn conversations
- Direct Claude Pro/Max access via subscription (zero inference costs)
- Note: Current `/api/chat` and `/api/agent` routes use mock implementations, real Claude Code integration requires `ANTHROPIC_API_KEY`

**Why R2R for RAG?**
- Hybrid search (vector + full-text) with RRF (Reciprocal Rank Fusion)
- Knowledge graph with automatic entity extraction
- Hatchet orchestration for async workflows
- GraphRAG for complex reasoning across document collections

**Why Next.js 15 App Router?**
- Server Components minimize bundle size
- Edge runtime for `/api/*` routes (sub-50ms cold starts)
- Built-in streaming SSR for progressive hydration
- Path aliases via `@/*` for clean imports

## 🛠️ Development Commands

```bash
# Setup
npm install                    # Install dependencies
cp .env.example .env.local     # Configure environment
npm run dev                    # Dev server → http://localhost:3000

# Quality Checks
npm run build                  # Production build (verifies no errors)
npm run lint                   # ESLint check
npx tsc --noEmit              # Type checking without emit

# Production
npm run start                  # Start production server (requires build)
```

## 📐 Code Architecture

### Directory Structure (Critical Paths)

```text
app/
├── api/                       # Edge runtime API routes
│   ├── chat/route.ts         # Direct chat (mock, needs Claude integration)
│   ├── agent/route.ts        # R2R agent with preset configs
│   ├── r2r/                  # R2R search & conversations
│   ├── documents/            # Document upload & extraction
│   ├── collections/          # Collection management
│   └── graphs/               # Knowledge graph queries
lib/
├── claude-code/              # Claude Code SDK abstractions
│   ├── provider.ts          # Centralized model initialization
│   ├── streaming.ts         # Streaming utilities
│   └── tools.ts             # Tool calling helpers
├── r2r/                     # R2R client wrapper
│   ├── client.ts           # R2RClient class (singleton)
│   ├── retry.ts            # Exponential backoff with retries
│   ├── stream-parser.ts    # SSE stream parsing
│   └── fallback.ts         # Error fallback handling
├── config/
│   ├── claude-config.ts    # Claude model presets
│   └── r2r-config.ts       # RAG configuration presets
└── types/
    ├── claude-code.ts      # Claude SDK types
    └── r2r.ts              # R2R API types
```

### Critical Patterns

**1. API Route Template (Edge Runtime)**
```typescript
export const runtime = 'edge'
export const maxDuration = 60  // For long-running R2R operations

export async function POST(req: Request) {
  const { messages, useR2R, preset } = await req.json()

  if (useR2R) {
    const r2r = getR2RClient()  // Singleton
    const config = ragPresets[preset] || ragPresets.advanced
    const response = await retryableR2RRequest(() => r2r.agent(query, config))
    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' }
    })
  }

  // Claude Code would go here (see lib/claude-code/provider.ts)
}
```

**2. R2R Client Usage (Always Use Singleton)**
```typescript
import { getR2RClient } from '@/lib/r2r/client'
import { retryableR2RRequest } from '@/lib/r2r/retry'

const r2r = getR2RClient()  // DO NOT instantiate new R2RClient()

// With automatic retry on network failures
const results = await retryableR2RRequest(() =>
  r2r.search(query, { useHybridSearch: true, limit: 10 })
)
```

**3. Streaming Response Pattern**
```typescript
// R2R streams are already in SSE format
const response = await r2r.agent(message, config)
return new Response(response.body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }
})

// For Claude Code (when integrated):
import { streamText } from 'ai'
import { claudeCode } from 'ai-sdk-provider-claude-code'

const result = streamText({
  model: claudeCode('sonnet'),
  messages,
})
return new Response(result.toDataStream())
```

**4. Type-Safe Configuration**
```typescript
import { ragPresets } from '@/lib/config/r2r-config'
import type { R2RAgentConfig } from '@/lib/types/r2r'

// Use presets, not raw configs
const config: R2RAgentConfig = ragPresets.advanced
```

## 🔧 Common Development Tasks

### Adding New API Endpoint

```bash
# 1. Create route handler
mkdir -p app/api/your-feature
touch app/api/your-feature/route.ts

# 2. Implement with edge runtime
# Use app/api/agent/route.ts as reference template

# 3. Add types to lib/types/ if needed

# 4. Test locally
curl -X POST http://localhost:3000/api/your-feature \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Working with R2R Client

```typescript
// ALWAYS: Use singleton from lib/r2r/client.ts
import { getR2RClient } from '@/lib/r2r/client'
const r2r = getR2RClient()

// ALWAYS: Wrap in retry logic for external calls
import { retryableR2RRequest } from '@/lib/r2r/retry'
const data = await retryableR2RRequest(() => r2r.search(query))

// NEVER: Direct fetch to R2R from UI components
// NEVER: New R2RClient() instantiation (breaks singleton)
```

### Knowledge Graph Workflow

```bash
# 1. Upload documents via UI or API
curl -X POST http://localhost:3000/api/documents \
  -F "file=@document.pdf"

# 2. Extract entities for specific document
curl -X POST http://localhost:3000/api/documents/{id}/extract

# 3. Build communities for GraphRAG
curl -X POST http://localhost:3000/api/graphs/communities/build

# 4. Query via /knowledge-graph page
# Supports: entities, relationships, communities
```

### Using RAG Presets

```typescript
import { ragPresets } from '@/lib/config/r2r-config'

// basic: Simple search (fast, cheap)
ragPresets.basic  // tools: ['search_file_knowledge']

// advanced: Hybrid + web (default, recommended)
ragPresets.advanced  // tools: ['search_file_knowledge', 'web_search', 'get_file_content']

// research: Deep reasoning with critique
ragPresets.research  // mode: 'research', tools: ['rag', 'reasoning', 'critique']

// deepReasoning: Maximum capability (expensive)
ragPresets.deepReasoning  // includes python_executor (sandboxed only!)
```

## ⛔️ Critical Anti-Patterns

❌ **NEVER enable `python_executor` without sandboxing**
- Security risk: arbitrary code execution
- Only use in isolated Docker containers
- Default: disabled in all presets except `deepReasoning`

❌ **NEVER fetch R2R API directly from client-side**
```typescript
// ❌ WRONG (exposes R2R_API_KEY, CORS issues)
fetch('http://136.119.36.216:7272/v3/retrieval/search', ...)

// ✅ RIGHT (proxy through Next.js API route)
fetch('/api/r2r/search', ...)
```

❌ **NEVER instantiate multiple R2RClient instances**
```typescript
// ❌ WRONG (breaks auth state, token refresh)
const r2r = new R2RClient()

// ✅ RIGHT (singleton pattern)
import { getR2RClient } from '@/lib/r2r/client'
const r2r = getR2RClient()
```

❌ **NEVER skip streaming for AI responses**
```typescript
// ❌ WRONG (blocks, high latency, poor UX)
const result = await generateText({ model, messages })
return Response.json({ text: result.text })

// ✅ RIGHT (progressive rendering)
const result = streamText({ model, messages })
return new Response(result.toDataStream())
```

## 📊 Monitoring & Health

### Dashboards

```text
R2R API:            http://136.119.36.216:7272
R2R Dashboard:      http://136.119.36.216:7273
Hatchet Dashboard:  http://136.119.36.216:7274
Vercel Analytics:   https://vercel.com/eagurins-projects/v0-claude-code-sdk
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# R2R instance health
curl http://136.119.36.216:7272/v3/health

# Metrics endpoint
curl http://localhost:3000/api/monitoring/metrics
```

## 🔐 Environment Variables

### Required

```bash
# Claude Code (optional when using subscription CLI)
ANTHROPIC_API_KEY=sk-ant-...

# R2R Instance
R2R_BASE_URL=http://136.119.36.216:7272

# Optional R2R auth (if enabled on server)
R2R_API_KEY=...
R2R_ADMIN_EMAIL=...
R2R_ADMIN_PASSWORD=...
```

Full configuration in `.env.example` (130+ variables with comments).

## 🚀 Deployment

```bash
# Automatic deployment
git push origin main  # Triggers GitHub Actions + Vercel

# Manual deployment
vercel --prod

# Environment variables: Set in Vercel Dashboard
# https://vercel.com/eagurins-projects/v0-claude-code-sdk/settings/environment-variables
```

## 📚 Documentation Map

- **Quick Start**: `docs/SETUP.md`
- **Architecture**: `docs/SYSTEM_OVERVIEW.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **R2R Deep Dive**: `docs/R2R_COMPREHENSIVE_DOCUMENTATION.md` (1700+ lines)
- **R2R Quick Config**: `docs/R2R_AGENT_CONFIG_GUIDE.md`
- **Vercel AI SDK**: `docs/VERCEL_AI_ECOSYSTEM.md`

## 🐛 Troubleshooting

**"Module not found" errors after update**
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**"R2R connection failed"**
```bash
# Check R2R health
curl http://136.119.36.216:7272/v3/health

# Verify environment
cat .env.local | grep R2R_BASE_URL
```

**Type errors in strict mode**
```bash
# Verify TypeScript config
npx tsc --noEmit

# Check path aliases (should be @/*)
cat tsconfig.json | grep paths
```

## 🎯 Key Technical Details

### Edge Runtime Constraints

All `/api/*` routes use `export const runtime = 'edge'`:
- Node.js APIs unavailable (fs, child_process, etc.)
- Streaming required for long-running operations
- Use `maxDuration` for operations >30s

### Path Alias System

```typescript
// tsconfig.json: "@/*" maps to "./*"
import { R2RClient } from '@/lib/r2r/client'         // ✅ Correct
import { R2RClient } from '../../../lib/r2r/client'  // ❌ Avoid relative paths
```

### Singleton Pattern for R2R

`lib/r2r/client.ts` exports singleton to prevent:
- Multiple auth token states
- Redundant token refresh requests
- Race conditions in parallel requests

```typescript
let r2rClientInstance: R2RClient | null = null

export function getR2RClient(): R2RClient {
  if (!r2rClientInstance) {
    r2rClientInstance = new R2RClient()
  }
  return r2rClientInstance
}
```

### R2R Authentication Flow

1. Client checks for `R2R_API_KEY` (skip auth if present)
2. Falls back to `R2R_ADMIN_EMAIL` + `R2R_ADMIN_PASSWORD`
3. Calls `/v3/users/login` → stores `access_token`
4. Auto-refreshes via `/v3/users/refresh_access_token`

## 📦 Key Dependencies

- `ai`: Vercel AI SDK v5 (streaming, tool calling)
- `ai-sdk-provider-claude-code`: Claude Code provider
- `next`: 15.5+ (App Router, Server Components)
- `react`: 19.2+ (concurrent features)
- `zod`: Runtime validation
- `swr`: Client-side data fetching

## 🔄 Git Workflow

```bash
# Commit format (single line, no signatures)
git commit -m "feat: add GraphRAG community detection"
git push origin main

# Auto-triggers:
# - GitHub Actions CI (lint, build, security)
# - Vercel deployment
# - Sentry release tracking
```

---

**🤖 Built with Claude Code SDK + R2R** | **☁️ Deployed on Vercel** | **🚀 v0.app Integration**
