# R2R (Retrieval to Riches) - Comprehensive Documentation Overview

## Executive Summary

R2R is a production-ready AI retrieval system developed by SciPhi AI that implements state-of-the-art Agentic Retrieval-Augmented Generation (RAG) with a RESTful API. It combines vector search, full-text search, knowledge graphs, and multi-step reasoning capabilities to create intelligent, context-aware retrieval systems.

**Key Capabilities:**
- Multi-modal content ingestion (text, PDFs, images, audio, video)
- Hybrid search (vector + full-text)
- Knowledge graph construction and querying
- Agentic RAG with reasoning and custom tools
- Collection-based document organization
- Production-ready orchestration with Hatchet

---

## 1. AGENTIC RAG

### Core Concept

R2R's Agentic RAG orchestrates multi-step reasoning with Retrieval-Augmented Generation by combining large language models with retrieval and tool integrations. The system enables agents to fetch relevant data from the internet, documents, and knowledge graphs, reason over it, and produce robust, context-aware answers.

### Operating Modes

#### 1. **RAG Mode (Default)**
Standard approach providing:
- Semantic and hybrid search capabilities
- Document/chunk-level retrieval
- Optional web search integrations (Serper and Firecrawl)
- Source citations

#### 2. **Research Mode**
Advanced alternative offering:
- All RAG capabilities
- Dedicated reasoning system for complex problem-solving
- Critique abilities
- Python code execution
- Multi-step reasoning for deeper exploration

### Available Tools

#### RAG Mode Tools
| Tool | Purpose | Requirements |
|------|---------|--------------|
| `search_file_knowledge` | Semantic/hybrid search on ingested documents | - |
| `search_file_descriptions` | Search file-level metadata | - |
| `get_file_content` | Fetch entire documents or chunk structures | - |
| `web_search` | Query external APIs | SERPER_API_KEY |
| `web_scrape` | Extract web page content | FIRECRAWL_API_KEY |

#### Research Mode Tools
| Tool | Purpose |
|------|---------|
| `rag` | Leverage underlying RAG agent |
| `reasoning` | Call dedicated model for analytical thinking |
| `critique` | Analyze conversation history for flaws and biases |
| `python_executor` | Execute Python for calculations |

### Configuration Parameters

```python
# Generation configuration
generation_config = {
    "model": "gpt-4o",  # Model selection
    "temperature": 0.7,  # Response randomness
    "max_tokens": 2048,  # Token limits
    "stream": True,  # Enable streaming
    "thinking_budget": 10000  # Extended thinking budget for research mode
}
```

### Multi-Turn Conversations

Include `conversation_id` in requests to maintain dialogue context across multiple turns:

```python
response = client.retrieval.agent(
    messages=[{"role": "user", "content": "Your query"}],
    conversation_id="unique-conversation-id",
    rag_generation_config=generation_config
)
```

### Streaming Events

R2R supports specialized streaming event types:
- `ThinkingEvent` - Agent reasoning process
- `ToolCallEvent` - Tool invocation
- `ToolResultEvent` - Tool execution results
- `ResponseEvent` - Final response chunks

### Best Practices

1. **Tool Selection**: Use RAG mode for straightforward retrieval, Research mode for complex analytical tasks
2. **Conversation Management**: Maintain conversation IDs for context-aware multi-turn interactions
3. **Model Selection**: Choose appropriate models based on reasoning depth requirements
4. **Streaming**: Enable streaming for real-time feedback on long-running queries

### API Example

```python
# Basic RAG agent call
response = client.retrieval.agent(
    messages=[
        {"role": "user", "content": "What are the key findings about climate change?"}
    ],
    rag_generation_config={
        "model": "gpt-4o",
        "temperature": 0.5
    }
)

# Research mode with extended reasoning
response = client.retrieval.agent(
    messages=[
        {"role": "user", "content": "Analyze the economic impact of renewable energy"}
    ],
    mode="research",
    rag_generation_config={
        "model": "claude-3-opus",
        "thinking_budget": 15000
    }
)
```

---

## 2. HYBRID SEARCH

### Core Architecture

R2R's hybrid search blends keyword-based full-text search with semantic vector search, delivering results that are both contextually relevant and precise.

### Search Components

#### 1. **Full-Text Search**
- Leverages PostgreSQL's `ts_rank_cd` and `websearch_to_tsquery` functions
- Identifies documents containing specific keywords
- Excels at exact term matching and terminology-critical retrieval

#### 2. **Semantic Search**
- Uses vector embeddings to locate contextually related documents
- Finds relevant content even without exact keyword matches
- Captures meaning and intent beyond literal terms

### Reciprocal Rank Fusion (RRF)

R2R combines results using RRF algorithm:

```text
Score = (1.0 / (rrf_k + full_text_rank)) × full_text_weight +
        (1.0 / (rrf_k + semantic_rank)) × semantic_weight
```

**Key Parameters:**
- `rrf_k`: Smoothing constant (default: 50)
- `full_text_weight`: Weight for keyword matching (default: 1.0)
- `semantic_weight`: Weight for semantic similarity (default: 5.0)
- `full_text_limit`: Max full-text results before fusion (default: 200)

### Search Modes

#### 1. **Basic Mode**
Semantic search only for straightforward scenarios prioritizing contextual understanding.

#### 2. **Advanced Mode**
Hybrid search automatically enabled with well-tuned defaults for immediate hybrid capabilities.

#### 3. **Custom Mode**
Full control over settings:

```python
search_settings = {
    "use_semantic_search": True,
    "use_fulltext_search": True,
    "use_hybrid_search": True,
    "hybrid_settings": {
        "full_text_weight": 1.0,
        "semantic_weight": 5.0,
        "full_text_limit": 200,
        "rrf_k": 50
    },
    "limit": 10  # Total results to return
}

results = client.retrieval.search(
    query="Your search query",
    search_settings=search_settings
)
```

### Best Practices

