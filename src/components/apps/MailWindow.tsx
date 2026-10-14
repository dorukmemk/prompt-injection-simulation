import { useState } from 'react'
import { Archive, Inbox, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCENARIO_MAP, scenariosForApp } from '@/lib/scenarios'
import { useApp, type WindowState } from '@/store/useApp'
import type { VariantId } from '@/lib/types'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Outcome, RunToolbar, SidebarScenarios, Thinking } from './parts'
import { DocumentPage } from '@/components/doc/DocumentPage'

const MAILBOXES = [
  { icon: Inbox, name: 'Gelen Kutusu', count: 12 },
  { icon: Send, name: 'Gönderilenler' },
  { icon: Archive, name: 'Arşiv' },
  { icon: Trash2, name: 'Çöp' },
]

const MESSAGES = [
  { id: 'm1', from: 'Perşembe Toplantısı', subj: 'Takvim daveti', body: '14:00 ürün incelemesi. Katılım zorunlu değil.', time: '11:42', unread: true },
  { id: 'm2', from: 'Muhasebe', subj: 'Gider onayı', body: '2 kalem onayınızı bekliyor.', time: '10:08', unread: true },
  { id: 'payload', from: 'Teslimat Takip', subj: 'TK-884120 · Fatura bildirimi', body: '', time: '09:14', unread: true },
  { id: 'm4', from: 'Aura Bülten', subj: 'Haftanın özeti', body: '5 başlık, 3 dakikalık okuma.', time: '08:30' },
  { id: 'm5', from: 'K. Aydın', subj: 'Başvuru', body: 'Kıdemli Backend pozisyonu için özgeçmişim ektedir.', time: 'Dün' },
]

export function MailWindow({ win }: { win: WindowState }) {
  const list = scenariosForApp('mail')
  const [sid, setSid] = useState(list[0]?.id ?? '')
  const [selected, setSelected] = useState('payload')
  const [showHidden, setShowHidden] = useState(false)
  const [variant, setVariant] = useState<VariantId>('vulnerable')
  const run = useApp((s) => s.run)

  const scenario = SCENARIO_MAP[sid]
  const active = run && run.scenarioId === sid
  const msg = MESSAGES.find((m) => m.id === selected) ?? MESSAGES[2]

  return (
    <Window
      id="mail"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full">
          <div className="px-2 py-2">
            {MAILBOXES.map((b, i) => (
              <div
                key={b.name}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px]',
                  i === 0 && 'bg-white/10',
                )}
              >
                <b.icon className="size-3.5 opacity-70" />
                <span className="truncate">{b.name}</span>
                {b.count && (
                  <span className="text-muted-foreground ml-auto text-[11px]">{b.count}</span>
                )}
              </div>
            ))}
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
            label="Özetle"
          />
        )
      }
    >
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[228px] shrink-0 border-r lg:block">
          <ScrollArea className="h-full">
            {MESSAGES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={cn(
                  'block w-full border-b px-3 py-2.5 text-left',
                  selected === m.id ? 'bg-primary/20' : 'hover:bg-white/5',
                )}
              >
                <div className="flex items-center gap-1.5">
                  {m.unread && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
                  <span className="truncate text-[12.5px] font-semibold">{m.from}</span>
                  <span className="text-muted-foreground ml-auto shrink-0 text-[10.5px]">
                    {m.time}
                  </span>
                </div>
                <div className="truncate text-[11.5px]">{m.subj}</div>
              </button>
            ))}
          </ScrollArea>
        </div>

        <ScrollArea className="min-w-0 flex-1">
          <div className="flex flex-col gap-3.5 p-4">
            {selected === 'payload' && scenario ? (
              <DocumentPage doc={scenario.payload.doc} reveal={showHidden} compact />
            ) : (
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">{msg.subj}</h2>
                <p className="text-muted-foreground font-mono text-[11px]">
                  {msg.from} · {msg.time}
                </p>
                <Separator className="my-3" />
                <p className="text-[13px] leading-relaxed">{msg.body}</p>
              </div>
            )}

            {scenario && (
              <>
                <Separator />
                <div className="bg-card/50 rounded-lg border p-3 text-[12.5px]">
                  {scenario.userPrompt}
                </div>
                {active && run.phase !== 'closed' && <Thinking label="Asistan düşünüyor" />}
                {active && run.phase === 'closed' && run.finished && (
                  <Outcome scenario={scenario} />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </Window>
  )
}
