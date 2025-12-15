# R2R System Components Reference

## Overview

This document provides detailed information about R2R's core components: deduplication, collections, conversations, documents, graphs, prompts, users, and retrieval mechanisms.

---

## 1. Deduplication

### Purpose
Entity deduplication identifies and merges duplicate entities within documents to improve knowledge graph quality and reduce redundancy.

### How It Works

**Matching Techniques** (Current):
- **Exact Name Matching**: Identifies entities with identical names

**Matching Techniques** (Planned):
- N-Character Block Matching
- Semantic Similarity Matching
- Fuzzy Name Matching

**Merge Process**:
1. Identify duplicate entities by name
2. Retain most common entity name
3. Consolidate descriptions using LLM
4. Preserve most specific category
5. Merge metadata from all instances
6. Redirect all relationships to merged entity
7. Regenerate embeddings for merged entity
8. Delete duplicate entities

### API Usage

```python
from r2r import R2RClient

client = R2RClient("http://136.119.36.216:7272")

# Deduplicate entities in a document
result = client.documents.deduplicate("20e29a97-c53c-506d-b89c-1f5346befc58")

# Response includes:
# - Number of duplicates found
# - Entities merged
# - Relationships updated
```

```typescript
// TypeScript/JavaScript
const result = await client.documents.deduplicate(documentId)
```

**API Endpoint**: `POST /documents/{id}/deduplicate`

### Configuration

```toml
[deduplication]
enabled = true
technique = "exact_name"  # Current: exact_name
min_similarity = 0.85     # For future semantic matching
```

### Best Practices

1. **Run After Extraction**: Always extract entities before deduplicating
2. **Collection-Level**: Deduplicate across all documents in a collection
3. **Periodic Runs**: Schedule regular deduplication jobs
4. **Review Merges**: Monitor merged entities in R2R dashboard
5. **Custom Categories**: Use specific entity categories for better matching

### Use Cases

- Cleaning up person names (e.g., "John Smith" vs "J. Smith")
- Merging organization mentions
- Consolidating concept references
- Improving relationship accuracy

---

## 2. Collections

### Purpose
Collections provide logical grouping for documents, enabling access control, content organization, and team collaboration.

### Key Concepts

**What is a Collection?**
- Logical container for related documents
- Access control boundary
- Query scoping mechanism
- Team workspace

**Collection Properties**:
- Unique ID (UUID)
- Name and description
- Owner and members
- Associated documents
- Optional knowledge graph

### CRUD Operations

#### Create Collection

```python
collection = client.collections.create(
    name="Technical Documentation",
    description="Product docs and API references",
)
```

```typescript
const collection = await client.collections.create({
  name: 'Technical Documentation',
  description: 'Product docs and API references',
})
```

**API**: `POST /collections`

#### Get Collection Details

```python
details = client.collections.get(collection_id)
```

**API**: `GET /collections/{id}`

#### Update Collection

```python
client.collections.update(
    collection_id,
    name="Updated Name",
    description="New description",
)
```

**API**: `POST /collections/{id}`

#### Delete Collection

```python
client.collections.delete(collection_id)
```

**API**: `DELETE /collections/{id}`

#### List Collections

```python
collections = client.collections.list(
    offset=0,
    limit=100,
)
```

**API**: `GET /collections`

### User Management

#### Add User to Collection

```python
client.collections.add_user(
    collection_id,
    user_id,
)
```

**API**: `POST /collections/{id}/users/{user_id}`

#### Remove User from Collection

```python
client.collections.remove_user(collection_id, user_id)
```

**API**: `DELETE /collections/{id}/users/{user_id}`

#### List Users in Collection

```python
users = client.collections.list_users(collection_id)
```

**API**: `GET /collections/{id}/users`

#### Get User's Collections

```python
user_collections = client.collections.list_by_user(user_id)
```

**API**: `GET /users/{id}/collections`

### Document Management

#### Add Document to Collection

```python
client.collections.add_document(collection_id, document_id)
```