1. **Database Optimization**: Maintain optimal PostgreSQL indexing and vector store configurations
2. **Parameter Tuning**: Adjust weights and RRF-k values based on domain-specific needs
3. **Index Maintenance**: Keep embeddings and indexes current for sustained quality
4. **Model Selection**: Choose domain-appropriate embedding models for superior semantic results
5. **Weight Balancing**: Higher semantic_weight (e.g., 5.0) for conceptual queries, balanced weights for terminology-heavy domains

### Performance Considerations

- Full-text search is fast but limited to exact/fuzzy matches
- Semantic search is slower but provides better contextual understanding
- Hybrid search offers best of both worlds with moderate performance impact
- Use `full_text_limit` to control computational cost of fusion

### Integration with RAG

```python
# Hybrid search in RAG workflow
response = client.retrieval.rag(
    query="Explain machine learning concepts",
    search_settings={
        "use_hybrid_search": True,
        "limit": 5
    },
    rag_generation_config={
        "model": "gpt-4o"
    }
)
```

---

## 3. ADVANCED RAG TECHNIQUES

### Supported Techniques

R2R implements two primary advanced RAG methodologies:

#### 1. **HyDE (Hypothetical Document Embeddings)**

**Process Flow:**
1. Query transformation generates hypothetical answers/documents
2. Hypothetical outputs are embedded for enriched semantic space
3. Similarity searches retrieve actual documents using expanded embeddings
4. Final response generation uses retrieved documents plus original query

**Use Cases:**
- Complex queries where user intent is unclear
- Domain-specific terminology requiring context expansion
- Exploratory search where exact matches may not exist

**API Usage:**
```python
response = client.retrieval.rag(
    "Explain quantum entanglement",
    search_settings={
        "search_strategy": "hyde",
        "limit": 10
    }
)
```

#### 2. **RAG-Fusion**

**Operational Steps:**
1. Original query expanded into multiple related queries
2. Each variant retrieves relevant documents independently
3. Reciprocal Rank Fusion re-ranks combined results
4. Enhanced RAG generation uses consolidated document set

**Use Cases:**
- Multi-faceted questions requiring diverse perspectives
- Comprehensive research requiring breadth of coverage
- Queries with multiple valid interpretations

**API Usage:**
```python
response = client.retrieval.rag(
    "What are the benefits of renewable energy?",
    search_settings={
        "search_strategy": "rag_fusion",
        "limit": 20
    }
)
```

### Advanced Configuration

Techniques integrate with additional parameters:

```python
response = client.retrieval.rag(
    query="Your complex query",
    search_settings={
        "search_strategy": "hyde",  # or "rag_fusion"
        "use_hybrid_search": True,
        "limit": 15,
        "filters": {
            "document_type": ["pdf", "markdown"]
        }
    },
    rag_generation_config={
        "model": "claude-3-opus",
        "temperature": 0.7,
        "max_tokens": 4096
    }
)
```

### Current Limitations

- **Beta Status**: Features under active development with observability constraints
- **Agentic Incompatibility**: Not compatible with agentic workflows
- **Analytics**: Limited coverage during implementation phase

### Best Practices

1. **Strategy Selection**: Use HyDE for conceptual queries, RAG-Fusion for comprehensive research
2. **Limit Tuning**: Increase limits for RAG-Fusion to capture query variations
3. **Hybrid Integration**: Combine with hybrid search for optimal results
4. **Model Selection**: Use more capable models for complex strategy execution

---

## 4. INGESTION SYSTEM

### Core Concept

R2R's ingestion process parses, chunks, embeds, and stores documents efficiently, transforming diverse content types into searchable, analyzable knowledge.

### Ingestion Workflow

1. **Parsing**: Files/text converted to structured text
2. **Chunking**: Text divided into manageable semantic units
3. **Embedding**: Vector representations generated for semantic search
4. **Storage**: Content stored for retrieval
5. **Graph Linking** (optional): Entities/relationships extracted for knowledge graph

### Supported File Types

R2R supports wide range of formats:
- **Text**: txt, md, csv, json, xml
- **Documents**: docx, xlsx, pptx
- **PDFs**: Standard and scanned (with OCR)
- **Images**: png, jpg, gif (with vision models)
- **Audio**: mp3, wav, m4a (with transcription)
- **Video**: mp4, avi (with transcription)

### Ingestion Modes

#### 1. **Fast Mode**
Speed-oriented ingestion with minimal enrichment.
- Skips summaries and advanced parsing
- Ideal for large volume processing
- Trade-off: Lower quality metadata

```python
result = client.documents.create(
    file_path="document.pdf",
    ingestion_mode="fast"
)
```

#### 2. **Hi-Res Mode**
High-quality extraction leveraging vision models.
- Uses visual language models for PDFs/images
- Recommended for complex/multimodal documents
- Trade-off: Slower processing

```python
result = client.documents.create(
    file_path="complex_diagram.pdf",
    ingestion_mode="hi-res"
)
```

#### 3. **Custom Mode**
Full control via ingestion configuration.

```python
ingestion_config = {
    "chunk_size": 512,
    "chunk_overlap": 50,
    "enable_summarization": True,
    "summarization_model": "gpt-4o-mini",
    "extract_entities": True
}

result = client.documents.create(
    file_path="document.pdf",
    ingestion_config=ingestion_config
)
```

### Chunking Strategies

#### Character-based Chunking
Simple splitting by character count:
```python
chunking_config = {
    "provider": "unstructured_local",
    "strategy": "by_title",
    "chunking_strategy": "basic",
    "max_characters": 1024,
    "overlap": 100
}
```

#### Recursive Chunking
Intelligent splitting respecting document structure:
```python
chunking_config = {
    "provider": "r2r",
    "chunking_strategy": "recursive",
    "chunk_size": 512,
    "chunk_overlap": 50,
    "separators": ["\n\n", "\n", ". ", " "]
}
```

### Chunk Object Structure

