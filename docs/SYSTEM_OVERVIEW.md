# Claude Code SDK + AI SDK v5 + R2R Integration: System Overview

## Executive Summary

This document provides a comprehensive overview of the integration between Vercel AI SDK v5, Claude Code SDK, and R2R (Retrieval to Riches) deployed on Google Cloud. The system combines Claude's Pro/Max subscription capabilities with R2R's advanced RAG features to deliver production-ready AI applications with knowledge graph support, agentic workflows, and real-time monitoring.

## System Architecture

### Deployment Infrastructure

**Current Production Environment:**
- **R2R API Server**: http://136.119.36.216:7272
- **R2R Dashboard**: http://136.119.36.216:7273
- **Hatchet Orchestration**: http://136.119.36.216:7274
- **Deployment**: Docker Compose on Google Cloud Compute Engine
- **Stack**: PostgreSQL + pgvector, Hatchet workflow engine, R2R full deployment

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
│  (Next.js + React + Vercel AI SDK v5)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐          ┌────────▼─────────┐
│  Claude Code   │          │   R2R Agent      │
│  SDK Provider  │          │   (RAG + KG)     │
│  (Anthropic)   │          │                  │
└───────┬────────┘          └────────┬─────────┘
        │                            │
        │                   ┌────────▼─────────┐
        │                   │  PostgreSQL +    │
        │                   │  pgvector        │
        │                   └────────┬─────────┘
        │                            │
        └────────────┬───────────────┘
                     │
            ┌────────▼─────────┐
            │  Hatchet         │
            │  Orchestration   │
            └──────────────────┘
```

### Integration Flow

1. **User Query** → Next.js API Route
2. **Route Processing** → Hybrid Agent (decides Claude Code vs R2R)
3. **Claude Code Path** → Direct LLM interaction for general queries
4. **R2R Path** → Knowledge retrieval + RAG for domain-specific queries
5. **Response Streaming** → Real-time UI updates
6. **Monitoring** → Hatchet dashboard tracks all workflows

## Core Components

### 1. Claude Code SDK Provider

**Purpose**: Provides access to Claude Pro/Max subscription features via Vercel AI SDK v5

**Key Features**:
- Model selection: Haiku (fast), Sonnet (balanced), Opus (maximum capability)
- Extended context windows (Pro/Max features)
- Thinking/reasoning capabilities enabled
- Streaming response support
- Tool calling for R2R integration

**Configuration**:
```typescript
import { claudeCode } from 'ai-sdk-provider-claude-code'

const model = claudeCode('sonnet', {
  temperature: 0.7,
  maxTokens: 4096,
  thinkingEnabled: true,
  extendedContext: true,
})
```

### 2. R2R Agent System

**Purpose**: Production-ready RAG system with knowledge graphs and agentic workflows

**Key Features**:
- **Hybrid Search**: Combines vector + keyword search with RRF ranking
- **Knowledge Graphs**: Entity extraction, relationship mapping, community detection
- **Agentic RAG**: Multi-step reasoning with tool calling
- **Document Management**: Ingestion, chunking, enrichment, deduplication
- **Access Control**: User/collection-based permissions
- **Orchestration**: Long-running workflows via Hatchet

**R2R Modes**:
- **RAG Mode**: Standard retrieval-augmented generation
- **Research Mode**: Advanced reasoning with critique and validation

### 3. Hatchet Orchestration Engine

**Purpose**: Manages long-running workflows and background tasks

**Key Features**:
- Workflow visualization and monitoring
- Task queue management
- Failure recovery and retries
- Event-driven architecture
- Real-time status tracking

**Workflows**:
- Knowledge graph extraction
- Community detection (GraphRAG)
- Document enrichment
- Batch processing operations

## R2R Core Capabilities

### Document Management

**Documents** are the central container for all content in R2R:

```typescript
// Ingest document
const result = await client.documents.create({
  file: document,
  metadata: { source: 'user_upload' },
  collectionIds: ['collection-uuid'],
})

// Extract knowledge graph
await client.documents.extract(documentId)

// Deduplicate entities
await client.documents.deduplicate(documentId)
```

**Document Lifecycle**:
1. **Ingestion** → File uploaded and parsed
2. **Chunking** → Split into semantic chunks
3. **Embedding** → Vector representations generated
4. **Extraction** → Entities and relationships identified
5. **Deduplication** → Duplicate entities merged
6. **Enrichment** → Context added to chunks

### Collections

**Collections** provide logical grouping and access control:

```typescript
// Create collection
const collection = await client.collections.create({
  name: 'Technical Documentation',
  description: 'Product docs and API references',
})

// Add documents
await client.collections.addDocument(collectionId, documentId)

// Extract knowledge for all documents
await client.collections.extract(collectionId)
```

**Use Cases**:
- Multi-tenant data isolation
- Team-based document sharing
- Project-specific knowledge bases
- Access control boundaries

### Conversations

**Conversations** maintain chat history and context:

```typescript
// Create conversation
const conversation = await client.conversations.create()