**API**: `POST /collections/{id}/documents/{document_id}`

#### Remove Document from Collection

```python
client.collections.remove_document(collection_id, document_id)
```

**API**: `DELETE /collections/{id}/documents/{document_id}`

#### List Documents in Collection

```python
documents = client.collections.list_documents(
    collection_id,
    offset=0,
    limit=100,
)
```

**API**: `GET /collections/{id}/documents`

#### Get Document's Collections

```python
collections = client.documents.list_collections(document_id)
```

**API**: `GET /documents/{id}/collections`

### Advanced Features

#### Generate Collection Description

Uses LLM to create synthetic description based on documents:

```python
description = client.collections.generate_description(collection_id)
```

#### Collection Overview

Get comprehensive statistics:

```python
overview = client.collections.overview(collection_id)
# Returns:
# - Total documents
# - Total chunks
# - Entity count
# - Relationship count
# - User count
```

#### Extract Knowledge Graph

Extract entities/relationships for all documents:

```python
result = client.collections.extract(collection_id)
```

**API**: `POST /collections/{id}/extract`

### Access Control

**Permission Levels**:
- **Owner**: Full control (edit, delete, manage users)
- **Member**: Read and search access
- **Public**: Optional public visibility

**Security Model**:
```python
# Users can only access collections they belong to
results = client.retrieval.search(
    query="technical specs",
    filters={"collection_id": allowed_collection_id},
)
```

### Best Practices

1. **Organize by Project**: Create collection per project/product
2. **Team-Based**: Assign teams to relevant collections
3. **Document Lifecycle**: Add documents to collections during ingestion
4. **Search Scoping**: Always scope searches to specific collections
5. **Regular Cleanup**: Remove outdated documents periodically

---

## 3. Conversations

### Purpose
Conversations maintain chat history and context for multi-turn interactions with the R2R agent.

### Key Concepts

**What is a Conversation?**
- Persistent chat session
- Message history storage
- Context maintenance across turns
- User-specific or shared sessions

**Conversation Properties**:
- Unique ID (UUID)
- User owner
- Message history
- Creation/update timestamps
- Optional metadata

### API Operations

#### Create Conversation

```python
conversation = client.conversations.create()
```

```typescript
const conversation = await client.conversations.create()
```

**API**: `POST /conversations`

#### Send Message in Conversation

```python
response = client.retrieval.agent(
    message={"content": "What is the pricing model?"},
    conversation_id=conversation.id,
    mode="rag",
)
```

```typescript
const response = await client.retrieval.agent({
  message: { content: 'What is the pricing model?' },
  conversationId: conversation.id,
  mode: 'rag',
})
```

**API**: `POST /retrieval/agent`

#### List Conversations

```python
conversations = client.conversations.list(
    offset=0,
    limit=20,
)
```

**API**: `GET /conversations`

#### Get Conversation Details

```python
details = client.conversations.get(conversation_id)
# Returns message history and metadata
```

**API**: `GET /conversations/{id}`

#### Delete Conversation

```python
client.conversations.delete(conversation_id)
```

**API**: `DELETE /conversations/{id}`

### Message Structure

```python
{
  "role": "user" | "assistant" | "system",
  "content": "message text",
  "timestamp": "2025-01-15T10:30:00Z",
  "metadata": {
    "sources": [...],  # For assistant messages
    "citations": [...],
  }
}
```

### Context Management

**How Context Works**:
1. User sends message in conversation
2. R2R retrieves previous messages
3. Context included in LLM prompt
4. Response generated with awareness of history
5. New message/response added to history

**Context Window**:
```python
# Configure context window size
response = client.retrieval.agent(
    message={"content": query},
    conversation_id=conversation_id,
    rag_generation_config={
        "max_context_messages": 10,  # Last 10 messages
    },
)
```

### Use Cases

**Customer Support**:
```python
# Initial question
response1 = client.retrieval.agent(
    message={"content": "How do I reset my password?"},
    conversation_id=conv_id,
)

# Follow-up with context
response2 = client.retrieval.agent(
    message={"content": "What if I don't receive the email?"},
    conversation_id=conv_id,  # Same conversation
)
```