```python
{
    "chunk_id": "uuid",
    "document_id": "parent-doc-uuid",
    "collection_ids": ["collection-uuid"],
    "text": "Chunk content...",
    "metadata": {
        "chunk_order": 0,
        "document_title": "Example.pdf",
        "page_number": 1
    },
    "vector": [0.123, 0.456, ...]  # Optional embedding
}
```

### API Endpoints

#### Ingest File
```python
result = client.documents.create(
    file_path="path/to/file.pdf",
    metadata={"category": "research", "author": "John Doe"},
    collection_id="collection-uuid"
)
```

#### Ingest Text Directly
```python
result = client.documents.create(
    content="Raw text content",
    metadata={"title": "My Document"},
    collection_id="collection-uuid"
)
```

#### Ingest Pre-processed Chunks
```python
chunks = [
    {"text": "First chunk", "metadata": {"section": "intro"}},
    {"text": "Second chunk", "metadata": {"section": "body"}}
]

result = client.chunks.create(
    document_id="doc-uuid",
    chunks=chunks
)
```

### Best Practices

1. **Mode Selection**: Fast for bulk import, Hi-Res for critical documents
2. **Chunk Size**: 256-512 tokens for general use, 1024+ for technical content
3. **Overlap**: 10-20% overlap to preserve context across boundaries
4. **Batch Processing**: Process similar documents in batches for efficiency
5. **Metadata**: Add rich metadata for better filtering and organization
6. **Monitoring**: Track ingestion progress through orchestration dashboard

### Performance Considerations

- **Fast mode**: ~1-2 seconds per document
- **Hi-Res mode**: ~5-30 seconds per document (depends on complexity)
- **Batch size**: Process 10-100 documents concurrently for optimal throughput
- **Embedding**: OpenAI embeddings ~1000 documents/minute, local models vary

---

## 5. KNOWLEDGE GRAPHS

### Core Concept

R2R's knowledge graph system automatically extracts entities and relationships from documents, organizing them into rich semantic networks for improved search, analysis, and knowledge discovery.

### Architecture

R2R implements a **Git-like model** for knowledge graphs:
- Each collection has a corresponding graph
- Graphs can diverge and be independently managed
- Source information preserved during merging

### Workflow

#### 1. **Document-level Extraction**
Individual documents undergo entity and relationship extraction:
- Key concepts identified
- People, organizations, locations extracted
- Relationships between entities mapped

#### 2. **Collection-level Graphs**
Collections maintain unified graphs:
- Entities combined and deduplicated
- Cross-document relationships preserved
- Source attribution maintained

### Triplex Model

SciPhi developed **Triplex** (fine-tuned Phi3-3.8B) for knowledge graph construction:
- Extracts triplets: (subject, predicate, object)
- 98% cost reduction vs GPT-4
- Outperforms GPT-4 at 1/60th the cost
- Enables local graph building

### Configuration Options

```python
kg_config = {
    "entity_types": ["Person", "Organization", "Technology", "Concept"],
    "relation_types": ["works_for", "develops", "uses", "related_to"],
    "max_knowledge_triples": 100,
    "generation_config": {
        "model": "SciPhi/Triplex",
        "temperature": 0.1
    }
}
```

### Enrichment Workflows

#### CreateGraphWorkflow
Orchestrates initial graph creation:
1. Extract entities from documents
2. Identify relationships
3. Build initial graph structure

#### EnrichGraphWorkflow
Handles graph enrichment:
1. **Node Creation**: Add new entities and descriptions
2. **Clustering**: Group related entities using Leiden algorithm
3. **Community Detection**: Identify semantic clusters

### Enrichment Settings

```toml
[kg_enrichment_settings]
max_description_input_length = 65536
max_summary_input_length = 65536

[kg_enrichment_settings.generation_config]
model = "openai/gpt-4o-mini"

[kg_enrichment_settings.leiden_params]
resolution = 1.0
randomness = 0.5
iterations = 10
```

### API Endpoints

#### Create Graph
```python
# Automatically triggered during ingestion with graph enabled
result = client.documents.create(
    file_path="document.pdf",
    run_with_orchestration=True  # Enables graph extraction
)
```

#### Extract Entities and Relationships
```python
# Explicit extraction
result = client.collections.extract(
    collection_id="collection-uuid",
    run_type="extract"  # or "enrich" for enrichment
)
```

#### Query Graph
```python
# Search graph entities
entities = client.graphs.entities(
    collection_id="collection-uuid",
    entity_types=["Person", "Organization"],
    limit=50
)

# Search relationships
relationships = client.graphs.relationships(
    collection_id="collection-uuid",
    relation_types=["works_for"],
    limit=50
)
```

#### Enrich Graph
```python
# Trigger enrichment workflow
result = client.collections.enrich_graph(
    collection_id="collection-uuid",
    run_with_orchestration=True
)
```

### Search Integration

Knowledge graphs enhance retrieval:
```python
# Search with graph enrichment
response = client.retrieval.rag(
    query="Who are the key researchers in quantum computing?",
    search_settings={
        "use_kg_search": True,  # Enable knowledge graph search
        "kg_search_type": "local",  # local or global
        "limit": 10
    }
)
```

### Community Detection

Leiden algorithm identifies semantic communities:
- **Resolution**: Controls granularity (higher = more communities)
- **Randomness**: Exploration parameter (0-1)
- **Iterations**: Convergence control

### Best Practices

1. **Entity Types**: Define domain-specific entity types for better extraction
2. **Relation Types**: Specify expected relationships to guide extraction
3. **Triple Limits**: Balance completeness vs noise (50-200 per document)
4. **Model Selection**: Use Triplex for cost efficiency, GPT-4 for highest quality
5. **Enrichment Frequency**: Run enrichment after batch ingestion, not per document
6. **Community Detection**: Tune Leiden parameters for optimal clustering

### Performance Considerations

- **Extraction**: ~5-15 seconds per document with Triplex
- **Enrichment**: Minutes to hours depending on graph size
- **Query Performance**: Graph queries typically sub-second for <100K entities
- **Storage**: ~10-50KB per document for graph data

