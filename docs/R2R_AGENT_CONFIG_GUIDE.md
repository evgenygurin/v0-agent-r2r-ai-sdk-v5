# R2R Agent Configuration Guide

> Компактный справочник для агента, настраивающего R2R Agent

## Основные Режимы Agent

### 1. RAG Mode (Поиск + Генерация)
```typescript
rag_generation_config: {
  model: "claude-3-5-sonnet-20241022",  // haiku/sonnet/opus
  temperature: 0.7,                      // 0.0-1.0 (0.7 - balanced)
  max_tokens: 4096,                      // 1024-8192
  stream: true                           // Real-time streaming
}
```

**Когда использовать**: Простые вопросы, поиск в документах, factual queries

### 2. Research Mode (Глубокий Анализ)
```typescript
task_prompt_override: {
  system_prompt: "Глубокий анализ с критическим мышлением",
  max_steps: 10,                        // 5-20 steps
  enable_critique: true,                // Самокритика результатов
  enable_python_executor: false         // Выполнение кода (осторожно!)
}
```

**Когда использовать**: Сложные вопросы, требующие рассуждения, исследования

## Параметры Поиска (Search Settings)

### Базовая Конфигурация
```typescript
search_settings: {
  limit: 10,                            // 1-100 (10 - оптимально)
  search_mode: "advanced",              // basic/advanced/custom
  use_hybrid_search: true,              // Vector + Full-text
  use_semantic_search: true,            // Семантический поиск
  use_fulltext_search: true,            // Keyword поиск
  filters: {                            // Фильтрация результатов
    collection_ids: ["uuid"],
    document_ids: ["uuid"]
  }
}
```

### Hybrid Search Weights
```typescript
hybrid_search_settings: {
  full_text_weight: 1.0,               // 0.0-2.0 (1.0 - default)
  semantic_weight: 5.0,                // 0.0-10.0 (5.0 - default)
  rrf_k: 60                            // Reciprocal Rank Fusion K (60 - default)
}
```

**Правила**:
- **Semantic > Full-text**: Концептуальный поиск (semantic_weight: 5-10)
- **Full-text > Semantic**: Точные совпадения (full_text_weight: 2-5)
- **Balanced**: Default (1.0 / 5.0)

## Инструменты (Tools)

### RAG Mode Tools (Всегда Доступны)
```typescript
tools: [
  "search_file_knowledge",             // Поиск в документах (основной)
  "search_files_content",              // Полнотекстовый поиск
  "web_search",                        // Поиск в интернете (требует Serper API)
  "web_scrape"                         // Скрапинг веб-страниц
]
```

### Custom Tools
```typescript
// Регистрация кастомного инструмента
await client.tools.create({
  name: "custom_calculator",
  description: "Performs mathematical calculations",
  parameters: {
    type: "object",
    properties: {
      expression: { type: "string", description: "Math expression" }
    },
    required: ["expression"]
  }
})
```

## Лимиты и Ограничения

### Производительность
| Параметр | Минимум | Оптимум | Максимум | Использование |
|----------|---------|---------|----------|---------------|
| `limit` | 1 | 10 | 100 | Кол-во результатов поиска |
| `max_tokens` | 1024 | 4096 | 8192 | Длина ответа |
| `temperature` | 0.0 | 0.7 | 1.0 | Креативность (0=factual, 1=creative) |
| `max_steps` | 1 | 5-10 | 20 | Шаги рассуждения (Research mode) |
| `chunk_size` | 512 | 1024 | 2048 | Размер чанков при индексации |

### Токены и Стоимость
```typescript
// Haiku: Быстро, дешево (factual queries)
model: "claude-3-haiku-20240307"

// Sonnet: Баланс (рекомендуется для большинства задач)
model: "claude-3-5-sonnet-20241022"

// Opus: Максимальное качество (сложные исследования)
model: "claude-3-opus-20240229"
```

## Частные Правила

### 1. Chunking Strategy
```typescript
// Fast Mode - Простые документы
chunking_config: {
  chunk_size: 1024,
  chunk_overlap: 256,
  method: "recursive"                  // recursive/sentence/paragraph
}

// Hi-res Mode - Сложные документы (PDF, multimodal)
chunking_config: {
  chunk_size: 512,
  chunk_overlap: 128,
  method: "sentence"
}
```

### 2. Collection Management
```typescript
// ВСЕГДА используй collections для multi-user scenarios
await client.collections.create({
  name: "user_documents",
  description: "User-specific document collection"
})

// Scope поиска к collection
search_settings: {
  filters: { collection_ids: ["collection-uuid"] }
}
```

### 3. Knowledge Graph
```typescript
// Включение GraphRAG
graph_settings: {
  enabled: true,
  entity_types: ["PERSON", "ORG", "LOCATION", "CONCEPT"],
  max_entities: 1000,
  community_detection: true           // Leiden algorithm
}

// Когда использовать:
// ✅ Документы с множеством связей (академические, legal)
// ❌ Простые текстовые документы (overhead)
```

