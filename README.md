# Claude Code SDK + R2R Integration

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/eagurins-projects/v0-claude-code-sdk)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/nx66f195Mey)

## Overview

Full-stack AI agent platform integrating Vercel AI SDK v5, Claude Code SDK, and R2R (Retrieval-Augmented Generation) deployed on Google Cloud.

### Features

- **Chat Interface**: Conversational AI with Claude Code and R2R agent
- **Document Management**: Upload, process, and extract entities from documents
- **Collections**: Organize documents into logical collections
- **Knowledge Graph**: Visualize entities, relationships, and communities
- **Monitoring**: Real-time health checks and metrics via R2R and Hatchet dashboards

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  (Vercel AI SDK v5 + Claude Code Provider)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐          ┌────────▼─────────┐
│  Claude Code   │          │   R2R Agent      │
│  SDK (Haiku/   │          │   (RAG + KG)     │
│  Sonnet/Opus)  │          │                  │
└────────────────┘          └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  PostgreSQL +    │
                            │  pgvector        │
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Hatchet         │
                            │  Orchestration   │
                            └──────────────────┘
```

## Deployment

### Current Production Environment

- **R2R API**: http://136.119.36.216:7272
- **R2R Dashboard**: http://136.119.36.216:7273
- **Hatchet Dashboard**: http://136.119.36.216:7274
- **Stack**: Docker Compose on Google Cloud

Your project is live at:

**[https://vercel.com/eagurins-projects/v0-claude-code-sdk](https://vercel.com/eagurins-projects/v0-claude-code-sdk)**

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key (Claude Pro/Max)
- R2R instance running (already deployed)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Claude Code SDK
ANTHROPIC_API_KEY=sk-ant-xxx

# R2R Instance
R2R_BASE_URL=http://136.119.36.216:7272
R2R_API_KEY=your_r2r_api_key

# Optional: R2R Authentication
R2R_ADMIN_EMAIL=admin@example.com
R2R_ADMIN_PASSWORD=your_password
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Chat with AI Agent

1. Navigate to the Chat page
2. Toggle between Claude Code and R2R Agent
3. Select preset configuration (fast, balanced, powerful, research)
4. Start chatting

### Document Management

1. Go to Documents page
2. Upload files (PDF, TXT, etc.)
3. Extract entities for knowledge graph
4. View processing status

### Collections

1. Create collections to organize documents
2. Add documents to collections
3. Extract entities for entire collection
4. Scope searches to specific collections

### Knowledge Graph

1. Select a collection
2. View extracted entities, relationships, and communities
3. Build communities for GraphRAG
4. Explore graph structure

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API_REFERENCE.md)
- [System Overview](docs/SYSTEM_OVERVIEW.md)
- [R2R Components](docs/R2R_COMPONENTS.md)

## Configuration

### RAG Presets

- `basic` - Simple document search
- `advanced` - Hybrid search with web capabilities
- `research` - Deep reasoning with critique
- `deepReasoning` - Full research mode

### Claude Models

- `haiku` - Fast, cost-effective
- `sonnet` - Balanced (recommended)
- `opus` - Maximum capability

## Monitoring

- **R2R Dashboard**: View conversations, documents, system health
- **Hatchet Dashboard**: Monitor workflows, job status
- **Health API**: `/api/health` for service status

## Build your app

Continue building your app on:

**[https://v0.app/chat/nx66f195Mey](https://v0.app/chat/nx66f195Mey)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Troubleshooting

1. **R2R Connection Issues**: Verify R2R_BASE_URL and network access
2. **Authentication Errors**: Check API keys and credentials
3. **Performance**: Enable caching, optimize queries
4. **Knowledge Graph**: Run extraction before querying

## Resources

- [R2R Documentation](https://r2r-docs.sciphi.ai)
- [Claude Code SDK](https://github.com/ben-vargas/ai-sdk-provider-claude-code)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [Hatchet Docs](https://docs.hatchet.run)

## License

MIT