### Integration Points

- **Ingestion**: Automatic extraction during document processing
- **Search**: Graph-enhanced retrieval for entity-centric queries
- **RAG**: Entity context enriches generation
- **Analytics**: Network analysis reveals document relationships

---

## 6. COLLECTIONS AND DOCUMENTS

### Collections

Collections are logical groupings of users and documents that enable efficient access control and organization.

#### Core Features

1. **Default Collection**: Each user receives default collection upon joining
2. **Multi-collection Documents**: Documents can belong to multiple collections
3. **Access Control**: Collection-level permissions management
4. **Knowledge Graph Integration**: Per-collection graph construction

#### Collection Roles

| Role | Permissions |
|------|-------------|
| Owner | Full control, deletion rights, user management |
| Member | Access and interact with documents based on granted permissions |
| Non-Member | No access to collection or contents |

#### API Operations

**Create Collection**
```python
collection = client.collections.create(
    name="Research Papers",
    description="Academic research collection",
    metadata={"department": "AI", "year": 2024}
)
```

**List Collections**
```python
collections = client.collections.list(
    limit=100,
    offset=0
)
```

**Update Collection**
```python
client.collections.update(
    collection_id="collection-uuid",
    name="Updated Name",
    description="Updated description"
)
```

**Delete Collection**
```python
client.collections.delete(
    collection_id="collection-uuid"
)
```

**Manage Users**
```python
# Add user to collection
client.collections.add_user(
    collection_id="collection-uuid",
    user_id="user-uuid",
    role="member"
)

# Remove user from collection
client.collections.remove_user(
    collection_id="collection-uuid",
    user_id="user-uuid"
)
```

### Documents

Documents represent unique ingested files or content with corresponding IDs, chunks, and entities/relationships.

#### Document Lifecycle

1. **Creation**: Ingestion creates document with metadata
2. **Processing**: Chunks extracted, embeddings generated
3. **Graph Extraction** (optional): Entities and relationships extracted
4. **Storage**: Persistent storage with versioning
5. **Retrieval**: Available for search and RAG
6. **Update**: Metadata or content updates
7. **Deletion**: Removal from collections and cleanup

#### Document Structure

```python
{
    "document_id": "uuid",
    "collection_ids": ["collection-uuid"],
    "owner_id": "user-uuid",
    "type": "pdf",
    "metadata": {
        "title": "Document Title",
        "author": "Author Name",
        "created_at": "2024-01-15T10:30:00Z",
        "size_in_bytes": 1048576,
        "page_count": 25
    },
    "ingestion_status": "success",
    "chunk_count": 45,
    "entity_count": 120
}
```

#### API Operations

**Create Document**
```python
# From file
document = client.documents.create(
    file_path="path/to/file.pdf",
    metadata={"category": "research"},
    collection_id="collection-uuid"
)

# From text
document = client.documents.create(
    content="Text content",
    metadata={"title": "My Note"},
    collection_id="collection-uuid"
)
```

**List Documents**
```python
documents = client.documents.list(
    collection_id="collection-uuid",
    filters={
        "document_type": ["pdf"],
        "category": ["research"]
    },
    limit=50,
    offset=0
)
```

**Get Document**
```python
document = client.documents.retrieve(
    document_id="document-uuid"
)
```

**Update Document**
```python
client.documents.update(
    document_id="document-uuid",
    metadata={"status": "reviewed"}
)
```

**Delete Document**
```python
client.documents.delete(
    document_id="document-uuid"
)
```

**List Document Chunks**
```python
chunks = client.documents.list_chunks(
    document_id="document-uuid",
    limit=100
)
```

#### Filtering Capabilities

Documents support rich filtering:
```python
filters = {
    "document_type": ["pdf", "docx"],
    "metadata.category": ["research"],
    "metadata.year": {"$gte": 2020},
    "ingestion_status": ["success"],
    "created_at": {
        "$gte": "2024-01-01",
        "$lte": "2024-12-31"
    }
}

documents = client.documents.list(filters=filters)
```

### Access Control

All document operations are gated to:
- Documents the user has uploaded
- Documents accessible through shared collections
- Exception: Superuser accounts have full access

### Best Practices

1. **Collection Organization**: Group related documents by project, topic, or access level
2. **Metadata Strategy**: Use consistent metadata schema across collections
3. **Permission Management**: Regularly audit collection membership
4. **Deletion Policy**: Implement soft deletes with retention periods
5. **Multi-collection**: Use sparingly to avoid permission complexity

---

## 7. ORCHESTRATION

### Core Architecture

R2R uses **Hatchet** for orchestrating complex workflows, particularly for ingestion and knowledge graph construction.

#### Hatchet Benefits

- Distributed, fault-tolerant task queue
- Solves concurrency, fairness, and rate limiting
- Durable workflow execution
- Built-in monitoring and observability

### Deployment Modes

#### 1. **Light Mode**
Synchronous processing without orchestration:
- Simple setup
- Immediate execution
- No background processing
- Limited throughput

#### 2. **Full Mode**
Workflow orchestration with Hatchet:
- Asynchronous task execution
- Higher throughput
- Advanced parsing with unstructured_local or unstructured_api
- Fault tolerance and retry logic

### Key Workflows

#### CreateGraphWorkflow
Orchestrates knowledge graph creation:
```python
{
    "steps": [
        "extract_entities",
        "extract_relationships",
        "build_graph_structure",
        "store_triples"
    ],
    "retry_policy": {
        "max_attempts": 3,
        "backoff": "exponential"
    }
}
```

#### EnrichGraphWorkflow
Handles graph enrichment:
```python
{
    "steps": [
        "generate_descriptions",
        "create_communities",
        "cluster_entities",
        "update_graph"
    ],
    "parallel_execution": True
}
```