**Research Sessions**:
```python
# Multi-turn research
conversation = client.conversations.create()

topics = [
    "Explain quantum computing",
    "How does it compare to classical?",
    "What are current limitations?",
]

for topic in topics:
    response = client.retrieval.agent(
        message={"content": topic},
        conversation_id=conversation.id,
        mode="research",
    )
```

### Best Practices

1. **Create Per Session**: New conversation for each user session
2. **Limit History**: Keep last 10-20 messages for context
3. **Clear Old Conversations**: Periodic cleanup of inactive conversations
4. **Metadata Tagging**: Add metadata for session tracking
5. **Error Handling**: Handle conversation not found errors gracefully

---

## 4. Documents

### Purpose
Documents are the central container for all ingested content in R2R, serving as the foundation for chunking, embedding, and knowledge extraction.

### Document Lifecycle

```
Ingestion → Chunking → Embedding → Extraction → Deduplication → Enrichment
```

**Stages Explained**:
1. **Ingestion**: File uploaded and parsed
2. **Chunking**: Split into semantic chunks (paragraphs, sections)
3. **Embedding**: Vector representations generated for each chunk
4. **Extraction**: Entities and relationships identified (optional)
5. **Deduplication**: Duplicate entities merged (optional)
6. **Enrichment**: Contextual information added to chunks (optional)

### Document Properties

```python
{
  "id": "uuid",
  "title": "Document Title",
  "user_id": "owner_uuid",
  "collection_ids": ["collection_uuid"],
  "metadata": {
    "source": "upload",
    "file_type": "pdf",
    "page_count": 10,
    "custom_field": "value",
  },
  "status": "success" | "processing" | "failed",
  "created_at": "timestamp",
  "updated_at": "timestamp",
}
```

### CRUD Operations

#### Ingest Document

```python
# From file
with open("document.pdf", "rb") as f:
    result = client.documents.create(
        file=f,
        metadata={"source": "user_upload", "category": "technical"},
        collection_ids=[collection_id],
    )
```

```typescript
// From File object
const formData = new FormData()
formData.append('file', file)
formData.append('metadata', JSON.stringify({ source: 'upload' }))

const result = await client.documents.create(formData)
```

**API**: `POST /documents`

#### List Documents

```python
documents = client.documents.list(
    offset=0,
    limit=100,
    filters={"collection_id": collection_id},
)
```

**API**: `GET /documents`

#### Get Document Details

```python
document = client.documents.get(document_id)
```

**API**: `GET /documents/{id}`

#### Update Document Metadata

```python
client.documents.update(
    document_id,
    metadata={"status": "reviewed", "version": "2.0"},
)
```

**API**: `PATCH /documents/{id}`

#### Delete Document

```python
client.documents.delete(document_id)
# Deletes document, chunks, entities, relationships
```

**API**: `DELETE /documents/{id}`

### Knowledge Extraction

#### Extract Entities and Relationships

```python
# Extract from single document
result = client.documents.extract(document_id)

# Extract from all documents in collection
result = client.collections.extract(collection_id)
```

**API**: 
- `POST /documents/{id}/extract`
- `POST /collections/{id}/extract`

**What Gets Extracted**:
- **Entities**: People, organizations, locations, concepts
- **Relationships**: Connections between entities
- **Categories**: Entity types and classifications
- **Embeddings**: Vector representations of entities

#### List Document Entities

```python
entities = client.documents.list_entities(
    document_id,
    offset=0,
    limit=100,
)

# Each entity contains:
# - name, category, description
# - embedding vector
# - source chunks
# - metadata
```

**API**: `GET /documents/{id}/entities`

### Chunking Strategies

**Default Chunking**:
```toml
[chunking]
method = "recursive"
chunk_size = 512
chunk_overlap = 50
separators = ["\n\n", "\n", ". ", " "]
```

