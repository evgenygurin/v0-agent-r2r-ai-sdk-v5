"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Brain,
  FileText,
  Folder,
  Network,
  Settings,
  Activity,
  BookOpen,
  Code2,
  Search,
  Calculator,
  Command,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        <Command className="h-4 w-4" />
        <span className="hidden sm:inline">Search commands...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Brain className="mr-2 h-4 w-4" />
              <span>Research Agent</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/documents"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/collections"))}>
              <Folder className="mr-2 h-4 w-4" />
              <span>Collections</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/knowledge-graph"))}>
              <Network className="mr-2 h-4 w-4" />
              <span>Knowledge Graph</span>
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Tools">
            <CommandItem onSelect={() => runCommand(() => router.push("/mcp/context7"))}>
              <Code2 className="mr-2 h-4 w-4" />
              <span>Context7 - Documentation</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/mcp/codegen"))}>
              <Code2 className="mr-2 h-4 w-4" />
              <span>Codegen - Code Analysis</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/search/hybrid"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Hybrid Search</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tools/python"))}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Python Executor</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="External">
            <CommandItem onSelect={() => runCommand(() => window.open("http://136.119.36.216:7273", "_blank"))}>
              <Activity className="mr-2 h-4 w-4" />
              <span>R2R Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => window.open("http://136.119.36.216:7274", "_blank"))}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Hatchet Dashboard</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
