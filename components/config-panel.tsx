'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface ConfigPanelProps {
  useR2R: boolean
  setUseR2R: (value: boolean) => void
  preset: string
  setPreset: (value: string) => void
}

export function ConfigPanel({ useR2R, setUseR2R, preset, setPreset }: ConfigPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Adjust agent behavior and features
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="use-r2r">Use R2R Agent</Label>
            <p className="text-xs text-muted-foreground">
              Enable document search and reasoning
            </p>
          </div>
          <Switch
            id="use-r2r"
            checked={useR2R}
            onCheckedChange={setUseR2R}
          />
        </div>
      </Card>

      <div className="space-y-2">
        <Label>Preset</Label>
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fast">Fast (Haiku)</SelectItem>
            <SelectItem value="balanced">Balanced (Sonnet)</SelectItem>
            <SelectItem value="powerful">Powerful (Opus)</SelectItem>
            {useR2R && (
              <>
                <SelectItem value="basic">RAG Basic</SelectItem>
                <SelectItem value="advanced">RAG Advanced</SelectItem>
                <SelectItem value="research">Research Mode</SelectItem>
                <SelectItem value="deepReasoning">Deep Reasoning</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 space-y-2">
        <h4 className="text-sm font-medium text-foreground">Preset Details</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {preset === 'fast' && (
            <p>Quick responses with Claude Haiku model</p>
          )}
          {preset === 'balanced' && (
            <p>Balanced performance with Claude Sonnet model</p>
          )}
          {preset === 'powerful' && (
            <p>Maximum capability with Claude Opus model</p>
          )}
          {preset === 'basic' && (
            <p>Simple document search with R2R</p>
          )}
          {preset === 'advanced' && (
            <p>Hybrid search with web capabilities</p>
          )}
          {preset === 'research' && (
            <p>Deep reasoning with critique and analysis</p>
          )}
          {preset === 'deepReasoning' && (
            <p>Full research mode with Python executor</p>
          )}
        </div>
      </Card>
    </div>
  )
}