// Send message with context
const response = await client.retrieval.agent({
  message: { content: query },
  conversationId: conversation.id,
  mode: 'rag',
})

// List conversation history
const history = await client.conversations.list()
```

**Features**:
- Persistent chat history
- Context-aware responses
- User-specific conversations
- Conversation branching

### Deduplication

**Entity Deduplication** improves knowledge graph quality:

**Techniques**:
- Exact name matching (current)
- N-character block matching (planned)
- Semantic similarity (planned)
- Fuzzy name matching (planned)

**Deduplication Process**:
1. Identify duplicate entities by name
2. Merge entity descriptions using LLM
3. Consolidate metadata and categories
4. Redirect all relationships to merged entity
5. Update embeddings

```typescript
// Deduplicate document entities
await client.documents.deduplicate(documentId)
```

### Knowledge Graphs

**Knowledge Graphs** enable relationship-aware retrieval:

**Components**:
- **Entities**: People, places, concepts, organizations
- **Relationships**: Connections between entities
- **Communities**: Clustered entity groups
- **Triples**: Subject-Predicate-Object relationships

**Workflow**:
```typescript
// 1. Extract entities and relationships
await client.documents.extract(documentId)

// 2. Build communities (GraphRAG)
await client.graphs.buildCommunities(collectionId)

// 3. Search with graph context
const results = await client.retrieval.search({
  query: 'company leadership structure',
  graphSearchSettings: {
    enabled: true,
    includeEntities: true,
  },
})
```

**GraphRAG Benefits**:
- Relationship-aware responses
- Multi-hop reasoning
- Entity disambiguation
- Hierarchical understanding

### Prompts

**Prompt Management** enables customization:

```typescript
// Add custom prompt
await client.prompts.add({
  name: 'technical_rag',
  template: 'You are a technical expert...',
  inputTypes: { context: 'string', query: 'string' },
})

// Use in RAG
await client.retrieval.rag({
  query,
  ragGenerationConfig: {
    promptName: 'technical_rag',
  },
})
```

**Default Prompts**:
- `default_rag`: Standard RAG responses
- `default_system`: System behavior
- `graphrag`: Graph-aware responses
- `hyde`: Hypothetical document embeddings

### Users & Authentication

**User Management** provides access control:

```typescript
// Register user
await client.users.register(email, password)

// Login
const tokens = await client.users.login(email, password)

// User-specific search
const results = await client.retrieval.search({
  query,
  filters: { userId: currentUserId },
})
```

**Authentication Modes**:
- JWT-based authentication
- Supabase integration (optional)
- Default admin mode (development)
- Superuser capabilities

## Advanced RAG Techniques

### Hybrid Search

Combines vector search (semantic) with keyword search (lexical):

```typescript
const results = await client.retrieval.search({
  query: 'machine learning models',
  searchSettings: {
    useHybridSearch: true,
    limit: 20,
  },
})
```

**How It Works**:
1. Vector search finds semantically similar chunks
2. Keyword search finds exact/fuzzy matches
3. Reciprocal Rank Fusion (RRF) merges results
4. Final ranking by combined score

### HyDE (Hypothetical Document Embeddings)

Generates hypothetical answer, then searches:

```typescript
const results = await client.retrieval.rag({
  query: 'How does OAuth work?',
  ragGenerationConfig: {
    useHyde: true,
  },
})
```

**Process**:
1. LLM generates hypothetical answer
2. Embed hypothetical answer
3. Search with hypothetical embedding
4. Generate final answer from retrieved context

### RAG-Fusion

Generates multiple query variations:

```typescript
const results = await client.retrieval.rag({
  query: 'API authentication best practices',
  ragGenerationConfig: {
    useFusion: true,
    fusionQueries: 3,
  },
})
```

**Process**:
1. Generate 3-5 query variations
2. Search with each variation
3. Merge results using RRF
4. Generate answer from combined context

### Agentic RAG

Multi-step reasoning with tool calling:

```typescript
const response = await client.retrieval.agent({
  message: { content: query },
  mode: 'research',
  researchTools: ['rag', 'reasoning', 'critique'],
  ragGenerationConfig: {
    stream: true,
  },
})
```

**Research Tools**:
- **rag**: Search knowledge base
- **reasoning**: Complex analytical thinking
- **critique**: Validate and improve responses
- **python_executor**: Execute code (optional)

## Monitoring & Observability

### Health Checks

```typescript
// System health
const health = await fetch('http://136.119.36.216:7272/v3/health')

// Component status
const status = {
  r2r: await checkR2RHealth(),
  postgres: await checkDatabaseHealth(),
  hatchet: await checkHatchetHealth(),
}
```

### Hatchet Dashboard

**Access**: http://136.119.36.216:7274

**Features**:
- Real-time workflow monitoring
- Task execution logs
- Failure tracking and retries
- Performance metrics
- Event-driven architecture visualization

**Key Metrics**:
- Workflow completion rate
- Average execution time
- Active/pending tasks
- Error frequency
- Resource utilization

### R2R Dashboard

**Access**: http://136.119.36.216:7273

**Features**:
- Document status tracking
- Collection management
- User administration
- Search analytics
- Knowledge graph visualization

## Performance Optimization

### Caching Strategy

```typescript
// Redis-based caching
const cachedResult = await redis.get(cacheKey)
if (cachedResult) return cachedResult

