import { useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  BookOpen,
  Check as CheckIcon,
  CircleAlert,
  Clock,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Play,
  PlayCircle,
  Target,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEVEL_COLOR, LEVEL_ORDER, MODULES, type Check, type Level, type Module } from '@/lib/curriculum'
import { MEDIA, type MediaItem } from '@/lib/media'
import { SCENARIO_MAP } from '@/lib/scenarios'
import { refsOf } from '@/lib/references'
import { useApp, type WindowState } from '@/store/useApp'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

const KIND_ICON = { izle: PlayCircle, pratik: FlaskConical, oku: BookOpen, araç: Wrench } as const
const KIND_LABEL = { izle: 'İzle', pratik: 'Pratik', oku: 'Oku', araç: 'Araç' } as const

export function AcademyWindow({ win }: { win: WindowState }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<'yol' | 'kaynak'>('yol')
  const read = useApp((s) => s.readModules)
  const markRead = useApp((s) => s.markModuleRead)
  const launch = useApp((s) => s.launchScenario)

  const current = openId ? MODULES.find((m) => m.id === openId) : null
  const pct = Math.round((read.length / MODULES.length) * 100)

  return (
    <Window
      id="academy"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full">
          <div className="p-2.5">
            <div className="mb-2 px-1">
              <div className="text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                İlerleme
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={pct} className="h-1.5" />
                <span className="text-[11px] tabular-nums text-white/55">
                  {read.length}/{MODULES.length}
                </span>
              </div>
            </div>
            <Separator className="my-2" />
            <button
              onClick={() => {
                setTab('yol')
                setOpenId(null)
              }}
              className={cn(
                'mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]',
                tab === 'yol' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/8',
              )}
            >
              <GraduationCap className="size-3.5" /> Öğrenme yolu
            </button>
            <button
              onClick={() => {
                setTab('kaynak')
                setOpenId(null)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]',
                tab === 'kaynak' ? 'bg-primary text-primary-foreground' : 'hover:bg-white/8',
              )}
            >
              <PlayCircle className="size-3.5" /> İzle & pratik
            </button>

            {tab === 'yol' && (
              <>
                <Separator className="my-2" />
                {LEVEL_ORDER.map((lvl) => {
                  const items = MODULES.filter((m) => m.level === lvl)
                  if (!items.length) return null
                  return (
                    <div key={lvl} className="mb-2">
                      <div
                        className="px-2 pb-1 text-[10.5px] font-semibold tracking-wide uppercase"
                        style={{ color: LEVEL_COLOR[lvl] }}
                      >
                        {lvl}
                      </div>
                      {items.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setTab('yol')
                            setOpenId(m.id)
                          }}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-[12px] leading-snug',
                            openId === m.id ? 'bg-white/12' : 'hover:bg-white/6',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold',
                              read.includes(m.id)
                                ? 'bg-[#32d74b] text-black'
                                : 'border border-white/25 text-white/45',
                            )}
                          >
                            {read.includes(m.id) ? '✓' : MODULES.indexOf(m) + 1}
                          </span>
                          <span className="min-w-0">{m.title}</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </ScrollArea>
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        {current ? (
          <ModuleView
            module={current}
            isRead={read.includes(current.id)}
            onBack={() => setOpenId(null)}
            onRead={() => markRead(current.id)}
            onScenario={(id) => launch(id, 'vulnerable')}
          />
        ) : tab === 'yol' ? (
          <PathView onOpen={setOpenId} read={read} />
        ) : (
          <MediaView />
        )}
      </ScrollArea>
    </Window>
  )
}

/* --------------------------------- yol ------------------------------------- */

function PathView({
  onOpen,
  read,
}: {
  onOpen: (id: string) => void
  read: string[]
}) {
  return (
    <div className="mx-auto max-w-[760px] p-6">
      <h1 className="text-[26px] font-semibold tracking-tight">Prompt injection — sıfırdan ileri</h1>
      <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
        Sekiz modül, yaklaşık 70 dakika. Her modül bağımsız okunabilir; sıra bir ilerleme
        kurar. Modüllerin sonunda ilgili simülasyonu açıp aynı olayı canlı izleyebilirsin.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        {MODULES.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onOpen(m.id)}
            className="group bg-card/40 hover:bg-card/80 rounded-xl border p-4 text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                  read.includes(m.id)
                    ? 'bg-[#32d74b] text-black'
                    : 'border border-white/20 text-white/50',
                )}
              >
                {read.includes(m.id) ? '✓' : i + 1}
              </span>
              <Badge
                variant="outline"
                style={{ color: LEVEL_COLOR[m.level], borderColor: `${LEVEL_COLOR[m.level]}55` }}
              >
                {m.level}
              </Badge>
              <span className="text-muted-foreground ml-auto flex items-center gap-1 text-[11.5px]">
                <Clock className="size-3" /> {m.minutes} dk
              </span>
            </div>
            <h2 className="mt-2 text-[15.5px] font-semibold tracking-tight">{m.title}</h2>
            <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">{m.summary}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- modül ------------------------------------ */

function ModuleView({
  module: m,
  isRead,
  onBack,
  onRead,
  onScenario,
}: {
  module: Module
  isRead: boolean
  onBack: () => void
  onRead: () => void
  onScenario: (id: string) => void
}) {
  const refs = refsOf(m.refs)
  const scenario = m.scenario ? SCENARIO_MAP[m.scenario] : null

  return (
    <div className="mx-auto max-w-[720px] p-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-4">
        <ArrowLeft /> Öğrenme yolu
      </Button>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          style={{ color: LEVEL_COLOR[m.level], borderColor: `${LEVEL_COLOR[m.level]}55` }}
        >
          {m.level}
        </Badge>
        <span className="text-muted-foreground flex items-center gap-1 text-[11.5px]">
          <Clock className="size-3" /> {m.minutes} dk
        </span>
      </div>

      <h1 className="mt-2.5 text-[27px] leading-tight font-semibold tracking-tight">{m.title}</h1>
      <p className="text-muted-foreground mt-2.5 text-[14.5px] leading-relaxed">{m.summary}</p>

      <div className="mt-5 rounded-xl border bg-card/40 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-white/50 uppercase">
          <Target className="size-3.5" /> Bu modülü bitirince
        </h3>
        <ul className="flex flex-col gap-1.5">
          {m.goals.map((g) => (
            <li key={g} className="flex gap-2 text-[13.5px] leading-relaxed text-foreground/75">
              <span className="text-white/30">→</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-6" />

      {m.sections.map((s, i) => (
        <section key={i} className="mb-7">
          <h2 className="mb-2.5 text-[17px] font-semibold tracking-tight">{s.h}</h2>
          {s.p.map((p, j) => (
            <p key={j} className="mb-3 text-[14.5px] leading-[1.75] text-foreground/80">
              <Rich text={p} />
            </p>
          ))}
          {s.code && (
            <pre className="mt-3 overflow-x-auto rounded-lg border bg-black/40 p-3.5 font-mono text-[12px] leading-relaxed text-white/70">
              {s.code}
            </pre>
          )}
          {s.example && (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#6ea8ff]/30 bg-[#6ea8ff]/6">
              <div className="border-b border-[#6ea8ff]/20 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-[#9cc4ff] uppercase">
                Örnek · {s.example.title}
              </div>
              <div className="px-3.5 py-3">
                <p className="text-[13.5px] leading-relaxed text-foreground/75">
                  {s.example.body}
                </p>
                {s.example.code && (
                  <pre className="mt-2.5 overflow-x-auto rounded-lg bg-black/45 p-3 font-mono text-[11.5px] leading-relaxed text-white/70">
                    {s.example.code}
                  </pre>
                )}
              </div>
            </div>
          )}
          {s.note && (
            <div className="mt-3 rounded-lg border border-[#ffd479]/30 bg-[#ffd479]/8 p-3">
              <p className="text-[13px] leading-relaxed text-[#ffe3ab]">{s.note}</p>
            </div>
          )}
        </section>
      ))}

      <div className="rounded-xl border bg-card/50 p-4">
        <h3 className="mb-2.5 text-[13px] font-semibold tracking-wide uppercase text-white/50">
          Özet
        </h3>
        <ul className="flex flex-col gap-2">
          {m.takeaways.map((t) => (
            <li key={t} className="flex gap-2.5 text-[14px] leading-relaxed">
              <span className="text-[#32d74b]">✓</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {m.misconceptions && m.misconceptions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-white/50 uppercase">
            <CircleAlert className="size-3.5" /> Yaygın yanılgılar
          </h3>
          <div className="flex flex-col gap-2">
            {m.misconceptions.map((mc) => (
              <div key={mc.claim} className="overflow-hidden rounded-xl border">
                <div className="flex gap-2.5 border-b border-[#ff453a]/20 bg-[#ff453a]/6 px-3.5 py-2.5">
                  <X className="mt-0.5 size-3.5 shrink-0 text-[#ff9aa2]" />
                  <p className="text-[13.5px] leading-relaxed text-[#ffc4c0]">{mc.claim}</p>
                </div>
                <div className="flex gap-2.5 bg-[#32d74b]/5 px-3.5 py-2.5">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#8ff0a4]" />
                  <p className="text-[13.5px] leading-relaxed text-foreground/78">
                    <Rich text={mc.reality} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {m.practice && m.practice.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#30d5c8]/30 bg-[#30d5c8]/6 p-4">
          <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-[#7fe3db] uppercase">
            <Wrench className="size-3.5" /> Pratikte ne yapmalı?
          </h3>
          <ol className="flex flex-col gap-2">
            {m.practice.map((pr, i) => (
              <li key={pr} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-[#30d5c8]/20 text-[10px] font-bold text-[#7fe3db]">
                  {i + 1}
                </span>
                {pr}
              </li>
            ))}
          </ol>
        </div>
      )}

      {m.terms && m.terms.length > 0 && (
        <div className="mt-5 rounded-xl border bg-card/40 p-4">
          <h3 className="mb-2.5 text-[12px] font-semibold tracking-wide text-white/50 uppercase">
            Bu modülde geçen terimler
          </h3>
          <dl className="flex flex-col gap-2">
            {m.terms.map((t) => (
              <div key={t.t} className="flex flex-wrap gap-x-2.5 text-[13.5px] leading-relaxed">
                <dt className="font-semibold">{t.t}</dt>
                <dd className="text-muted-foreground min-w-0 flex-1">{t.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {m.check && <SelfCheck check={m.check} />}

      {refs.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          <h3 className="text-[12px] font-semibold tracking-wide uppercase text-white/40">
            Kaynaklar
          </h3>
          {refs.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground hover:text-foreground flex items-start gap-1.5 text-[12.5px]"
            >
              <ExternalLink className="mt-0.5 size-3 shrink-0" />
              <span>
                {r.org} — {r.title}
              </span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant={isRead ? 'secondary' : 'default'} onClick={onRead}>
          {isRead ? '✓ Okundu' : 'Okudum olarak işaretle'}
        </Button>
        {scenario && (
          <Button size="sm" variant="secondary" onClick={() => onScenario(scenario.id)}>
            <Play /> “{scenario.title}” simülasyonunu izle
          </Button>
        )}
      </div>
    </div>
  )
}

function SelfCheck({ check }: { check: Check }) {
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <div className="mt-5 rounded-xl border border-[#ffd479]/30 bg-[#ffd479]/6 p-4">
      <h3 className="mb-2.5 text-[12px] font-semibold tracking-wide text-[#ffd479] uppercase">
        Kendini sına
      </h3>
      <p className="text-[14.5px] leading-snug font-medium">{check.q}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {check.options.map((o, i) => {
          const on = picked === i
          const ok = i === check.correct
          return (
            <button
              key={o}
              onClick={() => picked === null && setPicked(i)}
              disabled={picked !== null && !on}
              className={cn(
                'flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-[13.5px] leading-relaxed transition-colors',
                on
                  ? ok
                    ? 'border-[#32d74b]/60 bg-[#32d74b]/12 text-[#bdf5db]'
                    : 'border-[#ff453a]/55 bg-[#ff453a]/12 text-[#ffb3ae]'
                  : picked !== null
                    ? ok
                      ? 'border-[#32d74b]/40 text-[#8ff0a4]'
                      : 'border-transparent text-muted-foreground/45'
                    : 'hover:bg-white/6',
              )}
            >
              <span className="mt-0.5 shrink-0">
                {picked !== null && ok ? (
                  <CheckIcon className="size-3.5" />
                ) : on ? (
                  <X className="size-3.5" />
                ) : (
                  <span className="block size-3.5 rounded-full border border-current opacity-40" />
                )}
              </span>
              {o}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg bg-black/30 p-3 text-[13px] leading-relaxed text-foreground/75"
        >
          {check.why}
        </motion.p>
      )}
    </div>
  )
}

/** Tıklanana kadar YouTube'a istek atmaz. */
function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false)
  if (on) {
    return (
      <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    )
  }
  return (
    <button
      onClick={() => setOn(true)}
      className="group/yt relative mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-[#1a1a22] to-[#0d0d12]"
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#ff0000] transition-transform group-hover/yt:scale-110">
        <Play className="size-6 translate-x-0.5 fill-white text-white" />
      </span>
      <span className="text-muted-foreground absolute bottom-2.5 text-[11.5px]">
        YouTube’da oynat · tıklayana kadar istek gönderilmez
      </span>
    </button>
  )
}

/** **kalın** işaretlemesini basitçe çözer. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-foreground">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

/* ------------------------------- izle & pratik ----------------------------- */

function MediaView() {
  const groups: MediaItem['kind'][] = ['pratik', 'izle', 'oku', 'araç']
  return (
    <div className="mx-auto max-w-[760px] p-6">
      <h1 className="text-[26px] font-semibold tracking-tight">İzle & pratik</h1>
      <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
        Dışarıdaki en iyi kaynaklar. Her bağlantı yayımlanmadan önce açılarak doğrulandı;
        uydurma bağlantı yoktur.
      </p>

      {groups.map((g) => {
        const items = MEDIA.filter((m) => m.kind === g)
        if (!items.length) return null
        const Icon = KIND_ICON[g]
        return (
          <div key={g} className="mt-6">
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase text-white/50">
              <Icon className="size-3.5" /> {KIND_LABEL[g]}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((m) => (
                <div key={m.id} className="bg-card/40 rounded-xl border p-3.5">
                  <div className="flex items-center gap-2">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[14.5px] font-semibold tracking-tight hover:underline"
                    >
                      {m.title}
                    </a>
                    <Badge
                      variant="outline"
                      style={{
                        color: LEVEL_COLOR[m.level as Level],
                        borderColor: `${LEVEL_COLOR[m.level as Level]}55`,
                      }}
                    >
                      {m.level}
                    </Badge>
                    {m.minutes && (
                      <span className="text-muted-foreground text-[11.5px]">{m.minutes}</span>
                    )}
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Kaynağı aç"
                      className="text-muted-foreground hover:text-foreground ml-auto"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[12px]">{m.by}</div>
                  <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
                    {m.note}
                  </p>
                  {m.youtube && <YouTubeEmbed id={m.youtube} title={m.title} />}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
