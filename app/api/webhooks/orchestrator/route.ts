// Webhook Orchestrator - Замкнутый цикл автоматизации
// Обрабатывает события от Sentry, Linear, GitHub, CircleCI

export const runtime = 'edge'
export const maxDuration = 300 // 5 минут для долгих операций

interface WebhookEvent {
  source: 'sentry' | 'linear' | 'github' | 'circleci'
  type: string
  data: any
  timestamp: string
}

interface AutomationRule {
  id: string
  trigger: {
    source: string
    type: string
    conditions?: Record<string, any>
  }
  actions: Array<{
    type: 'create_linear_issue' | 'create_pr' | 'trigger_codegen' | 'notify' | 'auto_resolve'
    config: Record<string, any>
  }>
}

// Правила автоматизации для замкнутого цикла
const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'sentry-error-to-linear',
    trigger: {
      source: 'sentry',
      type: 'error.created',
      conditions: {
        level: ['error', 'fatal']
      }
    },
    actions: [
      {
        type: 'create_linear_issue',
        config: {
          priority: 1,
          labels: ['auto-generated', 'sentry-error'],
          assignTeam: true
        }
      },
      {
        type: 'trigger_codegen',
        config: {
          prompt: 'Analyze and fix this Sentry error',
          autoCreatePR: true
        }
      }
    ]
  },
  {
    id: 'linear-issue-to-pr',
    trigger: {
      source: 'linear',
      type: 'issue.created',
      conditions: {
        labels: ['needs-fix', 'bug']
      }
    },
    actions: [
      {
        type: 'trigger_codegen',
        config: {
          prompt: 'Implement fix for this Linear issue',
          linkToPR: true
        }
      }
    ]
  },
  {
    id: 'github-ci-failure-auto-fix',
    trigger: {
      source: 'github',
      type: 'workflow_run.completed',
      conditions: {
        conclusion: 'failure'
      }
    },
    actions: [
      {
        type: 'create_linear_issue',
        config: {
          title: 'CI Failure: Auto-fix required',
          priority: 2
        }
      },
      {
        type: 'trigger_codegen',
        config: {
          prompt: 'Analyze CI logs and create fix',
          autoCreatePR: true
        }
      }
    ]
  },
  {
    id: 'circleci-failure-escalation',
    trigger: {
      source: 'circleci',
      type: 'workflow-completed',
      conditions: {
        status: 'failed'
      }
    },
    actions: [
      {
        type: 'create_linear_issue',
        config: {
          priority: 1,
          labels: ['ci-failure', 'needs-attention']
        }
      },
      {
        type: 'notify',
        config: {
          channel: 'slack',
          severity: 'high'
        }
      }
    ]
  },
  {
    id: 'pr-merged-resolve-issues',
    trigger: {
      source: 'github',
      type: 'pull_request.closed',
      conditions: {
        merged: true
      }
    },
    actions: [
      {
        type: 'auto_resolve',
        config: {
          resolveLinearIssues: true,
          resolveSentryIssues: true,
          comment: 'Auto-resolved: PR merged successfully'
        }
      }
    ]
  }
]

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-webhook-signature')
    const source = req.headers.get('x-webhook-source') as WebhookEvent['source']

    if (!source) {
      return Response.json({ error: 'Missing webhook source' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(req, signature, source)
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = await req.json()

    // Создаем событие
    const event: WebhookEvent = {
      source,
      type: payload.type || payload.event || 'unknown',
      data: payload,
      timestamp: new Date().toISOString()
    }

    console.log(`[Orchestrator] Received ${event.source}:${event.type}`)

    // Находим подходящие правила
    const matchingRules = AUTOMATION_RULES.filter(rule =>
      matchesRule(rule, event)
    )

    if (matchingRules.length === 0) {
      console.log('[Orchestrator] No matching rules found')
      return Response.json({
        received: true,
        processed: false,
        message: 'No automation rules matched'
      })
    }

    console.log(`[Orchestrator] Found ${matchingRules.length} matching rules`)

    // Выполняем действия асинхронно
    const results = await Promise.allSettled(
      matchingRules.flatMap(rule =>
        rule.actions.map(action =>
          executeAction(action, event)
        )
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return Response.json({
      received: true,
      processed: true,
      rulesMatched: matchingRules.length,
      actionsExecuted: results.length,
      successful,
      failed,
      timestamp: event.timestamp
    })

  } catch (error) {
    console.error('[Orchestrator] Error:', error)
    return Response.json(
      {
        error: 'Orchestrator processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function matchesRule(rule: AutomationRule, event: WebhookEvent): boolean {
  // Проверка source
  if (rule.trigger.source !== event.source) {
    return false
  }

  // Проверка type
  if (rule.trigger.type !== event.type) {
    return false
  }

  // Проверка дополнительных условий
  if (rule.trigger.conditions) {
    for (const [key, value] of Object.entries(rule.trigger.conditions)) {
      const eventValue = getNestedProperty(event.data, key)

      if (Array.isArray(value)) {
        if (!value.includes(eventValue)) return false
      } else if (eventValue !== value) {
        return false
      }
    }
  }

  return true
}

async function executeAction(
  action: AutomationRule['actions'][0],
  event: WebhookEvent
): Promise<any> {
  console.log(`[Orchestrator] Executing ${action.type}`)

  switch (action.type) {
    case 'create_linear_issue':
      return createLinearIssue(event, action.config)

    case 'create_pr':
      return createPullRequest(event, action.config)

    case 'trigger_codegen':
      return triggerCodegen(event, action.config)

    case 'notify':
      return sendNotification(event, action.config)

    case 'auto_resolve':
      return autoResolveIssues(event, action.config)

    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

async function createLinearIssue(event: WebhookEvent, config: any): Promise<any> {
  const LINEAR_API_KEY = process.env.LINEAR_API_KEY

  if (!LINEAR_API_KEY) {
    console.warn('[Orchestrator] LINEAR_API_KEY not configured')
    return null
  }

  const title = config.title || extractTitle(event)
  const description = extractDescription(event)

  const mutation = `
    mutation IssueCreate($title: String!, $description: String!, $priority: Int) {
      issueCreate(input: {
        title: $title
        description: $description
        priority: $priority
        labels: ${JSON.stringify(config.labels || [])}
      }) {
        success
        issue {
          id
          identifier
          url
        }
      }
    }
  `

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        title,
        description,
        priority: config.priority || 3
      }
    })
  })

  const data = await response.json()
  console.log(`[Orchestrator] Created Linear issue: ${data.data?.issueCreate?.issue?.identifier}`)

  return data.data?.issueCreate?.issue
}

async function triggerCodegen(event: WebhookEvent, config: any): Promise<any> {
  const CODEGEN_ORG_ID = process.env.CODEGEN_ORG_ID
  const CODEGEN_API_KEY = process.env.CODEGEN_API_KEY

  if (!CODEGEN_ORG_ID || !CODEGEN_API_KEY) {
    console.warn('[Orchestrator] Codegen not configured')
    return null
  }

  const prompt = buildCodegenPrompt(event, config)

  const response = await fetch(
    `https://api.codegen.com/v1/organizations/${CODEGEN_ORG_ID}/agent/run`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CODEGEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        metadata: {
          source: event.source,
          type: event.type,
          timestamp: event.timestamp
        }
      })
    }
  )

  const data = await response.json()
  console.log(`[Orchestrator] Triggered Codegen task: ${data.id}`)

  return data
}

