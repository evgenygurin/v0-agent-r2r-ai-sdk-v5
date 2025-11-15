# Claude Code SDK + R2R Integration Setup Guide

## Overview

This project integrates:
- **Claude Code SDK** via AI SDK v5 (Pro/Max subscription features)
- **R2R Agent** (Agentic RAG with reasoning capabilities)
- **Google Cloud R2R Deployment** at 136.119.36.216

## Prerequisites

1. **Anthropic API Key** with Claude Pro/Max subscription
2. **R2R Instance** running on Google Cloud (already deployed)
3. **Node.js 18+** and npm/pnpm/yarn

## Installation

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

## Environment Variables

Create `.env.local` file:

\`\`\`env
# Claude Code SDK
ANTHROPIC_API_KEY=sk-ant-xxx

# R2R Instance
R2R_BASE_URL=http://136.119.36.216:7272
R2R_API_KEY=your_r2r_api_key

# Optional: R2R Authentication
R2R_ADMIN_EMAIL=admin@example.com
R2R_ADMIN_PASSWORD=your_password
\`\`\`

## Available Endpoints

### R2R Services
- API: http://136.119.36.216:7272
- Dashboard: http://136.119.36.216:7273
- Hatchet: http://136.119.36.216:7274

### Local Development
- App: http://localhost:3000
- Health Check: http://localhost:3000/api/health

## Configuration Presets

### RAG Modes
- `basic` - Simple document search
- `advanced` - Hybrid search with web capabilities
- `research` - Deep reasoning with critique
- `deepReasoning` - Full research mode with Python executor

### Claude Models
- `haiku` - Fast responses, lower cost
- `sonnet` - Balanced performance (recommended)
- `opus` - Maximum capability

## Usage

\`\`\`typescript
// Using R2R Agent
const response = await fetch('/api/agent', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Your query' }],
    useR2R: true,
    r2rConfig: { mode: 'research' },
  }),
})

// Using Claude Code directly
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Your query' }],
  }),
})
\`\`\`

## Monitoring

- **R2R Dashboard**: View conversation history, document status
- **Hatchet Dashboard**: Monitor workflow execution, job status
- **Health Endpoint**: Check service availability at `/api/health`

## Troubleshooting

1. **R2R Connection Failed**
   - Verify R2R_BASE_URL is accessible
   - Check network connectivity to 136.119.36.216
   - Confirm R2R instance is running

2. **Authentication Issues**
   - Verify ANTHROPIC_API_KEY is valid
   - Check R2R_API_KEY if authentication required
   - Review R2R auth configuration

3. **Performance Issues**
   - Monitor Hatchet dashboard for workflow bottlenecks
   - Check R2R dashboard for query performance
   - Consider enabling caching with Upstash Redis

## Next Steps

1. Run `npm run dev` to start development server
2. Visit http://localhost:3000 to see the chat interface
3. Monitor dashboards at provided URLs
4. Review API routes in `app/api/` directory
