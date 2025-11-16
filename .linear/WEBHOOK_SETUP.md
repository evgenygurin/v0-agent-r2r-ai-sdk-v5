# Linear Webhook Setup Guide

Comprehensive guide for configuring Linear webhooks for closed-loop automation.

## 📋 Table of Contents

- [Overview](#overview)
- [Webhook Events](#webhook-events)
- [Setup Instructions](#setup-instructions)
- [Testing Webhooks](#testing-webhooks)
- [Automation Rules](#automation-rules)
- [Troubleshooting](#troubleshooting)

## Overview

Linear webhooks enable real-time event notifications to trigger automated workflows in the closed-loop system.

**Webhook Endpoint**: `https://your-app.vercel.app/api/webhooks/orchestrator`

### Key Benefits

- **Real-time notifications** when issues are created, updated, or closed
- **Closed-loop automation** - automatically resolve issues when PRs merge
- **Bi-directional sync** between Linear, GitHub, Sentry, and CI/CD
- **Custom automation rules** based on issue properties

## Webhook Events

### Supported Events

| Event | Description | Triggers |
|-------|-------------|----------|
| `Issue.create` | New issue created | Auto-triage, assignment |
| `Issue.update` | Issue updated | Status sync, priority escalation |
| `Issue.remove` | Issue deleted | Cleanup actions |
| `Comment.create` | New comment | Notifications, AI responses |
| `Project.create` | New project | Setup automation |
| `Project.update` | Project updated | Sync changes |

### Event Payload Example

```json
{
  "action": "create",
  "type": "Issue",
  "data": {
    "id": "issue-id-123",
    "identifier": "ENG-123",
    "title": "Production error in API",
    "description": "...",
    "priority": 1,
    "state": {
      "name": "In Progress",
      "type": "started"
    },
    "assignee": {
      "id": "user-id",
      "name": "John Doe"
    },
    "labels": [
      { "name": "bug" },
      { "name": "auto-generated" }
    ],
    "team": {
      "id": "team-id",
      "name": "Engineering"
    },
    "url": "https://linear.app/team/issue/ENG-123"
  },
  "webhookTimestamp": "2024-11-15T12:00:00.000Z"
}
```

## Setup Instructions

### 1. Create Webhook in Linear

```bash
# Via Linear App
1. Go to Settings → API → Webhooks
2. Click "New webhook"
3. Set URL: https://your-app.vercel.app/api/webhooks/orchestrator
4. Set Label: "Automation Orchestrator"
5. Select Resource types: Issue, Comment, Project
6. Copy the Signing Secret
```

### 2. Configure Environment Variables

```bash
# Add to Vercel Environment Variables
LINEAR_WEBHOOK_SECRET=your-signing-secret-here
LINEAR_API_KEY=lin_api_xxx  # For API calls back to Linear
```

### 3. Verify Webhook Endpoint

```bash
# Test webhook endpoint is running
curl -X POST https://your-app.vercel.app/api/webhooks/orchestrator \
  -H "Content-Type: application/json" \
  -H "x-webhook-source: linear" \
  -d '{"type":"Issue","action":"create","data":{"title":"Test"}}'
```

Expected response:
```json
{
  "received": true,
  "processed": true,
  "rulesMatched": 1,
  "actionsExecuted": 2
}
```

## Testing Webhooks

### Manual Testing

```bash
# Test Issue Creation Event
curl -X POST https://your-app.vercel.app/api/webhooks/orchestrator \
  -H "Content-Type: application/json" \
  -H "x-webhook-source: linear" \
  -H "linear-signature: test-signature" \
  -d '{
    "type": "Issue",
    "action": "create",
    "data": {
      "id": "test-issue",
      "identifier": "TEST-1",
      "title": "Test Issue",
      "labels": [{"name": "needs-fix"}]
    }
  }'

# Test Issue Update Event
curl -X POST https://your-app.vercel.app/api/webhooks/orchestrator \
  -H "Content-Type: application/json" \
  -H "x-webhook-source: linear" \
  -d '{
    "type": "Issue",
    "action": "update",
    "data": {
      "identifier": "TEST-1",
      "state": {"name": "Done", "type": "completed"}
    }
  }'
```

### Webhook Testing Tool

Use [webhook.site](https://webhook.site) for debugging:

```bash
# Temporarily point Linear webhook to webhook.site
1. Go to Linear Settings → Webhooks
2. Update URL to https://webhook.site/your-unique-url
3. Trigger events in Linear (create/update issues)
4. Inspect payloads in webhook.site
5. Update URL back to your app
```

## Automation Rules

### Current Automation Rules

See `app/api/webhooks/orchestrator/route.ts` for all rules. Key examples:

#### 1. Linear Issue → Codegen Fix

```typescript
{
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
}
```

#### 2. Linear Issue Status Sync

```typescript
{
  trigger: {
    source: 'linear',
    type: 'issue.update',
    conditions: {
      state: 'Done'
    }
  },
  actions: [
    {
      type: 'auto_resolve',
      config: {
        resolveLinearIssues: true,
        resolveSentryIssues: true
      }
    }
  ]
}
```

### Adding Custom Rules

Edit `app/api/webhooks/orchestrator/route.ts`:

```typescript
const AUTOMATION_RULES: AutomationRule[] = [
  // ... existing rules
  {
    id: 'your-custom-rule',
    trigger: {
      source: 'linear',
      type: 'issue.created',
      conditions: {
        // Your conditions
        priority: 0,  // Critical
        labels: ['production-incident']
      }
    },
    actions: [
      {
        type: 'notify',
        config: {
          channel: 'slack',
          severity: 'critical',
          message: 'Production incident detected!'
        }
      },
      {
        type: 'trigger_codegen',
        config: {
          prompt: 'Emergency fix needed',
          autoCreatePR: true
        }
      }
    ]
  }
]
```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Firing

**Symptoms**: No events received in orchestrator

**Solutions**:
```bash
# Check Linear webhook settings
1. Verify URL is correct
2. Check SSL certificate is valid
3. Ensure Resource types are selected
4. Check webhook is enabled

# Check Vercel logs
vercel logs --production
# Look for webhook requests

# Test endpoint manually
curl https://your-app.vercel.app/api/webhooks/orchestrator
```

#### 2. Signature Verification Failing

**Symptoms**: 401 Unauthorized responses

**Solutions**:
```bash
# Verify signing secret is correct
echo $LINEAR_WEBHOOK_SECRET

# Update in Vercel
vercel env add LINEAR_WEBHOOK_SECRET

# Check signature implementation
# See app/api/webhooks/orchestrator/route.ts:verifyWebhookSignature()
```

#### 3. Automation Not Triggering

**Symptoms**: Webhook received but no actions executed

**Solutions**:
```bash
# Check orchestrator logs
# Look for "Found X matching rules"

# Verify conditions match
# Example: Label "needs-fix" vs "needs_fix" (exact match required)

# Test rule matching
curl -X POST http://localhost:3000/api/webhooks/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"source":"linear","type":"issue.created",...}'
```

#### 4. Rate Limiting

**Symptoms**: 429 Too Many Requests

**Solutions**:
```bash
# Implement rate limiting in orchestrator
# Add exponential backoff for API calls
# Batch operations where possible

# Check Linear API rate limits
# https://developers.linear.app/docs/graphql/working-with-the-graphql-api#rate-limiting
```

### Debugging Tools

```bash
# Enable verbose logging
# In orchestrator route, add:
console.log('[Orchestrator] Event:', JSON.stringify(event, null, 2))
console.log('[Orchestrator] Matching rules:', matchingRules.length)

# Monitor in real-time
vercel logs --production --follow

# Check webhook delivery history in Linear
# Settings → API → Webhooks → [Your webhook] → Deliveries
```

### Webhook Payload Validation

```typescript
// Add validation middleware in orchestrator
import { z } from 'zod'

const LinearWebhookSchema = z.object({
  type: z.string(),
  action: z.enum(['create', 'update', 'remove']),
  data: z.object({
    id: z.string(),
    identifier: z.string().optional(),
    title: z.string().optional()
  })
})

// In POST handler
try {
  const payload = await req.json()
  LinearWebhookSchema.parse(payload)
  // ... process webhook
} catch (error) {
  return Response.json({ error: 'Invalid payload' }, { status: 400 })
}
```

## Monitoring

### Webhook Health Dashboard

Monitor webhook performance:

- **Delivery rate**: % of successful webhook deliveries
- **Processing time**: Time from webhook received to actions completed
- **Error rate**: % of failed automations
- **Actions executed**: Count by type (codegen, notify, resolve)

### Metrics Collection

```typescript
// In orchestrator, track metrics
const metrics = {
  webhooks_received: 1,
  webhooks_processed: matchingRules.length > 0 ? 1 : 0,
  rules_matched: matchingRules.length,
  actions_executed: results.length,
  actions_successful: successful,
  actions_failed: failed,
  processing_time_ms: endTime - startTime
}

// Send to monitoring service (e.g., Sentry, DataDog)
```

## Security Best Practices

### 1. Signature Verification

**ALWAYS** verify webhook signatures:

```typescript
async function verifyWebhookSignature(
  req: Request,
  signature: string | null,
  source: string
): Promise<boolean> {
  if (!signature) return false

  const secret = process.env.LINEAR_WEBHOOK_SECRET
  if (!secret) return false

  const body = await req.text()
  const expectedSignature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(body)
  )

  return signature === Buffer.from(expectedSignature).toString('hex')
}
```

### 2. Rate Limiting

Implement per-source rate limits:

```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(source: string): boolean {
  const limit = rateLimits.get(source)
  const now = Date.now()

  if (!limit || now > limit.resetAt) {
    rateLimits.set(source, { count: 1, resetAt: now + 60000 })
    return true
  }

  if (limit.count >= 100) {  // 100 req/min
    return false
  }

  limit.count++
  return true
}
```

### 3. Input Validation

**NEVER** trust webhook data:

```typescript
// Sanitize all string inputs
import DOMPurify from 'isomorphic-dompurify'

function sanitizeWebhookData(data: any): any {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data)
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeWebhookData)
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, sanitizeWebhookData(v)])
    )
  }
  return data
}
```

## Resources

- **Linear Webhooks Docs**: https://developers.linear.app/docs/graphql/webhooks
- **Linear API Reference**: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
- **Orchestrator Source**: `app/api/webhooks/orchestrator/route.ts`
- **Issue Templates**: `.linear/templates/`

---

**🤖 Part of the Closed-Loop Automation System**
**⚡️ Powered by Linear + Codegen + GitHub + Sentry**
