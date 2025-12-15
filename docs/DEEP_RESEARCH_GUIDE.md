# Deep Research Agent Guide

## Overview

The Deep Research Agent combines R2R's multi-step reasoning capabilities with Claude Code SDK and Context7 documentation to provide comprehensive, well-researched answers to complex questions.

## Architecture

```
User Query → Intent Detection → Tool Selection → Execution → Synthesis
     ↓              ↓                ↓              ↓           ↓
  Planning    Context7 Check    R2R Research    Tool Calls   Answer
                                                              
Tools Available:
├── context7 (Documentation)
├── rag (Knowledge Base Search)
├── reasoning (Complex Analysis)
├── critique (Quality Check)
└── python_executor (Code Execution)
```

## Features

### 1. Multi-Step Reasoning

The agent breaks down complex queries into manageable steps:

1. **Planning Phase**: Analyzes query and determines research strategy
2. **Tool Selection**: Chooses appropriate tools based on query type
3. **Execution**: Runs tools in sequence or parallel
4. **Synthesis**: Combines results into coherent answer
5. **Critique**: Validates answer quality (research mode)

### 2. Context7 Integration

Automatically enriches queries mentioning frameworks/libraries:

**Auto-detected Keywords**:
- next.js, nextjs, react
- shadcn, tailwind, typescript
- vercel, app router, middleware

**Example**:
```
Query: "How do I use Next.js middleware for authentication?"

Process:
1. Detects "Next.js" and "middleware"
2. Fetches latest Next.js documentation via Context7
3. Adds documentation to research context
4. R2R Agent generates answer with current API examples
```

### 3. Streaming Interface

Real-time updates as research progresses:

**Event Types**:
- `status`: Planning, Researching, Synthesizing
- `step`: Individual research steps
- `tool`: Tool execution start/complete
- `token`: Answer text streaming
- `citation`: Source references
- `complete`: Final answer ready

### 4. Research History

Persistent localStorage-based history:

- Last 20 research sessions saved
- Quick reload of previous research
- Export results as JSON
- Copy answers and citations

## Usage Examples

### Example 1: Technical Comparison

**Query**: "Compare vector databases for multi-tenant SaaS and provide infrastructure diagram"

**Process**:
1. Planning: Identifies need for technical comparison
2. Tool: `rag` searches knowledge base for vector database docs
3. Tool: `web_search` finds latest comparisons and benchmarks
4. Tool: `reasoning` analyzes trade-offs
5. Tool: `critique` validates technical accuracy
6. Synthesis: Creates comprehensive comparison

**Expected Output**:
- Feature comparison table
- Performance benchmarks
- Architecture recommendations
- Infrastructure diagram (text-based)
- Deployment considerations

### Example 2: Framework-Specific Query

**Query**: "Show me how to implement server actions in Next.js 15"

**Process**:
1. Context7: Detects Next.js, fetches latest documentation
2. Tool: `reasoning` explains concepts
3. Synthesis: Provides step-by-step guide with code examples

**Expected Output**:
- Server actions explanation
- Type-safe implementation example
- Error handling patterns
- Best practices
- Links to official docs

### Example 3: Deep Research

**Query**: "Design a distributed caching strategy for a global CDN"

**Process**:
1. Planning: Identifies complex system design problem
2. Tool: `reasoning` breaks down requirements
3. Tool: `rag` searches for caching patterns
4. Tool: `web_search` finds CDN best practices
5. Tool: `critique` validates design decisions
6. Tool: `reasoning` analyzes consistency vs performance trade-offs
7. Synthesis: Comprehensive design with trade-off analysis

**Expected Output**:
- Cache invalidation strategies
- Consistency models (eventual vs strong)
- Geographic distribution patterns
- Performance benchmarks
- Implementation recommendations

## Configuration

### Temperature Settings

Control creativity vs consistency:

```typescript
temperature: 0.1  // Precise, deterministic
temperature: 0.5  // Balanced (default)
temperature: 0.8  // Creative, exploratory
temperature: 1.0  // Maximum creativity
```

**Recommendations**:
- Technical queries: 0.3-0.5
- Creative tasks: 0.7-0.9
- Code generation: 0.2-0.4
- Research: 0.5-0.7

### Model Selection

Currently uses Vertex AI Gemini Pro 3.0:

```typescript
model: "vertex_ai/gemini-3.0-pro"
```

**Model Characteristics**:
- Context window: 1M tokens
- Strong reasoning capabilities
- Multi-modal support
- Fast inference

### Context7 Toggle

Enable/disable automatic documentation fetching:

```typescript
useContext7: true  // Auto-fetch docs (recommended)
useContext7: false // Disable (faster for non-framework queries)
```

## API Integration

### Server-Side Usage

