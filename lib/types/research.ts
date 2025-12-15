export interface ResearchStep {
  id: string
  type: "planning" | "tool_call" | "tool_result" | "thinking" | "synthesis"
  status: "pending" | "running" | "complete" | "error"
  timestamp: number
  duration?: number
  description: string
  toolName?: string
  content?: string
  metadata?: Record<string, any>
}

export interface Citation {
  id: string
  title: string
  url?: string
  snippet: string
  domain?: string
  relevanceScore?: number
  sections: string[] // Which answer sections this citation supports
}

export interface ToolUsage {
  name: string
  description: string
  callCount: number
  avgDuration: number
  lastUsed: number
}

export interface GraphNode {
  id: string
  label: string
  type: "document" | "entity" | "concept"
  metadata?: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  type: string
  weight?: number
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ResearchRun {
  id: string
  query: string
  status: "idle" | "planning" | "researching" | "synthesizing" | "complete" | "error"
  startTime: number
  endTime?: number
  steps: ResearchStep[]
  finalAnswer: string
  citations: Citation[]
  toolsUsed: ToolUsage[]
  graph?: KnowledgeGraph
  conversationId?: string
  model: string
  temperature: number
  error?: string
}

export interface ResearchHistory {
  runs: ResearchRun[]
  lastUpdated: number
}

export interface StreamEvent {
  type: "status" | "step" | "token" | "citation" | "tool" | "graph" | "complete" | "error"
  data: any
  timestamp: number
}