#### IngestionWorkflow
Manages document processing:
```python
{
    "steps": [
        "parse_document",
        "chunk_text",
        "generate_embeddings",
        "store_chunks",
        "extract_graph_data"  # Optional
    ],
    "timeout": 3600  # 1 hour
}
```

### Configuration

Enable orchestration in R2R:
```toml
[orchestration]
provider = "hatchet"
enable_orchestration = true

[orchestration.hatchet]
api_url = "http://localhost:7077"
namespace = "r2r-workflows"
```

### Monitoring

Hatchet provides web interface on port 7274:
```bash
# Access monitoring dashboard
http://localhost:7274
```

Dashboard features:
- Workflow execution status
- Task queue visualization
- Error logs and retry attempts
- Performance metrics

### API Integration

#### Run with Orchestration
```python
# Ingestion with orchestration
result = client.documents.create(
    file_path="document.pdf",
    run_with_orchestration=True
)

# Returns task ID for tracking
task_id = result["task_id"]
```

#### Check Task Status
```python
status = client.system.task_status(
    task_id=task_id
)

# Status: "pending", "running", "completed", "failed"
```

#### List Tasks
```python
tasks = client.system.list_tasks(
    status="running",
    limit=50
)
```

### Best Practices

1. **Orchestration Mode**: Use full mode for production deployments
2. **Batch Processing**: Process multiple documents in single workflow
3. **Error Handling**: Configure appropriate retry policies
4. **Monitoring**: Regularly check Hatchet dashboard for failed tasks
5. **Resource Limits**: Set appropriate timeouts and concurrency limits
6. **Scaling**: Hatchet supports horizontal scaling for high throughput

### Performance Considerations

- **Throughput**: Full mode supports 10-100x higher throughput vs light mode
- **Latency**: Async processing adds slight latency for individual documents
- **Resource Usage**: Hatchet requires additional memory/CPU
- **Fault Tolerance**: Failed tasks automatically retry with backoff

---

## 8. CUSTOM TOOLS

### Core Concept

R2R enables developers to create custom tools that agents can invoke, extending functionality beyond built-in capabilities.

### Tool Structure

Custom tools follow standard format:
```python
{
    "name": "tool_name",
    "description": "Clear description of what the tool does",
    "parameters": {
        "type": "object",
        "properties": {
            "param1": {
                "type": "string",
                "description": "Parameter description"
            }
        },
        "required": ["param1"]
    },
    "function": callable_function
}
```

### Built-in Tools Reference

#### RAG Mode Default Tools

**local_search**
```python
{
    "name": "search_file_knowledge",
    "description": "Search ingested documents using semantic/hybrid search",
    "parameters": {
        "query": "string",
        "limit": "integer",
        "filters": "object"
    }
}
```

**content**
```python
{
    "name": "get_file_content",
    "description": "Fetch entire documents or chunk structures",
    "parameters": {
        "document_id": "string",
        "include_chunks": "boolean"
    }
}
```

**web_search**
```python
{
    "name": "web_search",
    "description": "Query external search APIs (Serper/Google)",
    "parameters": {
        "query": "string",
        "num_results": "integer"
    },
    "requires": "SERPER_API_KEY"
}
```

### Creating Custom Tools

#### 1. Define Tool Function

```python
def calculate_statistics(data: list[float]) -> dict:
    """Calculate statistical metrics from data."""
    import statistics

    return {
        "mean": statistics.mean(data),
        "median": statistics.median(data),
        "stdev": statistics.stdev(data),
        "min": min(data),
        "max": max(data)
    }
```

#### 2. Register Tool

```python
tool_definition = {
    "name": "calculate_statistics",
    "description": "Calculate mean, median, stdev, min, max from numerical data",
    "parameters": {
        "type": "object",
        "properties": {
            "data": {
                "type": "array",
                "items": {"type": "number"},
                "description": "List of numerical values"
            }
        },
        "required": ["data"]
    },
    "function": calculate_statistics
}

client.tools.register(tool_definition)
```

#### 3. Use in Agent

```python
response = client.retrieval.agent(
    messages=[
        {"role": "user", "content": "Calculate stats for [1.5, 2.3, 3.7, 4.2]"}
    ],
    tools=["calculate_statistics"]  # Make tool available to agent
)
```

### Advanced Tool Examples

#### Database Query Tool
```python
def query_database(sql: str) -> list[dict]:
    """Execute SQL query on internal database."""
    # Implement safety checks and query execution
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.fetchall()

db_tool = {
    "name": "query_database",
    "description": "Execute SQL queries on internal database (read-only)",
    "parameters": {
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": "SQL SELECT query"
            }
        },
        "required": ["sql"]
    },
    "function": query_database
}
```

#### API Integration Tool
```python
def fetch_weather(city: str) -> dict:
    """Fetch current weather for a city."""
    import requests

    api_key = os.getenv("WEATHER_API_KEY")
    url = f"https://api.weather.com/v1/current?city={city}&key={api_key}"
    response = requests.get(url)
    return response.json()

weather_tool = {
    "name": "fetch_weather",
    "description": "Get current weather conditions for any city",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "City name"
            }
        },
        "required": ["city"]
    },
    "function": fetch_weather
}
```

#### File Processing Tool
```python
def process_csv(file_path: str, operation: str) -> dict:
    """Process CSV file with specified operation."""
    import pandas as pd

    df = pd.read_csv(file_path)

    if operation == "summary":
        return df.describe().to_dict()
    elif operation == "head":
        return df.head(10).to_dict()
    elif operation == "columns":
        return {"columns": df.columns.tolist()}

csv_tool = {
    "name": "process_csv",
    "description": "Analyze CSV files with various operations",
    "parameters": {
        "type": "object",
        "properties": {
            "file_path": {
                "type": "string",
                "description": "Path to CSV file"
            },
            "operation": {
                "type": "string",
                "enum": ["summary", "head", "columns"],
                "description": "Analysis operation"
            }
        },
        "required": ["file_path", "operation"]
    },
    "function": process_csv
}
```

### Tool Configuration

