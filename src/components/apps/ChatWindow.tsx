import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUp,
  Check,
  ChevronDown,
  FileCode2,
  FileText,
  Globe,
  Mail,
  MessageSquarePlus,
  PanelLeft,
  Paperclip,
  Search,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCENARIOS, SCENARIO_MAP } from '@/lib/scenarios'
import { tp } from '@/lib/copy'
import { hasHidden } from '@/lib/doc'
import { setDiveOrigin } from '@/lib/dive'
import { useApp, useProfile, type WindowState } from '@/store/useApp'
import type { Profile, Scenario, VariantId } from '@/lib/types'
import { Window } from '@/components/shell/Window'
import { DocumentPage } from '@/components/doc/DocumentPage'
import { ReplyText } from './ReplyText'
import { Disclosure } from './Disclosure'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const DOC_ICON = { pdf: FileText, email: Mail, web: Globe, code: FileCode2 } as const
const DOC_KIND = { pdf: 'PDF', email: 'E-posta', web: 'Web sayfası', code: 'Kod dosyası' } as const

/** Yanıtı karakter karakter açar — gerçek bir asistan gibi. */
function useTypewriter(text: string, active: boolean, ms = 900) {
  const [n, setN] = useState(active ? 0 : text.length)
  useEffect(() => {
    if (!active) {
      setN(text.length)
      return
    }
    setN(0)
    const start = performance.now()
    let raf = 0
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      setN(Math.floor(p * text.length))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [text, active, ms])
  return text.slice(0, n)
}

export function ChatWindow({ win }: { win: WindowState }) {
  const [sid, setSid] = useState(SCENARIOS[0].id)
  const [variant, setVariant] = useState<VariantId>('vulnerable')
  const [draft, setDraft] = useState(SCENARIOS[0].userPrompt)
  const [sent, setSent] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [revealDoc, setRevealDoc] = useState(false)
  const [sidebar, setSidebar] = useState(true)

  const scenario = SCENARIO_MAP[sid] as Scenario
  const profile = useProfile()
  const run = useApp((s) => s.run)
  const startRun = useApp((s) => s.startRun)
  const switchVariant = useApp((s) => s.switchVariant)
  const setSimPhase = useApp((s) => s.setSimPhase)

  const active = run?.scenarioId === sid
  const thinking = active && run.phase !== 'closed'
  const answered = active && run.phase === 'closed' && run.finished
  const shownVariant = active ? run.variantId : variant
  const reply = answered ? tp(scenario.variants[run.variantId].reply, profile) : ''
  const typed = useTypewriter(reply, answered, 1100)

  const threadRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [thinking, answered, typed.length])

  // Yeni senaryoya geçince sohbet sıfırlanır; istem yeniden yazma alanına düşer.
  useEffect(() => {
    setRevealDoc(false)
    setSent(false)
    setDraft(SCENARIO_MAP[sid].userPrompt)
  }, [sid])

  // Simülasyon kapanıp yeni bir tur başlatılabilsin diye gönderim durumu izlenir
  useEffect(() => {
    if (run?.scenarioId === sid) setSent(true)
  }, [run?.scenarioId, run?.variantId, sid])

  function send() {
    const text = draft.trim() || SCENARIO_MAP[sid].userPrompt
    setSent(true)
    setDraft('')
    startRun(sid, variant, 'cinematic', text)
  }

  const prompt = (active ? run.prompt : draft.trim()) || scenario.userPrompt
  const Doc = DOC_ICON[scenario.payload.doc.kind]
  const attachable = hasHidden(scenario.payload.doc)

  const grouped = useMemo(() => SCENARIOS, [])

  return (
    <Window id="chat" z={win.z} x={win.x} y={win.y} minimized={win.minimized}>
      <div className="flex min-h-0 flex-1 bg-[#212121]">
        {/* ---------------------------- kenar çubuğu ---------------------------- */}
        <AnimatePresence initial={false}>
          {sidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 248, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="hidden shrink-0 flex-col overflow-hidden bg-[#171717] md:flex"
            >
              <div className="flex w-[248px] flex-col gap-1 p-2.5">
                <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] hover:bg-white/8">
                  <MessageSquarePlus className="size-4" /> Yeni sohbet
                </button>
                <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] hover:bg-white/8">
                  <Search className="size-4" /> Sohbetlerde ara
                </button>
              </div>

              <div className="w-[248px] flex-1 overflow-y-auto px-2.5">
                <div className="px-2.5 pt-3 pb-1.5 text-[11.5px] font-medium text-white/45">
                  Bugün
                </div>
                {grouped.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSid(s.id)}
                    className={cn(
                      'block w-full truncate rounded-lg px-2.5 py-2 text-left text-[13.5px]',
                      sid === s.id ? 'bg-white/10' : 'hover:bg-white/6',
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              <div className="w-[248px] border-t border-white/8 p-2.5">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/8">
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[13px]"
                    style={{ background: `${profile.accent}33` }}
                  >
                    {profile.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px]">{profile.name}</span>
                    <span className="block truncate text-[11px] text-white/40">{profile.age}</span>
                  </span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ------------------------------- sohbet ------------------------------- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* üst çubuk */}
          <div className="flex h-12 shrink-0 items-center gap-1.5 px-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebar((v) => !v)}
              aria-label="Kenar çubuğu"
              className="hidden md:inline-flex"
            >
              <PanelLeft />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[15px] font-medium hover:bg-white/8">
                  Asistan
                  <span className="text-[13px] text-white/45">
                    {shownVariant === 'protected' ? 'korumalı' : 'korumasız'}
                  </span>
                  <ChevronDown className="size-4 text-white/45" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[290px]">
                <DropdownMenuLabel>Sistem sürümü</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => (active ? switchVariant('vulnerable') : setVariant('vulnerable'))}
                >
                  <ShieldOff className="text-[#ff453a]" />
                  <span className="flex-1">
                    <span className="block text-[13px]">Korumasız</span>
                    <span className="block text-[11.5px] text-white/45">
                      Hiçbir güvenlik denetimi yok
                    </span>
                  </span>
                  {shownVariant === 'vulnerable' && <Check className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (active ? switchVariant('protected') : setVariant('protected'))}
                >
                  <ShieldCheck className="text-[#32d74b]" />
                  <span className="flex-1">
                    <span className="block text-[13px]">Korumalı</span>
                    <span className="block text-[11.5px] text-white/45">
                      {scenario.variants.protected.controls.length} denetim etkin
                    </span>
                  </span>
                  {shownVariant === 'protected' && <Check className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Senaryo</DropdownMenuLabel>
                {SCENARIOS.map((s) => (
                  <DropdownMenuItem key={s.id} onClick={() => setSid(s.id)}>
                    <span className="flex-1 text-[13px]">{s.title}</span>
                    {sid === s.id && <Check className="size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex items-center gap-1.5">
              {attachable && (
                <Button
                  variant={docOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDocOpen((v) => !v)}
                >
                  <Doc /> Belgeyi aç
                </Button>
              )}
            </div>
          </div>

          {/* mesajlar */}
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-6">
              {!sent && (
                <div className="flex min-h-[46vh] flex-col items-center justify-center gap-5 text-center">
                  <h2 className="text-[26px] font-semibold tracking-tight">
                    Bugün ne yapalım?
                  </h2>
                  {attachable && (
                    <>
                      <p className="max-w-[420px] text-[13.5px] leading-relaxed text-white/50">
                        Bir belge eklendi. Göndermeden önce inceleyebilirsin — gizli katmanı da
                        açıp görebilirsin.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setDocOpen(true)}
                      >
                        <Doc /> {scenario.payload.doc.title} dosyasını incele
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* kullanıcı */}
              {sent && (
                <div className="flex flex-col items-end gap-2">
                  {attachable && (
                    <button
                      onClick={() => setDocOpen(true)}
                      className="flex max-w-[320px] items-center gap-2.5 rounded-xl border border-white/10 bg-[#303030] px-3 py-2.5 text-left hover:bg-[#3a3a3a]"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#ff5f57]/20">
                        <Doc className="size-4 text-[#ff8a84]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium">
                          {scenario.payload.doc.title}
                        </span>
                        <span className="block text-[11.5px] text-white/45">
                          {DOC_KIND[scenario.payload.doc.kind]}
                        </span>
                      </span>
                    </button>
                  )}
                  <div className="max-w-[80%] rounded-3xl bg-[#303030] px-4 py-2.5 text-[15px] leading-relaxed">
                    {prompt}
                  </div>
                </div>
              )}

              {/* asistan */}
              {(thinking || answered) && (
                <div className="flex gap-3.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/15">
                    <Sparkles className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {thinking && <ThinkingDot />}
                    {answered && (
                      <>
                        {typed.length < reply.length ? (
                          <p className="text-[15px] leading-[1.75] whitespace-pre-wrap">
                            {typed}
                            <span className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[2px] bg-white/80" />
                          </p>
                        ) : (
                          <ReplyText text={reply} className="text-[15px] leading-[1.75]" />
                        )}
                        <AnimatePresence>
                          {typed.length >= reply.length && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-5"
                            >
                              <ReplyFooter
                                scenario={scenario}
                                variantId={run?.variantId ?? 'vulnerable'}
                                profile={profile}
                                onSwitch={(v) => {
                                  switchVariant(v)
                                  setSimPhase('running')
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* yazma alanı */}
          <div className="shrink-0 px-5 pb-4">
            <div className="mx-auto w-full max-w-[720px]">
              <div className="rounded-[26px] border border-white/10 bg-[#303030] px-3 py-2.5">
                {attachable && !sent && (
                  <button
                    onClick={() => setDocOpen(true)}
                    className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-2.5 py-2 text-left hover:bg-white/12"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#ff5f57]/20">
                      <Doc className="size-3.5 text-[#ff8a84]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium">
                        {scenario.payload.doc.title}
                      </span>
                      <span className="block text-[11px] text-white/45">
                        {DOC_KIND[scenario.payload.doc.kind]} · incelemek için tıkla
                      </span>
                    </span>
                  </button>
                )}
                <div className="flex items-end gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      onClick={() => setDocOpen(true)}
                      aria-label="Ek"
                    >
                      <Paperclip />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eklenen belgeyi gör</TooltipContent>
                </Tooltip>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (!thinking) send()
                    }
                  }}
                  rows={1}
                  placeholder={scenario.userPrompt}
                  aria-label="Mesaj"
                  className="max-h-28 min-h-[26px] flex-1 resize-none bg-transparent py-1 text-[15px] leading-relaxed outline-none placeholder:text-white/35"
                />
                <Button
                  size="icon-sm"
                  className="rounded-full"
                  disabled={!!thinking}
                  onClick={send}
                  aria-label="Gönder"
                >
                  <ArrowUp />
                </Button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-white/35">
                Simülasyon belirlenimcidir; yanıt önceden yazılmıştır.
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------- belge paneli --------------------------- */}
        <AnimatePresence initial={false}>
          {docOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden shrink-0 flex-col overflow-hidden border-l border-white/10 bg-[#171717] lg:flex"
            >
              <div className="flex w-[420px] shrink-0 items-center gap-2 border-b border-white/8 px-3 py-2.5">
                <Doc className="size-4 text-white/60" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {scenario.payload.doc.title}
                </span>
                {attachable && (
                  <Button
                    variant={revealDoc ? 'destructive' : 'secondary'}
                    size="sm"
                    onClick={() => setRevealDoc((v) => !v)}
                  >
                    {revealDoc ? 'Gizle' : 'Gizli katman'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDocOpen(false)}
                  aria-label="Paneli kapat"
                >
                  <X />
                </Button>
              </div>
              <div className="w-[420px] flex-1 overflow-y-auto bg-[#0e0e0e] p-4">
                <DocumentPage doc={scenario.payload.doc} reveal={revealDoc} />
                <p className="mt-3 text-[11.5px] leading-relaxed text-white/45">
                  {tp(scenario.payload.hiddenHow, profile)}
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </Window>
  )

}

function ReplyFooter({
  scenario,
  variantId,
  profile,
  onSwitch,
}: {
  scenario: Scenario
  variantId: VariantId
  profile: Profile
  onSwitch: (v: VariantId) => void
}) {
  const v = scenario.variants[variantId]
  const bad = v.outcome.verdict === 'compromised'
  const other: VariantId = variantId === 'vulnerable' ? 'protected' : 'vulnerable'
  return (
    <div className="flex flex-col gap-3">
      {profile.tech && v.toolLog && (
        <Disclosure label={`Araç çağrısı kaydı (${v.toolLog.length})`} tone="neutral" flush>
          {v.toolLog.map((l, i) => (
            <div key={i} className="border-b border-white/8 px-3 py-2 font-mono text-[11px] last:border-0">
              <div className={l.blocked ? 'text-[#32d74b]' : 'text-[#30d5c8]'}>
                {l.blocked ? '⛔' : '→'} {l.tool}
              </div>
              <div className="mt-0.5 break-all text-white/45">{l.args}</div>
              <div className={cn('mt-0.5', l.blocked ? 'text-[#32d74b]' : 'text-[#ffd479]')}>
                {l.result}
              </div>
            </div>
          ))}
        </Disclosure>
      )}

      <Disclosure label="Perde arkasında ne oldu?" tone={bad ? 'danger' : 'safe'}>
        <h3 className="text-[14px] font-semibold" style={{ color: bad ? '#ff9aa2' : '#8ff0a4' }}>
          {tp(v.outcome.headline, profile)}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">
          {tp(v.outcome.detail, profile)}
        </p>
        <Separator className="my-2.5" />
        <ul className="flex flex-col gap-1.5">
          {v.outcome.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed">
              <span style={{ color: bad ? '#ff453a' : '#32d74b' }}>{bad ? '✕' : '✓'}</span>
              {tp(b, profile)}
            </li>
          ))}
        </ul>
      </Disclosure>

      <Button
        size="sm"
        variant="secondary"
        className="self-start rounded-full"
        onClick={() => onSwitch(other)}
      >
        {other === 'protected' ? <ShieldCheck /> : <ShieldOff />}
        {other === 'protected' ? 'Korumalı sürümü izle' : 'Korumasız sürümü izle'}
      </Button>
    </div>
  )
  }

function ThinkingDot() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setDiveOrigin({ x: r.x, y: r.y, w: r.width, h: r.height })
  }, [])
  return (
    <span className="flex items-center gap-2.5">
      <motion.span
        ref={ref}
        className="size-4 rounded-full bg-white"
        animate={{ scale: [1, 0.6, 1], opacity: [1, 0.45, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="text-[14px] text-white/50">Düşünüyor…</span>
    </span>
  )
}
