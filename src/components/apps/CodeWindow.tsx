import { useState } from 'react'
import { ChevronDown, FileCode2, FileJson, FileText, FolderOpen, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCENARIO_MAP, scenariosForApp } from '@/lib/scenarios'
import { useApp, type WindowState } from '@/store/useApp'
import type { VariantId } from '@/lib/types'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Outcome, RunToolbar, SidebarScenarios, Thinking } from './parts'
import { DocumentPage } from '@/components/doc/DocumentPage'

/** Çalışma alanı ağacı — hangi dosyanın açık olduğu senaryoya göre vurgulanır. */
const TREE = [
  { name: 'kaynak', dir: true, depth: 0 },
  { name: 'uygulama.ts', depth: 1, icon: FileCode2 },
  { name: 'sunucu.ts', depth: 1, icon: FileCode2 },
  { name: 'dugumler', dir: true, depth: 0 },
  { name: 'gunluk-arac', dir: true, depth: 1 },
  { name: 'README.md', depth: 2, icon: FileText, active: true },
  { name: 'paket.json', depth: 2, icon: FileJson },
  { name: 'gunluk.js', depth: 2, icon: FileCode2 },
  { name: '.duzenleyici', dir: true, depth: 0, warn: true },
  { name: 'ayarlar.json', depth: 1, icon: FileJson, warn: true },
]

export function CodeWindow({ win }: { win: WindowState }) {
  const list = scenariosForApp('code')
  const [sid, setSid] = useState(list[0]?.id ?? '')
  const [showHidden, setShowHidden] = useState(false)
  const [variant, setVariant] = useState<VariantId>('vulnerable')
  const run = useApp((s) => s.run)
  const scenario = SCENARIO_MAP[sid]
  const active = run && run.scenarioId === sid

  return (
    <Window
      id="code"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full">
          <div className="px-2 py-2">
            <div className="text-muted-foreground flex items-center gap-1.5 px-1.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
              <ChevronDown className="size-3" /> Çalışma alanı
            </div>
            {TREE.map((n) => (
              <div
                key={n.name + n.depth}
                style={{ paddingLeft: 8 + n.depth * 12 }}
                className={cn(
                  'flex items-center gap-1.5 rounded py-[3px] pr-2 font-mono text-[11.5px]',
                  n.active
                    ? 'bg-[#ffd479]/12 text-[#ffd479]'
                    : n.warn
                      ? 'text-[#ff9aa2]'
                      : 'text-muted-foreground',
                )}
              >
                {n.dir ? (
                  <FolderOpen className="size-3 shrink-0" />
                ) : n.icon ? (
                  <n.icon className="size-3 shrink-0" />
                ) : null}
                <span className="truncate">{n.name}</span>
              </div>
            ))}
            <p className="text-muted-foreground mt-2 px-1.5 text-[10.5px] leading-snug">
              Kırmızı dosyalar ajanın yazma yetkisi içinde.
            </p>
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
            label="İncele"
          />
        )
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3.5 p-4">
          {scenario && (
            <>
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight">
                  {scenario.payload.sourceLabel}
                </h2>
                <p className="text-muted-foreground font-mono text-[11px]">
                  {scenario.payload.sourceMeta}
                </p>
              </div>
              <Separator />

              <DocumentPage doc={scenario.payload.doc} reveal={showHidden} compact />

              <Separator />

              {/* uçbirim: geliştiricinin asistana verdiği iş */}
              <div className="overflow-hidden rounded-lg border bg-[#0b0b12]">
                <div className="text-muted-foreground flex items-center gap-1.5 border-b border-white/8 px-3 py-1.5 font-mono text-[10.5px]">
                  <Terminal className="size-3" /> uçbirim — asistan
                </div>
                <div className="p-3 font-mono text-[11.5px] leading-relaxed">
                  <p className="text-[#7ee787]">
                    <span className="text-muted-foreground">$ </span>
                    asistan incele dugumler/gunluk-arac
                  </p>
                  <p className="text-muted-foreground mt-1.5 whitespace-pre-wrap">
                    {scenario.userPrompt}
                  </p>
                </div>
              </div>

              {active && run.phase !== 'closed' && <Thinking label="Asistan inceliyor" />}
              {active && run.phase === 'closed' && run.finished && <Outcome scenario={scenario} />}
            </>
          )}
        </div>
      </ScrollArea>
    </Window>
  )
}
