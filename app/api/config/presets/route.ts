// Configuration presets endpoint

import { ragPresets } from '@/lib/config/r2r-config'
import { claudePresets } from '@/lib/config/claude-config'

export const runtime = 'edge'

export async function GET() {
  return Response.json({
    ragPresets: Object.keys(ragPresets),
    claudePresets: Object.keys(claudePresets),
    presetDetails: {
      rag: ragPresets,
      claude: claudePresets,
    },
  })
}
