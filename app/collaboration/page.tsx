'use client'

import { RoomProvider } from '@/liveblocks.config'
import { LiveCursors, LiveblocksStatus } from '@/components/liveblocks-cursor'
import { ClientSideSuspense } from '@liveblocks/react'

/**
 * Collaboration Demo Page
 *
 * Demonstrates Liveblocks real-time collaboration features:
 * - Live cursors showing other users' mouse positions
 * - Presence indicators showing who's online
 * - Real-time sync across multiple users
 *
 * To test:
 * 1. Open this page in multiple browser tabs/windows
 * 2. Move your cursor - you'll see it appear in other tabs
 * 3. Open in incognito/private mode to simulate different users
 */

function CollaborationRoom() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Live cursors overlay */}
      <LiveCursors />

      {/* Connection status */}
      <LiveblocksStatus />

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Real-time Collaboration Demo
          </h1>
          <p className="text-gray-300">
            Open this page in multiple tabs to see live cursors and presence
          </p>
        </div>

        {/* Demo canvas */}
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Collaborative Canvas
          </h2>

          <div className="mb-6 rounded-lg bg-gray-50 p-6">
            <h3 className="mb-3 font-semibold text-gray-700">Features:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Live cursor tracking across all connected users
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Real-time presence indicators
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                Sub-100ms latency synchronization
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Automatic reconnection handling
              </li>
            </ul>
          </div>

          <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">
              Move your cursor around this area
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Open another tab to see collaborative cursors
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              Integration Examples:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>Add to chat interface for multi-user conversations</li>
              <li>Enable collaborative document editing</li>
              <li>Show real-time activity in Knowledge Graph</li>
              <li>Implement live code review sessions</li>
            </ul>
          </div>
        </div>

        {/* Usage guide */}
        <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-white/10 p-6 backdrop-blur">
          <h3 className="mb-4 text-xl font-bold text-white">
            How to Integrate
          </h3>

          <div className="space-y-4 font-mono text-sm text-gray-300">
            <div>
              <p className="mb-2 text-gray-400">1. Wrap your component:</p>
              <pre className="rounded bg-black/50 p-3 text-green-400">
{`<RoomProvider id="room-id">
  <YourComponent />
</RoomProvider>`}
              </pre>
            </div>

            <div>
              <p className="mb-2 text-gray-400">2. Add live cursors:</p>
              <pre className="rounded bg-black/50 p-3 text-green-400">
{`import { LiveCursors } from '@/components/liveblocks-cursor'

<LiveCursors />`}
              </pre>
            </div>

            <div>
              <p className="mb-2 text-gray-400">3. Use presence hooks:</p>
              <pre className="rounded bg-black/50 p-3 text-green-400">
{`const [myPresence, updateMyPresence] = useMyPresence()
const others = useOthers()`}
              </pre>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://liveblocks.io/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-6 py-2 font-semibold text-gray-900 transition-transform hover:scale-105"
            >
              View Documentation →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CollaborationPage() {
  return (
    <RoomProvider
      id="collaboration-demo"
      initialPresence={{
        cursor: null,
        selectedElement: null,
        isTyping: false,
      }}
    >
      <ClientSideSuspense fallback={<div>Loading collaboration...</div>}>
        {() => <CollaborationRoom />}
      </ClientSideSuspense>
    </RoomProvider>
  )
}