Configure tools in `r2r.toml`:
```toml
[agent]
default_tools = ["search_file_knowledge", "get_file_content"]
custom_tools_enabled = true

[agent.tools.web_search]
enabled = true
api_key_env = "SERPER_API_KEY"
max_results = 10

[agent.tools.python_executor]
enabled = true  # Research mode only
timeout = 30
max_iterations = 5
```

### Best Practices

1. **Clear Descriptions**: Provide detailed, unambiguous tool descriptions
2. **Parameter Validation**: Validate inputs before execution
3. **Error Handling**: Return informative errors, don't crash
4. **Security**: Sanitize inputs, limit permissions, avoid arbitrary code execution
5. **Performance**: Set timeouts for long-running operations
6. **Stateless**: Tools should be stateless when possible
7. **Documentation**: Include usage examples in tool descriptions

### Integration with Research Mode

Research mode provides additional tools:
```python
response = client.retrieval.agent(
    messages=[{"role": "user", "content": "Complex analysis task"}],
    mode="research",
    tools=[
        "rag",  # Underlying RAG agent
        "reasoning",  # Dedicated reasoning model
        "critique",  # Analysis of conversation
        "python_executor",  # Code execution
        "my_custom_tool"  # Your custom tool
    ]
)
```

### Debugging Tools

Monitor tool execution:
```python
response = client.retrieval.agent(
    messages=[...],
    tools=["my_tool"],
    stream=True
)

for event in response:
    if event.type == "tool_call":
        print(f"Calling: {event.tool_name}")
        print(f"Arguments: {event.arguments}")
    elif event.type == "tool_result":
        print(f"Result: {event.result}")
```

---

## 9. CONFIGURATION SYSTEM

### Configuration Levels

R2R supports two configuration approaches:

#### 1. **Server-side Configuration**
Default configuration for R2R deployment via TOML files.

#### 2. **Runtime Configuration**
Dynamic override of settings when making API calls.

### TOML Configuration Files

#### r2r.toml (Light Mode)
Default settings for lightweight R2R installation.

#### full.toml (Full Mode)
Complete configuration for production deployment with orchestration.

### Creating Custom Configuration

```toml
# my_r2r.toml

[database]
provider = "postgres"
host = "localhost"
port = 5432
db_name = "r2r_db"

[embedding]
provider = "openai"
base_model = "text-embedding-3-large"
base_dimension = 3072
batch_size = 128

[completion]
provider = "openai"
generation_model = "gpt-4o"

[kg]
provider = "neo4j"
batch_size = 1000

[chunking]
provider = "r2r"
method = "recursive"
chunk_size = 512
chunk_overlap = 50

[agent]
generation_model = "openai/gpt-4o"
max_tool_iterations = 10
```

### Key Configuration Sections

#### Database Configuration
```toml
[database]
provider = "postgres"  # or "sqlite", "pgvector"
host = "localhost"
port = 5432
db_name = "r2r_production"
user = "r2r_user"
password = "${POSTGRES_PASSWORD}"  # Environment variable
max_connections = 100
```

#### Embedding Configuration
```toml
[embedding]
provider = "openai"  # or "sentence-transformers", "cohere"
base_model = "text-embedding-3-large"
base_dimension = 3072
batch_size = 128

# For local models
# provider = "sentence-transformers"
# base_model = "all-MiniLM-L6-v2"
# base_dimension = 384
```

#### Completion/Generation Configuration
```toml
[completion]
provider = "openai"  # or "anthropic", "azure", "together"
generation_model = "gpt-4o"
temperature = 0.7
max_tokens = 4096
stream = true

[completion.anthropic]
# Anthropic-specific settings
api_key = "${ANTHROPIC_API_KEY}"
model = "claude-3-opus-20240229"
```

#### Knowledge Graph Configuration
```toml
[kg]
provider = "neo4j"  # or "postgres"
uri = "bolt://localhost:7687"
user = "neo4j"
password = "${NEO4J_PASSWORD}"
database = "r2r_kg"
batch_size = 1000

[kg_enrichment_settings]
max_description_input_length = 65536
max_summary_input_length = 65536

[kg_enrichment_settings.generation_config]
model = "openai/gpt-4o-mini"
temperature = 0.1

[kg_enrichment_settings.leiden_params]
resolution = 1.0
randomness = 0.5
iterations = 10
```

#### Retrieval Configuration
```toml
[retrieval]
# Default search settings
use_semantic_search = true
use_fulltext_search = true
use_hybrid_search = true

[retrieval.hybrid_settings]
full_text_weight = 1.0
semantic_weight = 5.0
full_text_limit = 200
rrf_k = 50

[rag_generation_config]
model = "openai/gpt-4o"
temperature = 0.7
max_tokens = 2048
stream = true
```

#### Orchestration Configuration
```toml
[orchestration]
provider = "hatchet"
enable_orchestration = true

[orchestration.hatchet]
api_url = "http://localhost:7077"
namespace = "r2r-production"
max_workers = 10
```

#### Agent Configuration
```toml
[agent]
generation_model = "openai/gpt-4o"
max_tool_iterations = 10
enable_reasoning = true

[agent.tools]
default_tools = ["search_file_knowledge", "get_file_content"]
web_search_enabled = true
web_scrape_enabled = false

[agent.tools.web_search]
provider = "serper"
api_key_env = "SERPER_API_KEY"
max_results = 10
```

### Runtime Configuration Override

Override settings dynamically:
```python
# Override search settings
response = client.retrieval.search(
    query="Your query",
    search_settings={
        "use_hybrid_search": True,
        "hybrid_settings": {
            "semantic_weight": 10.0,  # Override default
            "full_text_weight": 1.0
        },
        "limit": 20
    }
)

# Override generation settings
response = client.retrieval.rag(
    query="Your query",
    rag_generation_config={
        "model": "claude-3-opus",  # Override default
        "temperature": 0.3,
        "max_tokens": 8192
    }
)

# Override ingestion settings
result = client.documents.create(
    file_path="document.pdf",
    ingestion_config={
        "chunk_size": 1024,  # Override default
        "chunk_overlap": 100,
        "enable_summarization": True
    }
)
```

