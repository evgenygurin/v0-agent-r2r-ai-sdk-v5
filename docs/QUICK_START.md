# Quick Start Guide

Get started with the R2R Deep Research Agent in 5 minutes.

## Step 1: Environment Setup

Create `.env.local`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxx
R2R_BASE_URL=http://136.119.36.216:7272

# Optional (for production)
R2R_API_KEY=your_api_key
CONTEXT7_API_KEY=your_context7_key
```

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 3: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Try Your First Research Query

1. Click on "Research Agent" in the sidebar
2. Adjust temperature (0.7 recommended for first try)
3. Leave "Use Context7" enabled
4. Enter this query:

```
Compare Next.js App Router and Pages Router for a large-scale application.
Include performance considerations and migration complexity.
```

5. Click "Start Research"
6. Watch the real-time research process:
   - **Planning**: Agent strategizes approach
   - **Tool Calls**: Context7 fetches Next.js docs
   - **Reasoning**: Analyzes trade-offs
   - **Answer**: Streams comprehensive response

## Step 5: Explore Different Research Types

### Technical Comparison
```
Compare PostgreSQL and MongoDB for a multi-tenant SaaS platform
```

### Framework Documentation
```
Show me how to implement middleware in Next.js 15 with TypeScript
```

### System Design
```
Design a scalable WebSocket architecture for a real-time chat application
```

### Code Generation
```
Create a TypeScript rate limiter using the sliding window algorithm
```

## Understanding the Interface

### Left Panel: Configuration
- **Temperature Slider**: Control creativity (0 = precise, 1 = creative)
- **Context7 Toggle**: Auto-fetch documentation for frameworks
- **History Button**: Access previous research sessions

### Center Tabs

1. **Answer Tab**: Final comprehensive answer
   - Real-time streaming
   - Copy to clipboard
   - Export as JSON

2. **Reasoning Tab**: Research process
   - Planning steps
   - Tool execution
   - Intermediate findings
   - Timestamps for each step

3. **Sources Tab**: Citations
   - Source titles and URLs
   - Relevant snippets
   - Domain badges
   - Copy all citations

4. **Graph Tab**: Knowledge connections
   - Coming soon: Interactive graph visualization

### Research Status Panel
- Current status (planning/researching/complete)
- Duration counter
- Steps completed
- Citations found
- Tools used count

## Next Steps

- Read the [Deep Research Guide](./DEEP_RESEARCH_GUIDE.md) for advanced usage
- Check [Example Queries](../lib/examples/research-queries.ts) for more ideas
- Explore the [System Overview](./SYSTEM_OVERVIEW.md) to understand architecture
- Set up [monitoring dashboards](./SETUP.md#monitoring)

## Common Issues

### "Research request failed"
- Check R2R instance is running at 136.119.36.216:7272
- Verify ANTHROPIC_API_KEY is valid
- Try again with lower temperature

### Slow responses
- Disable Context7 for non-framework queries
- Reduce temperature to 0.3-0.5
- Check Hatchet dashboard at :7274

### Missing citations
- Enable web search in R2R configuration
- Upload relevant documents to R2R
- Check R2R dashboard at :7273

## Support

- Review [Troubleshooting Guide](./SYSTEM_OVERVIEW.md#troubleshooting-guide)
- Check [API Reference](./API_REFERENCE.md)
- Visit R2R Dashboard: http://136.119.36.216:7273
- Monitor Hatchet: http://136.119.36.216:7274

---

Ready to build amazing AI applications with deep research capabilities!