**Custom Chunking**:
```python
result = client.documents.create(
    file=f,
    chunking_config={
        "method": "semantic",
        "chunk_size": 1024,
        "chunk_overlap": 100,
    },
)
```

**Chunking Methods**:
- **Recursive**: Split by separators recursively
- **Semantic**: Split at semantic boundaries
- **Fixed**: Fixed-size chunks
- **Custom**: User-defined chunk boundaries

### Pre-Processed Chunks

Ingest already-chunked content:

```python
chunks = [
    {"text": "First chunk content", "metadata": {"page": 1}},
    {"text": "Second chunk content", "metadata": {"page": 2}},
]

result = client.documents.create(
    chunks=chunks,
    metadata={"source": "preprocessed"},
)
```

### Document Status Tracking

```python
# Check ingestion status
document = client.documents.get(document_id)

if document["status"] == "processing":
    print("Still processing...")
elif document["status"] == "success":
    print("Ready for search!")
elif document["status"] == "failed":
    print(f"Error: {document['error_message']}")
```

### Best Practices

1. **Rich Metadata**: Add comprehensive metadata during ingestion
2. **Collection Assignment**: Always assign to collections
3. **Status Monitoring**: Track processing status for large documents
4. **Extraction Workflow**: Extract entities after successful ingestion
5. **Regular Deduplication**: Run deduplication periodically
6. **Version Control**: Use metadata to track document versions
7. **Batch Operations**: Ingest multiple documents in parallel

---

## 5. Graphs (Knowledge Graphs)

### Purpose
Knowledge graphs enable relationship-aware retrieval by mapping entities and their connections within and across documents.

### Architecture

```
Documents → Extraction → Entities + Relationships → Knowledge Graph
                                                   ↓
                                          Community Detection
                                                   ↓
                                              GraphRAG
```

### Core Components

#### Entities

**What are Entities?**
- Named concepts extracted from text
- People, organizations, locations, events, concepts
- Each has name, category, description, embedding

**Entity Structure**:
```python
{
  "id": "uuid",
  "name": "Entity Name",
  "category": "PERSON" | "ORG" | "CONCEPT" | ...,
  "description": "LLM-generated description",
  "embedding": [0.1, 0.2, ...],  # Vector representation
  "document_id": "source_document_uuid",
  "metadata": {...},
}
```

#### Relationships

**What are Relationships?**
- Connections between entities
- Subject-Predicate-Object triples
- Directional with strength scores

**Relationship Structure**:
```python
{
  "id": "uuid",
  "subject": "Entity A",
  "predicate": "WORKS_FOR" | "LOCATED_IN" | ...,
  "object": "Entity B",
  "description": "Context about the relationship",
  "strength": 0.85,  # Confidence score
  "document_id": "source_document_uuid",
}
```

#### Communities

**What are Communities?**
- Clusters of related entities
- Detected using Leiden algorithm
- Hierarchical levels (0, 1, 2, ...)
- LLM-generated summaries

**Community Structure**:
```python
{
  "id": "uuid",
  "level": 0,  # Hierarchy level
  "name": "Community Name",
  "summary": "LLM-generated description of community",
  "entities": ["entity1_id", "entity2_id", ...],
  "size": 15,  # Number of entities
}
```

### API Operations

#### Entity Management

```python
# List entities
entities = client.graphs.list_entities(
    collection_id=collection_id,
    offset=0,
    limit=100,
)

# Get specific entity
entity = client.graphs.get_entity(entity_id)

# Create entity manually
entity = client.graphs.create_entity(
    name="Custom Entity",
    category="CONCEPT",
    description="Manual entity",
    collection_id=collection_id,
)

# Update entity
client.graphs.update_entity(
    entity_id,
    description="Updated description",
)

# Delete entity
client.graphs.delete_entity(entity_id)
```

#### Relationship Management