### Environment Variables

Use environment variables for sensitive data:
```bash
# .env file
POSTGRES_PASSWORD=secure_password
NEO4J_PASSWORD=graph_password
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SERPER_API_KEY=...
FIRECRAWL_API_KEY=...
```

Reference in TOML:
```toml
password = "${POSTGRES_PASSWORD}"
api_key = "${OPENAI_API_KEY}"
```

### Best Practices

1. **Environment Separation**: Use different configs for dev/staging/prod
2. **Secrets Management**: Never commit API keys, use environment variables
3. **Fallback Strategy**: Specify defaults, override only when needed
4. **Documentation**: Comment complex configuration choices
5. **Version Control**: Track r2r.toml in git, exclude .env files
6. **Validation**: Test configuration changes in staging first

---

## 10. BEST PRACTICES FOR PRODUCTION DEPLOYMENT

### Architecture Design

#### 1. **Separation of Concerns**
- **API Server**: Handle HTTP requests
- **Orchestration**: Process background tasks (Hatchet)
- **Database**: PostgreSQL + pgvector for storage
- **Cache**: Redis for session/result caching
- **Knowledge Graph**: Neo4j for graph operations

#### 2. **Scalability**
```yaml
# Docker Compose example
services:
  r2r-api:
    image: sciphi/r2r:latest
    replicas: 3  # Horizontal scaling
    environment:
      - MODE=full
      - WORKERS=4

  r2r-orchestration:
    image: sciphi/r2r:latest
    command: worker
    replicas: 5  # Scale workers independently

  postgres:
    image: pgvector/pgvector:latest
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:latest
    volumes:
      - neo4j_data:/data
```

#### 3. **High Availability**
- Load balancer for API instances
- Database replication
- Regular backups
- Health checks and auto-restart

### Performance Optimization

#### 1. **Database Optimization**
```sql
-- Create appropriate indexes
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_chunks_collection_id ON chunks(collection_id);
CREATE INDEX idx_documents_collection_id ON documents(collection_id);

-- Vector index for similarity search
CREATE INDEX idx_chunks_embedding ON chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index
CREATE INDEX idx_chunks_fts ON chunks
USING gin(to_tsvector('english', text));
```

#### 2. **Embedding Optimization**
```toml
[embedding]
provider = "openai"
base_model = "text-embedding-3-large"
batch_size = 256  # Larger batches for throughput
dimensions = 3072  # Or 1536 for faster, lower quality
```

#### 3. **Caching Strategy**
```python
# Implement result caching
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_search(query: str, collection_id: str):
    return client.retrieval.search(query, collection_id=collection_id)
```

#### 4. **Chunk Size Tuning**
```toml
[chunking]
chunk_size = 512  # Balance: 256 (precision) vs 1024 (context)
chunk_overlap = 50  # 10% overlap
```

### Security

#### 1. **Authentication & Authorization**
```python
# Use API key authentication
client = R2RClient(
    base_url="https://api.example.com",
    api_key=os.getenv("R2R_API_KEY")
)

# Implement collection-level access control
client.collections.add_user(
    collection_id="sensitive-docs",
    user_id="user-uuid",
    role="member"  # Not owner
)
```

#### 2. **Input Validation**
```python
# Sanitize inputs
def sanitize_query(query: str) -> str:
    # Remove SQL injection attempts
    # Limit query length
    # Escape special characters
    return query.strip()[:500]
```

#### 3. **Rate Limiting**
```python
# Implement rate limiting
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/search")
@limiter.limit("100/minute")
def search(request: SearchRequest):
    return client.retrieval.search(request.query)
```

#### 4. **Data Privacy**
```toml
[security]
# Enable encryption at rest
encrypt_data = true
encryption_key_env = "ENCRYPTION_KEY"

# Enable audit logging
enable_audit_log = true
audit_log_path = "/var/log/r2r/audit.log"
```

### Monitoring & Observability

#### 1. **Metrics Collection**
```python
# Track key metrics
metrics = {
    "search_latency": histogram,
    "ingestion_rate": counter,
    "chunk_count": gauge,
    "error_rate": counter
}

# Monitor in production
@app.post("/search")
async def search(query: str):
    start = time.time()
    result = await client.retrieval.search(query)
    metrics["search_latency"].observe(time.time() - start)
    return result
```

#### 2. **Logging**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/r2r/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('r2r')
logger.info(f"Search query: {query}, results: {len(results)}")
```

#### 3. **Health Checks**
```python
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": check_db_connection(),
        "embeddings": check_embedding_service(),
        "orchestration": check_hatchet_connection()
    }
```

### Cost Optimization

#### 1. **Embedding Cost Reduction**
- Use smaller embedding models for non-critical content
- Batch embedding requests
- Cache embeddings for frequently accessed content

#### 2. **LLM Cost Optimization**
```python
# Use cheaper models for simple queries
generation_config = {
    "model": "gpt-4o-mini" if is_simple_query(query) else "gpt-4o",
    "max_tokens": 500 if is_simple_query(query) else 2048
}
```

#### 3. **Knowledge Graph Cost**
```toml
[kg]
# Use Triplex instead of GPT-4 (98% cost reduction)
provider = "SciPhi/Triplex"
```

### Deployment Checklist

- [ ] Configure environment variables for all secrets
- [ ] Set up database with proper indexes
- [ ] Configure orchestration (Hatchet) for async processing
- [ ] Implement authentication and authorization
- [ ] Set up rate limiting
- [ ] Configure logging and monitoring
- [ ] Set up regular backups
- [ ] Implement health checks
- [ ] Configure SSL/TLS
- [ ] Set up load balancing
- [ ] Test disaster recovery procedures
- [ ] Document deployment procedures
- [ ] Set up alerts for errors and performance issues
- [ ] Configure resource limits (memory, CPU)
- [ ] Implement graceful shutdown

### Maintenance

#### 1. **Regular Updates**
- Monitor R2R releases for updates
- Test updates in staging before production
- Keep dependencies updated

#### 2. **Database Maintenance**
```sql
-- Regular vacuum
VACUUM ANALYZE chunks;
VACUUM ANALYZE documents;

