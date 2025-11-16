# Liveblocks Integration Guide

> Real-time collaboration features for the Claude Code SDK + R2R application

## 📋 Overview

Liveblocks provides real-time collaboration capabilities including:
- **Live Cursors**: See other users' cursor positions in real-time
- **Presence**: Track who's online and what they're doing
- **Collaborative Editing**: Multiple users editing the same content
- **Comments & Threads**: Add commenting to any element
- **Notifications**: Real-time activity notifications

## 🚀 Quick Start

### 1. Installation

Liveblocks is already installed:
```bash
npm install @liveblocks/client @liveblocks/react @liveblocks/node
```

### 2. Get API Keys

1. Sign up at [liveblocks.io](https://liveblocks.io)
2. Create a new project
3. Copy your API keys from the dashboard

### 3. Configure Environment

```bash
# .env.local
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_xxx  # For development
LIVEBLOCKS_SECRET_KEY=sk_dev_xxx             # For authentication
```

### 4. Test the Demo

```bash
npm run dev
```

Visit `http://localhost:3000/collaboration` and open in multiple tabs to see live cursors!

## 🧩 Components

### Core Configuration

**File**: `liveblocks.config.ts`

Exports typed hooks and providers:
- `RoomProvider` - Wrap your app/page
- `useMyPresence` - Update your presence
- `useOthers` - Get other users
- `useUpdateMyPresence` - Update presence data

### Live Cursors Component

**File**: `components/liveblocks-cursor.tsx`

Pre-built component showing real-time cursors.

```tsx
import { LiveCursors } from '@/components/liveblocks-cursor'

<RoomProvider id="my-room">
  <LiveCursors />
  <YourContent />
</RoomProvider>
```

### Authentication Endpoint

**File**: `app/api/liveblocks-auth/route.ts`

Secure authentication for Liveblocks rooms.

**Current**: Demo mode (auto-generates user IDs)
**TODO**: Integrate with your auth system (NextAuth, Clerk, etc.)

## 📖 Usage Examples

### Example 1: Add Live Cursors to Chat

```tsx
// app/chat/page.tsx
import { RoomProvider } from '@/liveblocks.config'
import { LiveCursors } from '@/components/liveblocks-cursor'

export default function ChatPage() {
  return (
    <RoomProvider id="chat-room" initialPresence={{ cursor: null }}>
      <LiveCursors />
      <ChatInterface />
    </RoomProvider>
  )
}
```

### Example 2: Track User Presence

```tsx
'use client'

import { useOthers, useSelf } from '@/liveblocks.config'

function OnlineUsers() {
  const others = useOthers()
  const self = useSelf()

  return (
    <div>
      <p>You: {self.info?.name}</p>
      <p>{others.length} other users online</p>
      <ul>
        {others.map((user) => (
          <li key={user.connectionId}>{user.info?.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Example 3: Collaborative Selection

```tsx
'use client'

import { useMyPresence, useOthers } from '@/liveblocks.config'

function CollaborativeEditor() {
  const [{ selectedElement }, updatePresence] = useMyPresence()
  const others = useOthers()

  const handleSelectElement = (elementId: string) => {
    updatePresence({ selectedElement: elementId })
  }

  return (
    <div>
      {/* Show who's selecting what */}
      {others.map((user) => (
        user.presence.selectedElement && (
          <div key={user.connectionId}>
            {user.info?.name} is editing {user.presence.selectedElement}
          </div>
        )
      ))}
    </div>
  )
}
```

### Example 4: Typing Indicators

```tsx
'use client'

import { useMyPresence, useOthers } from '@/liveblocks.config'

function ChatInput() {
  const [, updatePresence] = useMyPresence()
  const others = useOthers()

  const typingUsers = others.filter(
    (user) => user.presence.isTyping
  )

  return (
    <div>
      <input
        onFocus={() => updatePresence({ isTyping: true })}
        onBlur={() => updatePresence({ isTyping: false })}
        placeholder="Type a message..."
      />

      {typingUsers.length > 0 && (
        <p className="text-sm text-gray-500">
          {typingUsers.map((u) => u.info?.name).join(', ')} typing...
        </p>
      )}
    </div>
  )
}
```

## 🔐 Security & Authentication

### Current Setup (Demo)

The current setup uses auto-generated user IDs for demonstration:

```typescript
// app/api/liveblocks-auth/route.ts
const userId = `user-${Math.random().toString(36).substring(7)}`
```

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

### Production Setup

#### Option 1: NextAuth.js Integration

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const liveblocksSession = liveblocks.prepareSession(
    session.user.id,
    {
      userInfo: {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image,
      }
    }
  )

  const { room } = await request.json()
  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)

  const { status, body } = await liveblocksSession.authorize()
  return new Response(body, { status })
}
```

#### Option 2: Clerk Integration

```typescript
import { auth } from "@clerk/nextjs"

export async function POST(request: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const liveblocksSession = liveblocks.prepareSession(userId, {
    userInfo: {
      // Fetch user data from Clerk
    }
  })

  // ... rest of the logic
}
```

#### Option 3: Custom JWT

```typescript
import { verify } from "jsonwebtoken"

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1]

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const decoded = verify(token, process.env.JWT_SECRET!)

  const liveblocksSession = liveblocks.prepareSession(
    decoded.sub as string,
    {
      userInfo: {
        name: decoded.name,
        email: decoded.email,
      }
    }
  )

  // ... rest of the logic
}
```

### Room Access Control

```typescript
// Add permission checks before granting room access
const hasAccess = await checkRoomPermission(userId, roomId)

if (!hasAccess) {
  return Response.json({ error: "Forbidden" }, { status: 403 })
}

// Grant specific permissions
liveblocksSession.allow(roomId, liveblocksSession.READ_ACCESS)
// or
liveblocksSession.allow(roomId, liveblocksSession.FULL_ACCESS)
```

## 🎨 Customization

### Custom Presence Data

Edit `liveblocks.config.ts` to add custom presence fields:

```typescript
type Presence = {
  cursor: { x: number; y: number } | null
  selectedElement: string | null
  isTyping: boolean
  // Add your custom fields:
  status: 'active' | 'away' | 'busy'
  currentPage: string
  selectedText: string | null
}
```

### Custom User Metadata

```typescript
type UserMeta = {
  id?: string
  info?: {
    name?: string
    email?: string
    avatar?: string
    // Add custom fields:
    role?: 'admin' | 'user' | 'guest'
    department?: string
  }
}
```

### Custom Cursor Colors

Edit `components/liveblocks-cursor.tsx`:

```typescript
function getUserColor(connectionId: number): string {
  // Your custom color logic
  return `hsl(${connectionId * 137.5}, 70%, 50%)`
}
```

## 📊 Use Cases in This App

### 1. Collaborative Chat Sessions

Multiple users chatting with the same R2R agent:

```tsx
<RoomProvider id={`chat-${chatId}`}>
  <LiveCursors />
  <ChatInterface />
</RoomProvider>
```

### 2. Knowledge Graph Collaboration

Multiple users exploring the knowledge graph together:

```tsx
<RoomProvider id={`graph-${projectId}`}>
  <LivePresence />
  <KnowledgeGraph />
</RoomProvider>
```

### 3. Document Co-editing

Collaborative editing of documents in R2R:

```tsx
<RoomProvider id={`doc-${documentId}`}>
  <CollaborativeEditor />
</RoomProvider>
```

### 4. Code Review Sessions

Live code review with real-time cursors and comments:

```tsx
<RoomProvider id={`review-${prId}`}>
  <LiveCursors />
  <CodeDiff />
</RoomProvider>
```

## 🚀 Advanced Features

### Storage (Shared State)

```typescript
import { useStorage, useMutation } from '@/liveblocks.config'

// In liveblocks.config.ts, define Storage type:
type Storage = {
  todos: LiveList<{ id: string; text: string; done: boolean }>
}

// In component:
const todos = useStorage((root) => root.todos)

const addTodo = useMutation(({ storage }, text: string) => {
  storage.get('todos').push({
    id: Date.now().toString(),
    text,
    done: false,
  })
}, [])
```

### Comments & Threads

```typescript
import { useThreads, useCreateThread } from '@/liveblocks.config'

const { threads } = useThreads()
const createThread = useCreateThread()

// Create a thread
await createThread({
  body: { content: 'Great work!' },
  metadata: { x: 100, y: 200 }
})
```

### Notifications

```typescript
import { useInboxNotifications } from '@liveblocks/react'

const { inboxNotifications } = useInboxNotifications()

// Show unread count
const unread = inboxNotifications.filter(n => !n.readAt).length
```

## 🔧 Performance

### Throttling Updates

Already configured in `liveblocks.config.ts`:

```typescript
const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
  throttle: 100, // Update every 100ms max
})
```

### Batching Operations

```typescript
import { useBatch } from '@/liveblocks.config'

const batch = useBatch()

// Group multiple updates into one network request
batch(() => {
  updatePresence({ cursor: { x: 100, y: 200 } })
  updatePresence({ selectedElement: 'el-123' })
  updatePresence({ isTyping: true })
})
```

### Offline Support

Liveblocks automatically handles:
- Connection drops and reconnects
- Offline queue for mutations
- Conflict resolution

Monitor connection status:

```typescript
import { useStatus } from '@/liveblocks.config'

const status = useStatus()
// status: 'initial' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
```

## 🐛 Troubleshooting

### "Failed to connect to Liveblocks"

**Cause**: Missing or invalid API keys

**Solution**:
```bash
# Check .env.local
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_xxx
LIVEBLOCKS_SECRET_KEY=sk_dev_xxx

# Restart dev server
npm run dev
```

### "Unauthorized" errors

**Cause**: Auth endpoint not configured properly

**Solution**: Check `app/api/liveblocks-auth/route.ts` and implement proper authentication

### Cursors not appearing

**Cause**: Not using `RoomProvider` or presence not initialized

**Solution**:
```tsx
<RoomProvider id="room-id" initialPresence={{ cursor: null }}>
  <LiveCursors />
</RoomProvider>
```

### High latency

**Cause**: Too many presence updates

**Solution**: Increase throttle value in `liveblocks.config.ts`

```typescript
throttle: 200, // Update every 200ms instead of 100ms
```

## 📚 Resources

- **Liveblocks Docs**: https://liveblocks.io/docs
- **Examples**: https://liveblocks.io/examples
- **Dashboard**: https://liveblocks.io/dashboard
- **Status Page**: https://status.liveblocks.io

## 🎯 Next Steps

1. **Replace demo auth** with production auth system
2. **Add comments** to chat messages or documents
3. **Implement storage** for shared state
4. **Add notifications** for activity updates
5. **Customize presence** for your use case

---

**🤝 Real-time Collaboration Powered by Liveblocks**
**⚡️ Sub-100ms Latency • 🔐 Secure • 🌍 Global Edge Network**
