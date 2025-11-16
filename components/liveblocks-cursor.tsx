'use client'

import { useMyPresence, useOthers } from '@/liveblocks.config'
import { useEffect, useState } from 'react'

/**
 * Live Cursor Component
 * Shows real-time cursors of all connected users
 *
 * Usage:
 * Wrap your app/page with RoomProvider from liveblocks.config
 *
 * Example:
 * <RoomProvider id="my-room-id" initialPresence={{ cursor: null }}>
 *   <LiveCursors />
 *   <YourContent />
 * </RoomProvider>
 */

interface CursorProps {
  x: number
  y: number
  name: string
  color: string
}

function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 transition-transform duration-100"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.66891 9.31127 9.91604L7.43907 14.4165C7.09186 15.2511 5.90335 15.2333 5.58136 14.3886L0.928548 2.18278Z"
          fill={color}
        />
      </svg>

      {/* Name label */}
      <div
        className="mt-1 rounded-full px-2 py-1 text-xs text-white shadow-md"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}

export function LiveCursors() {
  const [{ cursor }, updateMyPresence] = useMyPresence()
  const others = useOthers()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handlePointerMove = (e: PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: e.clientX,
          y: e.clientY,
        },
      })
    }

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null })
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [mounted, updateMyPresence])

  if (!mounted) return null

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info?.name || `User ${connectionId}`}
            color={getUserColor(connectionId)}
          />
        )
      })}
    </>
  )
}

/**
 * Generate consistent color for each user based on connection ID
 */
function getUserColor(connectionId: number): string {
  const colors = [
    '#E57373', // Red
    '#F06292', // Pink
    '#BA68C8', // Purple
    '#9575CD', // Deep Purple
    '#7986CB', // Indigo
    '#64B5F6', // Blue
    '#4FC3F7', // Light Blue
    '#4DD0E1', // Cyan
    '#4DB6AC', // Teal
    '#81C784', // Green
    '#AED581', // Light Green
    '#FFD54F', // Yellow
    '#FFB74D', // Orange
    '#FF8A65', // Deep Orange
  ]

  return colors[connectionId % colors.length]
}

/**
 * Connection Status Indicator
 * Shows current connection status to Liveblocks
 */
export function LiveblocksStatus() {
  const [{ cursor }] = useMyPresence()
  const others = useOthers()

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-sm text-white shadow-lg backdrop-blur">
      <div
        className={`h-2 w-2 rounded-full ${
          cursor ? 'bg-green-500' : 'bg-gray-500'
        }`}
      />
      <span>
        {others.length === 0
          ? 'Only you'
          : `${others.length} other${others.length > 1 ? 's' : ''} online`}
      </span>
    </div>
  )
}