### 4. Streaming Events
```typescript
// Подписка на события
response.on("searchResults", (data) => {
  console.log("Найдено:", data.results.length)
})

response.on("llmResponse", (chunk) => {
  console.log("Токен:", chunk.content)
})

response.on("agentStep", (step) => {
  console.log("Шаг:", step.action, step.reasoning)
})
```

### 5. Caching Strategy
```typescript
// Для повторяющихся запросов
cache_config: {
  enabled: true,
  ttl: 3600,                          // 1 час
  cache_key_prefix: "r2r_agent"
}
```

## Presets (Готовые Конфигурации)

### Basic - Простой Поиск
```typescript
{
  search_mode: "basic",
  limit: 5,
  use_hybrid_search: false,
  rag_generation_config: {
    model: "claude-3-haiku-20240307",
    temperature: 0.5,
    max_tokens: 2048
  }
}
```

### Advanced - Hybrid Search
```typescript
{
  search_mode: "advanced",
  limit: 10,
  use_hybrid_search: true,
  hybrid_search_settings: {
    semantic_weight: 5.0,
    full_text_weight: 1.0
  },
  rag_generation_config: {
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.7,
    max_tokens: 4096
  }
}
```

### Research - Глубокий Анализ
```typescript
{
  search_mode: "advanced",
  limit: 20,
  use_hybrid_search: true,
  task_prompt_override: {
    max_steps: 10,
    enable_critique: true
  },
  rag_generation_config: {
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.8,
    max_tokens: 8192,
    stream: true
  }
}
```

### Deep Reasoning - Максимум
```typescript
{
  search_mode: "custom",
  limit: 30,
  use_hybrid_search: true,
  use_kg_search: true,                // Knowledge Graph
  task_prompt_override: {
    max_steps: 20,
    enable_critique: true,
    enable_python_executor: false     // Безопасность!
  },
  rag_generation_config: {
    model: "claude-3-opus-20240229",
    temperature: 0.9,
    max_tokens: 8192,
    stream: true
  }
}
```

## Best Practices

### ✅ DO
- Используй `collections` для изоляции пользовательских данных
- Включай `stream: true` для responsive UI
- Настраивай `chunk_size` под тип документов
- Используй `hybrid_search` для лучшего качества
- Ограничивай `limit` до 10-20 для производительности
- Используй `haiku` для простых queries, `sonnet` для сложных
- Включай `filters` для scope поиска

### ❌ DON'T
- **НЕ** включай `enable_python_executor` без sandboxing
- **НЕ** используй `limit > 50` без необходимости
- **НЕ** используй Knowledge Graph для простых документов
- **НЕ** забывай про rate limits API
- **НЕ** храни credentials в коде
- **НЕ** используй `opus` для всех запросов (дорого)

## Мониторинг

### Hatchet Dashboard
```text
http://136.119.36.216:7274
```

Проверяй:
- Workflow execution time
- Failed jobs
- Queue depth

### R2R Dashboard
```text
http://136.119.36.216:7273
```

Проверяй:
- Document processing status
- Conversation history
- System health

## Troubleshooting

### Низкое Качество Поиска
1. ✅ Увеличь `limit` до 15-20
2. ✅ Включи `use_hybrid_search: true`
3. ✅ Настрой `semantic_weight` (5-10)
4. ✅ Проверь chunking strategy

### Медленные Ответы
1. ✅ Уменьши `limit` до 5-10
2. ✅ Используй `haiku` вместо `sonnet`
3. ✅ Отключи Knowledge Graph
4. ✅ Включи caching

### Высокая Стоимость
1. ✅ Используй `haiku` по умолчанию
2. ✅ Уменьши `max_tokens`
3. ✅ Ограничь `max_steps` в Research mode
4. ✅ Включи caching для повторяющихся запросов

## Примеры API Calls

### TypeScript (Next.js API Route)
```typescript
export async function POST(req: Request) {
  const { messages, mode = 'rag' } = await req.json()

  const config = mode === 'research' ? PRESETS.research : PRESETS.advanced

  const response = await fetch(`${R2R_BASE_URL}/retrieval/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      ...config,
      rag_generation_config: {
        ...config.rag_generation_config,
        stream: true
      }
    })
  })

  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

### Python Client
```python
response = client.retrieval.agent(
    messages=[{"role": "user", "content": "Query"}],
    search_settings={"limit": 10, "use_hybrid_search": True},
    rag_generation_config={
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.7,
        "stream": True
    }
)

for chunk in response:
    print(chunk)
```

---

**Версия**: R2R v3.x (2024)
**Обновлено**: 2024-11
**Google Cloud Deployment**: http://136.119.36.216:7272