async function sendNotification(event: WebhookEvent, config: any): Promise<any> {
  // Заглушка для уведомлений (Slack, Email, etc.)
  console.log(`[Orchestrator] Notification (${config.channel}):`, {
    severity: config.severity,
    event: `${event.source}:${event.type}`
  })
  return { sent: true }
}

async function autoResolveIssues(event: WebhookEvent, config: any): Promise<any> {
  const results = []

  // Resolve Linear issues
  if (config.resolveLinearIssues) {
    // Извлекаем ID issues из PR description или commits
    const issueIds = extractLinearIssues(event.data)
    for (const issueId of issueIds) {
      const result = await resolveLinearIssue(issueId, config.comment)
      results.push(result)
    }
  }

  // Resolve Sentry issues
  if (config.resolveSentryIssues) {
    const sentryIssueIds = extractSentryIssues(event.data)
    for (const issueId of sentryIssueIds) {
      const result = await resolveSentryIssue(issueId, config.comment)
      results.push(result)
    }
  }

  return results
}

// Helper functions
function verifyWebhookSignature(req: Request, signature: string | null, source: string): boolean {
  // Заглушка - в продакшене проверять HMAC signature
  return true
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function extractTitle(event: WebhookEvent): string {
  if (event.source === 'sentry') {
    return `Sentry Error: ${event.data.error?.message || 'Unknown error'}`
  }
  if (event.source === 'github') {
    return `CI Failure: ${event.data.workflow?.name || 'Unknown workflow'}`
  }
  return `${event.source} Event: ${event.type}`
}

function extractDescription(event: WebhookEvent): string {
  return `
**Source**: ${event.source}
**Type**: ${event.type}
**Timestamp**: ${event.timestamp}

**Event Data**:
\`\`\`json
${JSON.stringify(event.data, null, 2).slice(0, 1000)}
\`\`\`
  `.trim()
}

function buildCodegenPrompt(event: WebhookEvent, config: any): string {
  const basePrompt = config.prompt || 'Analyze this event and suggest actions'
  const context = extractDescription(event)

  return `${basePrompt}\n\n${context}`
}

function extractLinearIssues(data: any): string[] {
  // Ищем упоминания Linear issues (например, "Fixes ABC-123")
  const text = JSON.stringify(data)
  const matches = text.match(/[A-Z]{2,}-\d+/g) || []
  return [...new Set(matches)]
}

function extractSentryIssues(data: any): string[] {
  // Ищем Sentry issue IDs
  const sentryIds: string[] = []
  if (data.issue_id) sentryIds.push(data.issue_id)
  return sentryIds
}

async function resolveLinearIssue(issueId: string, comment: string): Promise<any> {
  const LINEAR_API_KEY = process.env.LINEAR_API_KEY
  if (!LINEAR_API_KEY) return null

  const mutation = `
    mutation IssueUpdate($id: String!, $state: String!) {
      issueUpdate(id: $id, input: {
        stateId: $state
      }) {
        success
      }
    }
  `

  // Заглушка - в продакшене получить ID completed state
  const completedStateId = 'completed'

  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': LINEAR_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: mutation,
      variables: { id: issueId, state: completedStateId }
    })
  })

  return response.json()
}

async function resolveSentryIssue(issueId: string, comment: string): Promise<any> {
  const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN
  const SENTRY_ORG = process.env.SENTRY_ORG
  const SENTRY_PROJECT = process.env.SENTRY_PROJECT

  if (!SENTRY_AUTH_TOKEN) return null

  const response = await fetch(
    `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/${issueId}/`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'resolved',
        statusDetails: { comment }
      })
    }
  )

  return response.json()
}

async function createPullRequest(event: WebhookEvent, config: any): Promise<any> {
  // Заглушка для создания PR через GitHub API
  console.log('[Orchestrator] Creating PR:', config)
  return { created: true }
}
