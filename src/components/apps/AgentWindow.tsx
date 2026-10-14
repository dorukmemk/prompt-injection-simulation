import { useState } from 'react'
import { FileText, FolderClosed, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCENARIO_MAP, scenariosForApp } from '@/lib/scenarios'
import { useApp, type WindowState } from '@/store/useApp'
import type { VariantId } from '@/lib/types'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Outcome, RunToolbar, SidebarScenarios, Thinking } from './parts'
import { DocumentPage } from '@/components/doc/DocumentPage'

const FILES = Array.from({ length: 14 }, (_, i) => `aday-${String(i + 1).padStart(2, '0')}.pdf`)

export function AgentWindow({ win }: { win: WindowState }) {
  const list = scenariosForApp('agent')
  const [sid, setSid] = useState(list[0]?.id ?? '')
  const [showHidden, setShowHidden] = useState(false)
  const [variant, setVariant] = useState<VariantId>('vulnerable')
  const run = useApp((s) => s.run)
  const scenario = SCENARIO_MAP[sid]
  const active = run && run.scenarioId === sid

  return (
    <Window
      id="agent"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full">
          <div className="px-2 py-2 font-mono text-[11.5px]">
            <div className="text-muted-foreground flex items-center gap-1.5 px-2 py-1">
              <FolderClosed className="size-3.5" /> basvurular
            </div>
            {FILES.map((f) => (
              <div
                key={f}
                className={cn(
                  'flex items-center gap-1.5 rounded px-2 py-[3px] pl-5',
                  f === 'aday-07.pdf' ? 'bg-[#ffd479]/12 text-[#ffd479]' : 'text-muted-foreground',
                )}
              >
                <FileText className="size-3" />
                {f}
              </div>
            ))}
            <div className="text-muted-foreground mt-2 flex items-center gap-1.5 px-2 py-1">
              <FolderClosed className="size-3.5" /> config
            </div>
            <div className="flex items-center gap-1.5 px-2 py-[3px] pl-5 text-[#ff9aa2]">
              <Lock className="size-3" /> anahtarlar.env
            </div>
          </div>
          <Separator />
          <SidebarScenarios list={list} value={sid} onChange={setSid} />
        </ScrollArea>
      }
      toolbar={
        scenario && (
          <RunToolbar
            scenario={scenario}
            variant={variant}
            onVariant={setVariant}
            showHidden={showHidden}
            onToggleHidden={() => setShowHidden((v) => !v)}
            label="Değerlendir"
          />
        )
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3.5 p-4">
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight">
              {scenario?.payload.sourceLabel}
            </h2>
            <p className="text-muted-foreground font-mono text-[11px]">
              {scenario?.payload.sourceMeta}
            </p>
          </div>
          <Separator />
          {scenario && (
            <DocumentPage doc={scenario.payload.doc} reveal={showHidden} compact />
          )}


          {scenario && (
            <>
              <Separator />
              <div className="bg-card/50 rounded-lg border p-3 font-mono text-[12px]">
                {scenario.userPrompt}
              </div>
              {active && run.phase !== 'closed' && <Thinking label="Ajan planlıyor" />}
              {active && run.phase === 'closed' && run.finished && <Outcome scenario={scenario} />}
            </>
          )}
        </div>
      </ScrollArea>
    </Window>
  )
}