```typescript
import { R2RResearchAgent } from '@/lib/agent/r2rResearchAgent'

const agent = new R2RResearchAgent()

const stream = await agent.startResearch(
  "Your complex query here",
  {
    temperature: 0.7,
    model: "vertex_ai/gemini-3.0-pro",
    useContext7: true,
  }
)

// Stream events to client
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  },
})
```

### Client-Side Usage

```typescript
const response = await fetch('/api/research/deep', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Your query",
    temperature: 0.7,
    useContext7: true,
  }),
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  // Process SSE events
  const events = parseSSE(chunk)
  events.forEach(handleEvent)
}
```

## Best Practices

### Query Formulation

**Good Queries** (Specific, structured):
- "Compare X and Y for use case Z with metrics A, B, C"
- "Explain how X works in Y framework with code examples"
- "Design a solution for X that handles Y and Z constraints"

**Poor Queries** (Vague, open-ended):
- "Tell me about databases"
- "How do I code?"
- "What's the best framework?"

### Tool Selection

**Automatic** (Recommended):
- Let agent choose appropriate tools
- Research mode enables all tools
- Agent optimizes tool order

**Manual** (Advanced):
```typescript
researchTools: ["rag", "reasoning"] // Limit to specific tools
```

### Performance Optimization

1. **Cache Results**: Store frequently asked queries
2. **Limit Tools**: Use subset for faster responses
3. **Lower Temperature**: Reduce creativity for speed
4. **Disable Context7**: For non-framework queries

### Error Handling

Agent includes automatic retry logic:

```typescript
try {
  const result = await agent.startResearch(query)
} catch (error) {
  if (error.message.includes('timeout')) {
    // Retry with shorter timeout
  } else if (error.message.includes('rate limit')) {
    // Wait and retry
  } else {
    // Fall back to Claude Code
  }
}
```

## Monitoring

### Via UI

- **Answer Tab**: Real-time answer streaming
- **Reasoning Tab**: Step-by-step process
- **Sources Tab**: Citations and references
- **Graph Tab**: Knowledge graph (coming soon)

### Via API

```typescript
// Research metrics
const metrics = {
  duration: endTime - startTime,
  stepsCount: steps.length,
  toolsUsed: toolsUsed.length,
  citationsCount: citations.length,
  tokensUsed: finalAnswer.length / 4, // Rough estimate
}

console.log('Research metrics:', metrics)
```

### Via Hatchet Dashboard

Monitor workflow execution:

1. Open http://136.119.36.216:7274
2. View active research jobs
3. Check tool execution times
4. Monitor failure rates

## Troubleshooting

### Slow Responses

**Causes**:
- R2R instance overloaded
- Large document corpus
- Complex multi-step reasoning
- Context7 timeout

**Solutions**:
- Reduce tool count
- Lower temperature
- Increase timeout values
- Cache common queries

### Incomplete Answers

**Causes**:
- Insufficient context in knowledge base
- Tool execution failures
- Network timeouts

**Solutions**:
- Add more documents to R2R
- Enable web search tool
- Check R2R dashboard for errors

### Context7 Errors

**Causes**:
- Library not found
- API rate limit
- Network issues

**Solutions**:
- Manually specify library name
- Disable Context7 temporarily
- Check Context7 MCP status

## Advanced Features

### Custom Tool Development

Create domain-specific tools:

```typescript
class CustomResearchTool {
  async execute(query: string) {
    // Your custom logic
    return result
  }
}

// Register with agent
agent.registerTool('custom_tool', new CustomResearchTool())
```

### Response Formatting

Control output format:

```typescript
const agent = new R2RResearchAgent({
  outputFormat: 'markdown', // or 'json', 'html'
  includeMetadata: true,
  includeCitations: true,
})
```

### Multi-Language Support

Configure for non-English queries:

```typescript
const agent = new R2RResearchAgent({
  language: 'es', // Spanish
  translateResults: true,
})
```

## Example Queries

See [lib/examples/research-queries.ts](../lib/examples/research-queries.ts) for comprehensive examples organized by category:

- **Technical**: Architecture, comparisons, implementations
- **Business**: Analysis, strategy, data-driven insights
- **Code Generation**: Algorithms, frameworks, patterns
- **Deep Reasoning**: Complex systems, trade-off analysis
- **Documentation**: Framework-specific, API usage

## Resources

- **R2R Documentation**: https://r2r-docs.sciphi.ai
- **Context7 MCP**: https://github.com/upstash/context7
- **AI SDK v5**: https://sdk.vercel.ai
- **Vertex AI**: https://cloud.google.com/vertex-ai

## Next Steps

1. Try example queries to understand capabilities
2. Experiment with temperature settings
3. Review reasoning steps to understand process
4. Build domain-specific knowledge base in R2R
5. Create custom tools for your use case

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0