```python
# List relationships
relationships = client.graphs.list_relationships(
    collection_id=collection_id,
    entity_id=entity_id,  # Optional: relationships for specific entity
)

# Create relationship
relationship = client.graphs.create_relationship(
    subject="Entity A",
    predicate="RELATED_TO",
    object="Entity B",
    description="They collaborate on projects",
)

# Delete relationship
client.graphs.delete_relationship(relationship_id)
```

#### Community Detection

```python
# Build communities for collection
result = client.graphs.build_communities(
    collection_id,
    levels=[0, 1, 2],  # Hierarchy levels
)

# List communities
communities = client.graphs.list_communities(
    collection_id,
    level=0,
)

# Get community details
community = client.graphs.get_community(community_id)
```

### Knowledge Graph Workflow

**Step-by-Step Guide**:

```python
from r2r import R2RClient

client = R2RClient("http://136.119.36.216:7272")

# 1. Create collection and ingest documents
collection = client.collections.create(name="Research Papers")
doc = client.documents.create(file=open("paper.pdf", "rb"))
client.collections.add_document(collection.id, doc.id)

# 2. Extract entities and relationships
client.collections.extract(collection.id)

# 3. View extracted entities
entities = client.graphs.list_entities(collection_id=collection.id)
print(f"Extracted {len(entities)} entities")

# 4. Build graph communities
client.graphs.build_communities(collection.id)

# 5. Use KG-enhanced search
results = client.retrieval.search(
    query="research methodology",
    graph_search_settings={
        "enabled": True,
        "include_entities": True,
    },
)

# 6. GraphRAG query
response = client.retrieval.rag(
    query="What are the key findings?",
    graph_rag_settings={
        "enabled": True,
        "use_communities": True,
    },
)
```

### Graph-Enhanced Search

#### Vector + Graph Search

```python
results = client.retrieval.search(
    query="company leadership",
    vector_search_settings={"limit": 20},
    graph_search_settings={
        "enabled": True,
        "include_entities": True,
        "include_relationships": True,
        "max_hops": 2,  # Follow relationships 2 steps
    },
)

# Results include:
# - Matching chunks (vector search)
# - Related entities
# - Entity relationships
# - Community context
```

#### GraphRAG

```python
response = client.retrieval.rag(
    query="Explain the organizational structure",
    graph_rag_settings={
        "enabled": True,
        "use_communities": True,
        "community_level": 0,
    },
    rag_generation_config={
        "stream": True,
    },
)

# GraphRAG provides:
# - Relationship-aware context
# - Multi-hop reasoning
# - Community-level insights
```

### Graph Synchronization

**Automatic Sync**:
- Entity extraction updates graph in real-time
- Document deletion removes associated entities/relationships
- Collection updates propagate to graph

**Cross-Collection Updates**:
```python
# Entity appears in multiple documents/collections
# Updates sync across all instances
client.graphs.update_entity(
    entity_id,
    description="Updated across all collections",
)
```

### Access Control

```python
# Graph respects collection permissions
# Users only see entities from their collections
entities = client.graphs.list_entities(
    collection_id=user_collection_id,
)
```

### Best Practices

1. **Extract After Ingestion**: Always run extraction after document upload
2. **Build Communities**: Run community detection for GraphRAG
3. **Periodic Deduplication**: Merge duplicate entities regularly
4. **Metadata Enrichment**: Add context to entities and relationships
5. **Performance Optimization**: Use graph indices for large graphs
6. **Access Control**: Scope graphs to specific collections
7. **Monitor Extraction**: Check extraction status in Hatchet dashboard

---

## 6. Prompts

### Purpose
Prompt management enables customization of LLM behavior for RAG, extraction, and other operations.

### Default Prompts

R2R includes preconfigured prompts:

- **default_rag**: Standard RAG responses
- **default_system**: System behavior
- **graphrag**: Graph-aware RAG
- **hyde**: Hypothetical document embeddings
- **entity_extraction**: Entity identification
- **relationship_extraction**: Relationship identification
- **community_summary**: Community description generation

### Prompt Structure