-- Reindex periodically
REINDEX INDEX idx_chunks_embedding;
```

#### 3. **Monitoring Metrics**
- Query latency (p50, p95, p99)
- Ingestion throughput
- Error rates
- Resource utilization (CPU, memory, disk)
- Database connection pool usage

---

## 11. API SUMMARY

### Core Endpoints

#### Documents
- `POST /documents/create` - Ingest documents
- `GET /documents/{id}` - Retrieve document
- `GET /documents/list` - List documents
- `PUT /documents/{id}` - Update document
- `DELETE /documents/{id}` - Delete document
- `GET /documents/{id}/chunks` - List document chunks

#### Chunks
- `POST /chunks/create` - Create chunks
- `GET /chunks/list` - List chunks
- `DELETE /chunks/{id}` - Delete chunk

#### Collections
- `POST /collections/create` - Create collection
- `GET /collections/list` - List collections
- `GET /collections/{id}` - Get collection
- `PUT /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection
- `POST /collections/{id}/users` - Add user to collection
- `DELETE /collections/{id}/users/{user_id}` - Remove user
- `POST /collections/{id}/extract` - Extract graph entities
- `POST /collections/{id}/enrich` - Enrich knowledge graph

#### Retrieval
- `POST /retrieval/search` - Search documents
- `POST /retrieval/rag` - RAG query
- `POST /retrieval/agent` - Agentic RAG query

#### Graphs
- `GET /graphs/entities` - List entities
- `GET /graphs/relationships` - List relationships
- `GET /graphs/communities` - List communities

#### System
- `GET /system/health` - Health check
- `GET /system/tasks` - List tasks
- `GET /system/tasks/{id}` - Get task status

---

## 12. INTEGRATION EXAMPLES

### Python SDK

```python
from r2r import R2RClient

# Initialize client
client = R2RClient(
    base_url="http://localhost:7272",
    api_key="your-api-key"
)

# Complete workflow
# 1. Create collection
collection = client.collections.create(
    name="Research Papers",
    description="AI research collection"
)

# 2. Ingest documents
result = client.documents.create(
    file_path="paper.pdf",
    metadata={"category": "AI", "year": 2024},
    collection_id=collection["id"],
    run_with_orchestration=True
)

# 3. Wait for processing
import time
while client.system.task_status(result["task_id"])["status"] != "completed":
    time.sleep(1)

# 4. Search
results = client.retrieval.search(
    query="transformer architecture",
    search_settings={
        "use_hybrid_search": True,
        "limit": 5
    },
    collection_id=collection["id"]
)

# 5. RAG query
response = client.retrieval.rag(
    query="Explain the transformer architecture",
    search_settings={"limit": 3},
    rag_generation_config={"model": "gpt-4o"}
)

# 6. Agentic RAG with tools
agent_response = client.retrieval.agent(
    messages=[
        {"role": "user", "content": "Research the latest advances in transformers"}
    ],
    mode="research",
    tools=["search_file_knowledge", "web_search"]
)
```

### JavaScript/TypeScript SDK

```typescript
import { R2RClient } from 'r2r-js';

const client = new R2RClient({
  baseUrl: 'http://localhost:7272',
  apiKey: 'your-api-key'
});

// Ingest and search
async function workflow() {
  // Create collection
  const collection = await client.collections.create({
    name: 'Documents',
    description: 'My documents'
  });

  // Ingest
  const result = await client.documents.create({
    filePath: './document.pdf',
    collectionId: collection.id
  });

  // Search
  const searchResults = await client.retrieval.search({
    query: 'search query',
    searchSettings: {
      useHybridSearch: true,
      limit: 5
    }
  });

  // RAG
  const ragResponse = await client.retrieval.rag({
    query: 'Generate answer from documents',
    ragGenerationConfig: {
      model: 'gpt-4o'
    }
  });

  return ragResponse;
}
```

### REST API (curl)

```bash
# Create collection
curl -X POST http://localhost:7272/collections/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "name": "Research",
    "description": "Research collection"
  }'

# Ingest document
curl -X POST http://localhost:7272/documents/create \
  -H "Authorization: Bearer your-api-key" \
  -F "file=@document.pdf" \
  -F 'metadata={"category":"research"}' \
  -F "collection_id=collection-uuid"

# Search
curl -X POST http://localhost:7272/retrieval/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "query": "search query",
    "search_settings": {
      "use_hybrid_search": true,
      "limit": 5
    }
  }'

# RAG query
curl -X POST http://localhost:7272/retrieval/rag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "query": "Generate answer",
    "rag_generation_config": {
      "model": "gpt-4o"
    }
  }'
```

---

## CONCLUSION

R2R provides a comprehensive, production-ready platform for building advanced RAG systems with:

1. **Multi-modal ingestion** supporting diverse content types
2. **Hybrid search** combining vector and full-text retrieval
3. **Knowledge graphs** for semantic understanding
4. **Agentic capabilities** with reasoning and custom tools
5. **Production orchestration** with Hatchet
6. **Flexible configuration** via TOML and runtime overrides
7. **RESTful API** with Python and JavaScript SDKs

The system is designed to scale from prototype to production while maintaining flexibility for customization and extension.

---

## REFERENCES

- **Official Documentation**: https://r2r-docs.sciphi.ai
- **GitHub Repository**: https://github.com/SciPhi-AI/R2R
- **Triplex Model**: https://huggingface.co/SciPhi/Triplex
- **Hatchet Orchestration**: https://hatchet.run

---

*Document compiled from R2R official documentation sources*
*Last updated: 2025-01-15*
