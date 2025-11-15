// Navigation Sidebar Component

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MessageSquare, FileText, Folder, Network, Activity, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const routes = [
  {
    label: 'Chat',
    icon: MessageSquare,
    href: '/',
    color: 'text-violet-500',
  },
  {
    label: 'Documents',
    icon: FileText,
    href: '/documents',
    color: 'text-pink-700',
  },
  {
    label: 'Collections',
    icon: Folder,
    href: '/collections',
    color: 'text-orange-700',
  },
  {
    label: 'Knowledge Graph',
    icon: Network,
    href: '/knowledge-graph',
    color: 'text-green-700',
  },
]

const externalLinks = [
  {
    label: 'R2R Dashboard',
    href: 'http://136.119.36.216:7273',
    icon: Activity,
  },
  {
    label: 'Hatchet',
    href: 'http://136.119.36.216:7274',
    icon: Activity,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-y-4 border-r bg-card p-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 text-lg font-semibold">Claude Code + R2R</h2>
        <p className="text-xs text-muted-foreground">AI SDK Integration</p>
      </div>
      <div className="flex-1 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              pathname === route.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <route.icon className={cn('h-5 w-5', route.color)} />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="border-t pt-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
          DASHBOARDS
        </div>
        {externalLinks.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
              <ExternalLink className="ml-auto h-3 w-3" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  )
}