```python
{
  "name": "technical_rag",
  "template": """
You are a technical expert assistant.

Context:
{context}

Question:
{query}

Provide a detailed technical response with code examples where applicable.
""",
  "input_types": {
    "context": "string",
    "query": "string",
  },
}
```

### API Operations

#### Add Prompt

```python
prompt = client.prompts.add(
    name="custom_rag",
    template="Your custom template with {placeholders}",
    input_types={"context": "string", "query": "string"},
)
```

**API**: `POST /prompts`

#### Update Prompt

```python
client.prompts.update(
    name="custom_rag",
    template="Updated template",
)
```

**API**: `PATCH /prompts/{name}`

#### Get Prompt

```python
prompt = client.prompts.get("custom_rag")
```

**API**: `GET /prompts/{name}`

#### List Prompts

```python
prompts = client.prompts.list()
```

**API**: `GET /prompts`

#### Delete Prompt

```python
client.prompts.delete("custom_rag")
```

**API**: `DELETE /prompts/{name}`

### Using Custom Prompts

```python
# Use in RAG
response = client.retrieval.rag(
    query="How does authentication work?",
    rag_generation_config={
        "prompt_name": "technical_rag",
    },
)

# Use in extraction
client.documents.extract(
    document_id,
    extraction_config={
        "entity_prompt": "custom_entity_extraction",
    },
)
```

### Prompt Templates

#### RAG Prompt Template

```python
template = """
System: You are an AI assistant helping with {domain} questions.

Context from knowledge base:
{context}

User Question:
{query}

Instructions:
- Provide accurate answers based on the context
- Cite sources when possible
- If information is not in context, say so clearly

Answer:
"""
```

#### Entity Extraction Template

```python
template = """
Extract entities from the following text.

Text:
{text}

For each entity, provide:
- Name
- Category (PERSON, ORG, LOCATION, CONCEPT, EVENT)
- Description

Format as JSON array.
"""
```

### Best Practices

1. **Test Prompts**: Validate with sample queries before deployment
2. **Version Control**: Keep track of prompt versions
3. **Clear Instructions**: Be explicit about expected behavior
4. **Context Windows**: Consider token limits in templates
5. **Fallback Prompts**: Have default prompts for failures
6. **Domain-Specific**: Create specialized prompts per use case

---

## 7. Users & Authentication

### Purpose
User management provides authentication, authorization, and access control for R2R resources.

### Authentication Modes

**JWT Token Authentication** (Recommended):
```python
# Register user
user = client.users.register(
    email="user@example.com",
    password="secure_password",
)

# Login
tokens = client.users.login(
    email="user@example.com",
    password="secure_password",
)

# Access token for API calls
# Refresh token for token renewal
```

**Supabase Integration** (Optional):
```toml
[auth]
provider = "supabase"
supabase_url = "https://xxx.supabase.co"
supabase_anon_key = "xxx"
```

**Default Admin Mode** (Development):
```toml
[auth]
require_authentication = false
# Uses default admin credentials
```

### User Operations

#### Registration

```python
user = client.users.register(
    email="user@example.com",
    password="SecurePass123!",
)

# Optional: Email verification
```

**API**: `POST /users/register`

#### Login

```python
tokens = client.users.login(
    email="user@example.com",
    password="SecurePass123!",
)

# Returns:
# {
#   "access_token": "jwt_token",
#   "refresh_token": "refresh_jwt",
# }
```

**API**: `POST /users/login`

#### Token Refresh

```python
new_tokens = client.users.refresh_access_token()
```

**API**: `POST /users/refresh`

#### Get User Profile

```python
profile = client.users.me()
```

**API**: `GET /users/me`

#### Update Profile

```python
client.users.update(
    name="John Doe",
    bio="Data scientist",
    metadata={"department": "Engineering"},
)
```

**API**: `PATCH /users/me`

#### Change Password

```python
client.users.change_password(
    current_password="OldPass123!",
    new_password="NewPass456!",
)
```

**API**: `POST /users/change-password`

#### Delete Account

```python
client.users.delete()
```

**API**: `DELETE /users/me`

