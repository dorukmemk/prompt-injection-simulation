import { useState } from 'react'
import { Accessibility, Info, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFILES } from '@/lib/profiles'
import { SCENARIOS } from '@/lib/scenarios'
import { useApp, useProfile, type WindowState } from '@/store/useApp'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

type Pane = 'profil' | 'erisim' | 'hakkinda'

export function SettingsWindow({ win }: { win: WindowState }) {
  const [pane, setPane] = useState<Pane>('profil')
  const profile = useProfile()
  const setProfile = useApp((s) => s.setProfile)
  const reduced = useApp((s) => s.reducedMotion)
  const contrast = useApp((s) => s.highContrast)
  const toggleReduced = useApp((s) => s.toggleReducedMotion)
  const toggleContrast = useApp((s) => s.toggleHighContrast)
  const completed = useApp((s) => s.completed)
  const resetAll = useApp((s) => s.resetAll)

  const total = SCENARIOS.length * 2
  const panes: { id: Pane; name: string; icon: typeof User }[] = [
    { id: 'profil', name: 'Profil', icon: User },
    { id: 'erisim', name: 'Erişilebilirlik', icon: Accessibility },
    { id: 'hakkinda', name: 'Hakkında', icon: Info },
  ]

  return (
    <Window
      id="settings"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <div className="p-2">
          {panes.map((p) => (
            <button
              key={p.id}
              onClick={() => setPane(p.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]',
                pane === p.id ? 'bg-primary text-primary-foreground' : 'hover:bg-white/8',
              )}
            >
              <p.icon className="size-3.5" />
              {p.name}
            </button>
          ))}
        </div>
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {pane === 'profil' && (
            <>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfile(p.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border p-2.5 text-left',
                      p.id === profile.id ? 'border-primary bg-primary/12' : 'hover:bg-white/5',
                    )}
                  >
                    <span className="text-[18px]">{p.glyph}</span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold">{p.name}</span>
                      <span className="text-muted-foreground block truncate text-[11px]">
                        {p.age}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <Separator />
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
                  <span>İlerleme</span>
                  <span className="text-muted-foreground tabular-nums">
                    {completed.length} / {total}
                  </span>
                </div>
                <Progress value={(completed.length / total) * 100} />
              </div>
              <Button variant="secondary" size="sm" className="self-start" onClick={resetAll}>
                Sıfırla
              </Button>
            </>
          )}

          {pane === 'erisim' && (
            <>
              <Row
                title="Hareketi azalt"
                desc="Kamera geçişleri ve döngüsel animasyonlar kapanır."
                on={reduced}
                onToggle={toggleReduced}
              />
              <Separator />
              <Row
                title="Yüksek kontrast"
                desc="Saydam yüzeyler opaklaşır."
                on={contrast}
                onToggle={toggleContrast}
              />
            </>
          )}

          {pane === 'hakkinda' && (
            <div className="flex flex-col items-start gap-2 text-[12.5px] leading-relaxed">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-xl">
                ◉
              </div>
              <div className="font-semibold">Görünmez Katman 1.0</div>
              <p className="text-muted-foreground">
                Açık kaynaklı prompt injection eğitim platformu. MIT lisansı.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <a
                  href="https://github.com/dorukmemk/prompt-injection-simulation"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  GitHub
                </a>
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </Window>
  )
}

function Row({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string
  desc: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px]">{title}</div>
        <p className="text-muted-foreground text-[11.5px]">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={onToggle} aria-label={title} />
    </div>
  )
}
