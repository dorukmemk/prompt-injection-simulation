import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, RotateCw } from 'lucide-react'
import { SCENARIO_MAP, scenariosForApp } from '@/lib/scenarios'
import { useApp, type WindowState } from '@/store/useApp'
import type { VariantId } from '@/lib/types'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Outcome, RunToolbar, SidebarScenarios, Thinking } from './parts'
import { DocumentPage } from '@/components/doc/DocumentPage'

export function BrowserWindow({ win }: { win: WindowState }) {
  const list = scenariosForApp('browser')
  const [sid, setSid] = useState(list[0]?.id ?? '')
  const [showHidden, setShowHidden] = useState(false)
  const [variant, setVariant] = useState<VariantId>('vulnerable')
  const run = useApp((s) => s.run)
  const scenario = SCENARIO_MAP[sid]
  const active = run && run.scenarioId === sid

  return (
    <Window
      id="browser"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full">
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
            label="Özetle"
          />
        )
      }
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
        <div className="text-muted-foreground flex gap-1">
          <ChevronLeft className="size-3.5" />
          <ChevronRight className="size-3.5" />
          <RotateCw className="size-3.5" />
        </div>
        <div className="bg-background/50 flex min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 py-1">
          <Lock className="size-3 text-[#32d74b]" />
          <span className="text-muted-foreground truncate font-mono text-[11px]">
            {scenario?.payload.sourceLabel}
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-[620px] flex-col gap-3.5 p-5">
          {scenario && (
            <DocumentPage doc={scenario.payload.doc} reveal={showHidden} compact />
          )}


          {scenario && (
            <>
              <Separator />
              <div className="bg-card/50 rounded-lg border p-3 text-[12.5px]">
                {scenario.userPrompt}
              </div>
              {active && run.phase !== 'closed' && <Thinking label="Sayfa okunuyor" />}
              {active && run.phase === 'closed' && run.finished && <Outcome scenario={scenario} />}
            </>
          )}
        </div>
      </ScrollArea>
    </Window>
  )
}