#### Logout

```python
client.users.logout()
```

**API**: `POST /users/logout`

### Superuser Capabilities

**Default Admin Creation**:
- R2R creates default admin on first startup
- Credentials in configuration or environment variables

**Superuser Powers**:
- Manage all users
- Access all collections and documents
- Modify system configuration
- View system-wide analytics
- Override permissions

**Superuser Operations**:

```python
# Admin login
admin_client = R2RClient("http://136.119.36.216:7272")
admin_client.users.login("admin@example.com", "admin_password")

# List all users
users = admin_client.users.list()

# Get user details
user = admin_client.users.get(user_id)

# Update user
admin_client.users.update_user(
    user_id,
    is_active=False,  # Suspend user
)

# Delete user
admin_client.users.delete_user(user_id)
```

### Access Control

**Resource-Level Permissions**:

```python
# Collections
# - Owner: Full control
# - Member: Read/search access

# Documents
# - Owner: Edit/delete
# - Collection members: Read access

# Search
# - Only returns results from user's collections
results = client.retrieval.search(
    query="confidential data",
    # Automatically filtered by user's permissions
)
```

### Security Considerations

1. **Password Requirements**: Enforce strong passwords
2. **Token Expiry**: Set appropriate expiry times
3. **Refresh Rotation**: Rotate refresh tokens
4. **Rate Limiting**: Prevent brute force attacks
5. **Email Verification**: Verify user emails
6. **Secure Storage**: Store tokens securely (httpOnly cookies)
7. **Audit Logging**: Track user actions

### Configuration

```toml
[auth]
provider = "r2r"  # or "supabase"
require_authentication = true
require_email_verification = false

[auth.access_token]
lifetime_seconds = 3600  # 1 hour

[auth.refresh_token]
lifetime_seconds = 2592000  # 30 days

[auth.password]
min_length = 8
require_uppercase = true
require_lowercase = true
require_digit = true
require_special = true
```

---

## 8. Retrieval

### Search

**Vector Search**:
```python
results = client.retrieval.search(
    query="machine learning algorithms",
    search_settings={
        "use_hybrid_search": False,
        "limit": 10,
    },
)
```

**Hybrid Search**:
```python
results = client.retrieval.search(
    query="API authentication",
    search_settings={
        "use_hybrid_search": True,
        "limit": 20,
    },
)
```

**Graph-Enhanced Search**:
```python
results = client.retrieval.search(
    query="company leadership",
    graph_search_settings={
        "enabled": True,
        "include_entities": True,
    },
)
```

### RAG

**Basic RAG**:
```python
response = client.retrieval.rag(
    query="How does OAuth work?",
)
```

**Streaming RAG**:
```python
stream = client.retrieval.rag(
    query="Explain GraphRAG",
    rag_generation_config={"stream": True},
)

for chunk in stream:
    print(chunk.delta, end="")
```

**Advanced RAG**:
```python
response = client.retrieval.rag(
    query="API best practices",
    rag_generation_config={
        "use_hyde": True,
        "use_fusion": True,
        "temperature": 0.7,
        "max_tokens": 2048,
    },
)
```

### Agent

**RAG Agent**:
```python
response = client.retrieval.agent(
    message={"content": "What are the security features?"},
    conversation_id=conversation_id,
    mode="rag",
)
```

**Research Agent**:
```python
response = client.retrieval.agent(
    message={"content": "Analyze the architecture"},
    mode="research",
    research_tools=["rag", "reasoning", "critique"],
)
```

---

## Summary

This reference covers all major R2R components. For implementation examples, see the main codebase and API documentation.

**Key Takeaways**:
- **Documents** are the foundation
- **Collections** provide organization
- **Graphs** enable relationship-aware retrieval
- **Deduplication** improves quality
- **Conversations** maintain context
- **Users** control access
- **Prompts** customize behavior

For questions or issues, consult the [R2R documentation](https://r2r-docs.sciphi.ai) or check the [troubleshooting guide](./TROUBLESHOOTING.md).
