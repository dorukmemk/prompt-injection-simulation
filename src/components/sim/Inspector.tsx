import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Beat, Profile, Scenario } from '@/lib/types'
import { TRUST_META } from '@/lib/trust'
import { nodeLabel } from '@/lib/copy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const TONE: Record<string, string> = {
  neutral: 'var(--foreground)',
  warn: '#ffd479',
  danger: '#ff9aa2',
  safe: '#8ff0a4',
}

export function Inspector({
  beat,
  scenario,
  profile,
  selectedNode,
  onClose,
}: {
  beat: Beat
  scenario: Scenario
  profile: Profile
  selectedNode: string | null
  onClose: () => void
}) {
  const node = selectedNode ? scenario.nodes.find((n) => n.id === selectedNode) : null
  const rows = (beat.inspector ?? []).filter((r) => !r.tech || profile.tech)
  if (!node && rows.length === 0 && !(profile.tech && beat.trace)) return null

  return (
    <div className="material window-shadow flex w-full flex-col gap-2.5 rounded-xl p-3">
      <AnimatePresence mode="wait">
        {node && (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-card/60 rounded-lg border p-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold">{nodeLabel(node, profile)}</div>
                {node.sub && (
                  <div className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                    {node.sub}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Kapat">
                <X />
              </Button>
            </div>
            {node.trust && (
              <Badge
                variant="outline"
                className="mt-1.5"
                style={{
                  color: TRUST_META[node.trust].color,
                  borderColor: `${TRUST_META[node.trust].color}55`,
                }}
              >
                {profile.id === 'explorer'
                  ? TRUST_META[node.trust].labelSimple
                  : TRUST_META[node.trust].label}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {rows.length > 0 && (
        <div className="flex flex-col gap-1">
          {rows.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 text-[11.5px]">
              <span className="text-muted-foreground shrink-0">{r.label}</span>
              <span className="text-right font-medium" style={{ color: TONE[r.tone ?? 'neutral'] }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {profile.tech && beat.trace && (
        <>
          <Separator />
          <pre className="max-h-[140px] overflow-auto rounded-md bg-black/40 p-2 font-mono text-[10.5px] leading-relaxed">
            {JSON.stringify(beat.trace, null, 2)}
          </pre>
        </>
      )}
    </div>
  )
}