const result = await r2rSearch(query)
await redis.setex(cacheKey, 3600, JSON.stringify(result))
```

### Connection Pooling

Reuse R2R client connections:

```typescript
const clientPool = new ConnectionPool({
  size: 5,
  baseUrl: process.env.R2R_BASE_URL,
})
```

### Request Batching

Batch multiple operations:

```typescript
const results = await Promise.all([
  client.retrieval.search({ query: q1 }),
  client.retrieval.search({ query: q2 }),
  client.retrieval.search({ query: q3 }),
])
```

### Vector Indices

Optimize large-scale search:

```typescript
// Create HNSW index for fast vector search
await client.system.createVectorIndex({
  collectionId,
  indexType: 'hnsw',
  efConstruction: 200,
  m: 16,
})
```

## Security Considerations

### Authentication

- JWT token-based authentication
- Token refresh mechanism
- Secure token storage (httpOnly cookies)
- CORS configuration for API access

### Access Control

- User-level permissions
- Collection-based isolation
- Document-level access control
- Superuser capabilities for admins

### Network Security

- Reverse proxy with SSL/TLS (production)
- IP whitelisting
- Rate limiting
- API key rotation

### Data Security

- Encryption at rest (PostgreSQL)
- Encryption in transit (HTTPS)
- Secure environment variable management
- Audit logging

## Deployment Best Practices

### Environment Variables

```env
# Claude Code
ANTHROPIC_API_KEY=sk-ant-xxx

# R2R Instance
R2R_BASE_URL=http://136.119.36.216:7272
R2R_API_KEY=xxx

# Optional: Authentication
R2R_ADMIN_EMAIL=admin@example.com
R2R_ADMIN_PASSWORD=xxx
```

### Scaling Strategies

**Horizontal Scaling**:
- Load balancer in front of R2R instances
- Multiple R2R replicas
- Shared PostgreSQL database

**Vertical Scaling**:
- Increase GCE instance size
- Optimize PostgreSQL configuration
- Add more memory/CPU

**Database Optimization**:
- Vector index optimization
- Query performance tuning
- Connection pooling
- Read replicas for analytics

### Monitoring Setup

```typescript
// Application metrics
const metrics = {
  requestLatency: histogram(),
  errorRate: counter(),
  activeUsers: gauge(),
  tokenUsage: counter(),
}

// Export to monitoring service
await exportMetrics(metrics)
```

## Integration Patterns

### Hybrid Agent Pattern

Intelligent routing between Claude Code and R2R:

```typescript
async function hybridAgent(query: string) {
  const intent = await classifyIntent(query)
  
  if (intent.requiresKnowledge) {
    // Use R2R for knowledge-based queries
    return await r2rAgent(query)
  } else {
    // Use Claude Code for general queries
    return await claudeCodeAgent(query)
  }
}
```

### Fallback Pattern

Graceful degradation when services fail:

```typescript
async function resilientAgent(query: string) {
  try {
    return await r2rAgent(query)
  } catch (r2rError) {
    console.warn('R2R unavailable, using Claude Code')
    return await claudeCodeAgent(query)
  }
}
```

### Streaming Pattern

Real-time response updates:

```typescript
const stream = await client.retrieval.agent({
  message: { content: query },
  ragGenerationConfig: { stream: true },
})

for await (const chunk of stream) {
  if (chunk.type === 'content') {
    process(chunk.delta)
  }
}
```

## Troubleshooting Guide

### Common Issues

**Connection Errors**:
- Verify R2R instance is running
- Check network connectivity
- Validate environment variables
- Test health endpoint

**Authentication Failures**:
- Refresh expired tokens
- Verify API keys
- Check user permissions
- Review CORS configuration

**Performance Issues**:
- Enable caching
- Add vector indices
- Optimize queries
- Scale infrastructure

**Knowledge Graph Problems**:
- Run extraction on documents
- Check deduplication status
- Verify community building
- Review entity quality

## Next Steps

1. **Review**: [API Reference](./API_REFERENCE.md)
2. **Setup**: [Installation Guide](./SETUP.md)
3. **Deploy**: Follow deployment checklist
4. **Monitor**: Configure dashboards
5. **Optimize**: Implement caching and indexing

## Resources

- **R2R Documentation**: https://r2r-docs.sciphi.ai
- **Claude Code SDK**: https://github.com/ben-vargas/ai-sdk-provider-claude-code
- **AI SDK v5**: https://sdk.vercel.ai
- **Hatchet Docs**: https://docs.hatchet.run
- **R2R GitHub**: https://github.com/SciPhi-AI/R2R

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-15  
**Maintained By**: Development Team
