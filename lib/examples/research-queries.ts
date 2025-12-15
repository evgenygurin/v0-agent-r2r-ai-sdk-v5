// Example queries for the R2R Deep Research Agent
// These demonstrate various research capabilities and tool usage

export const exampleQueries = {
  technical: [
    {
      query: "Compare vector databases for multi-tenant SaaS applications and provide an infrastructure diagram",
      description: "Multi-step research with architecture visualization",
      expectedTools: ["rag", "reasoning", "web_search"],
      complexity: "high",
    },
    {
      query: "Explain how Next.js middleware works and show examples of authentication implementation",
      description: "Documentation-heavy query that will use Context7",
      expectedTools: ["context7", "rag"],
      complexity: "medium",
    },
    {
      query: "What are the best practices for implementing real-time features in React applications?",
      description: "Current best practices research",
      expectedTools: ["web_search", "rag", "reasoning"],
      complexity: "medium",
    },
  ],

  business: [
    {
      query: "Analyze the impact of AI on software development productivity and provide quantitative data",
      description: "Research with data analysis",
      expectedTools: ["web_search", "reasoning", "critique"],
      complexity: "high",
    },
    {
      query: "What are the key considerations for scaling a SaaS platform from 100 to 10,000 users?",
      description: "Multi-faceted business and technical research",
      expectedTools: ["rag", "reasoning", "critique"],
      complexity: "high",
    },
  ],

  codeGeneration: [
    {
      query: "Generate a TypeScript implementation of a rate limiter using the token bucket algorithm",
      description: "Code generation with explanation",
      expectedTools: ["reasoning", "python_executor"],
      complexity: "medium",
    },
    {
      query: "Create a Next.js API route that implements JWT authentication with refresh tokens",
      description: "Framework-specific code with Context7",
      expectedTools: ["context7", "reasoning"],
      complexity: "medium",
    },
  ],

  deepReasoning: [
    {
      query:
        "Design a distributed caching strategy for a global CDN and explain trade-offs between consistency and performance",
      description: "Complex system design with critique",
      expectedTools: ["reasoning", "critique", "web_search"],
      complexity: "very high",
    },
    {
      query: "Explain the mathematical foundations of transformer models and how attention mechanisms work",
      description: "Deep technical explanation with mathematical reasoning",
      expectedTools: ["reasoning", "rag", "python_executor"],
      complexity: "very high",
    },
  ],

  documentation: [
    {
      query: "How do I use shadcn/ui tabs component with Next.js App Router?",
      description: "Framework-specific documentation query",
      expectedTools: ["context7"],
      complexity: "low",
    },
    {
      query: "Show me how to implement server actions in Next.js 15 with error handling",
      description: "Version-specific documentation with examples",
      expectedTools: ["context7", "reasoning"],
      complexity: "medium",
    },
  ],
}

export const getRandomQuery = (category?: keyof typeof exampleQueries): string => {
  if (category && exampleQueries[category]) {
    const queries = exampleQueries[category]
    const random = queries[Math.floor(Math.random() * queries.length)]
    return random.query
  }

  // Get random from all categories
  const allQueries = Object.values(exampleQueries).flat()
  const random = allQueries[Math.floor(Math.random() * allQueries.length)]
  return random.query
}

export const getQueryByComplexity = (complexity: "low" | "medium" | "high" | "very high"): string[] => {
  const allQueries = Object.values(exampleQueries).flat()
  return allQueries.filter((q) => q.complexity === complexity).map((q) => q.query)
}
