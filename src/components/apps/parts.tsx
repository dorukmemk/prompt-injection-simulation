import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Eye, EyeOff, Play, ShieldCheck, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Scenario, VariantId } from '@/lib/types'
import { CONTROL_MAP } from '@/lib/controls'
import { tp } from '@/lib/copy'
import { docHiddenText } from '@/lib/doc'
import { setDiveOrigin } from '@/lib/dive'
import { useApp, useProfile } from '@/store/useApp'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Disclosure } from './Disclosure'
import { ReplyText } from './ReplyText'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/* --------------------------- pencere araç çubuğu ---------------------------- */

export function RunToolbar({
  scenario,
  variant,
  onVariant,
  showHidden,
  onToggleHidden,
  label = 'Çalıştır',
}: {
  scenario: Scenario
  variant: VariantId
  onVariant: (v: VariantId) => void
  showHidden?: boolean
  onToggleHidden?: () => void
  label?: string
}) {
  const startRun = useApp((s) => s.startRun)
  const run = useApp((s) => s.run)
  const busy = !!run && run.scenarioId === scenario.id && run.phase !== 'closed'

  return (
    <>
      {onToggleHidden && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleHidden}
              aria-pressed={showHidden}
              aria-label="Gizli katman"
              className={cn(showHidden && 'text-[#ff453a]')}
            >
              {showHidden ? <Eye /> : <EyeOff />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Gizli katman</TooltipContent>
        </Tooltip>
      )}

      <ToggleGroup
        type="single"
        size="sm"
        value={variant}
        onValueChange={(v) => v && onVariant(v as VariantId)}
        variant="outline"
      >
        <ToggleGroupItem value="vulnerable" aria-label="Korumasız">
          <ShieldOff className="text-[#ff453a]" />
        </ToggleGroupItem>
        <ToggleGroupItem value="protected" aria-label="Korumalı">
          <ShieldCheck className="text-[#32d74b]" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Button size="sm" disabled={busy} onClick={() => startRun(scenario.id, variant, 'cinematic')}>
        <Play /> {label}
      </Button>
    </>
  )
}

/* ------------------------------ gizli katman -------------------------------- */

export function HiddenLayer({ scenario }: { scenario: Scenario }) {
  const profile = useProfile()
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="rounded-lg border border-[#ff453a]/35 bg-[#ff453a]/8 p-3">
        <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-[#ff9aa2]">
          {docHiddenText(scenario.payload.doc)}
        </pre>
        <p className="text-muted-foreground mt-2 text-[11.5px] leading-relaxed">
          {tp(scenario.payload.hiddenHow, profile)}
        </p>
      </div>
    </motion.div>
  )
}

/* ------------------------------ düşünme göstergesi -------------------------- */

export function Thinking({ label = 'Düşünüyor' }: { label?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setDiveOrigin({ x: r.x, y: r.y, w: r.width, h: r.height })
  }, [])
  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <span ref={ref} className="relative grid size-8 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(88,86,214,0.95), rgba(48,209,200,0.4) 55%, transparent 72%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative size-1.5 rounded-full bg-white" />
      </span>
      <span className="text-[13px]">{label}…</span>
    </div>
  )
}

/* --------------------------------- sonuç ------------------------------------ */

export function Outcome({ scenario }: { scenario: Scenario }) {
  const profile = useProfile()
  const run = useApp((s) => s.run)
  const switchVariant = useApp((s) => s.switchVariant)
  const setSimPhase = useApp((s) => s.setSimPhase)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  if (!run) return null
  const v = scenario.variants[run.variantId]
  const other: VariantId = run.variantId === 'vulnerable' ? 'protected' : 'vulnerable'
  const bad = v.outcome.verdict === 'compromised'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <div className="bg-card/60 rounded-lg border p-3">
        <ReplyText text={tp(v.reply, profile)} className="text-[13px] leading-relaxed" />
      </div>

      {profile.tech && v.toolLog && (
        <Disclosure label={`Araç çağrısı kaydı (${v.toolLog.length})`} flush>
          {v.toolLog.map((l, i) => (
            <div key={i} className="border-b px-3 py-2 font-mono text-[11px] last:border-0">
              <div className={cn('font-semibold', l.blocked ? 'text-[#32d74b]' : 'text-[#30d5c8]')}>
                {l.blocked ? '⛔' : '→'} {l.tool}
              </div>
              <div className="text-muted-foreground mt-0.5 break-all">{l.args}</div>
              <div className={cn('mt-0.5', l.blocked ? 'text-[#32d74b]' : 'text-[#ffd479]')}>
                {l.result}
              </div>
            </div>
          ))}
        </Disclosure>
      )}

      <Disclosure label="Perde arkasında ne oldu?" tone={bad ? 'danger' : 'safe'}>
        <h3
          className="text-[13.5px] font-semibold"
          style={{ color: bad ? '#ff9aa2' : '#8ff0a4' }}
        >
          {tp(v.outcome.headline, profile)}
        </h3>
        <p className="text-muted-foreground mt-1.5 text-[12.5px] leading-relaxed">
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
        variant={bad ? 'default' : 'secondary'}
        className="self-start"
        onClick={() => {
          switchVariant(other)
          setSimPhase('running')
        }}
      >
        {other === 'protected' ? <ShieldCheck /> : <ShieldOff />}
        {other === 'protected' ? 'Korumalı sürümü izle' : 'Korumasız sürümü izle'}
      </Button>
    </motion.div>
  )
}

/* ------------------------- kenar çubuğu senaryo listesi --------------------- */

export function SidebarScenarios({
  list,
  value,
  onChange,
}: {
  list: Scenario[]
  value: string
  onChange: (id: string) => void
}) {
  const completed = useApp((s) => s.completed)
  if (list.length === 0) return null
  return (
    <div className="px-2 py-2">
      <div className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        Senaryolar
      </div>
      {list.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px]',
            value === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-white/8',
          )}
        >
          <span className="truncate">{s.title}</span>
          {completed.includes(`${s.id}:protected`) && (
            <span className="ml-auto text-[10px] opacity-70">✓</span>
          )}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------- etkin denetim rozeti -------------------------- */

export function ControlBadges({ variant }: { variant: Scenario['variants'][VariantId] }) {
  if (variant.controls.length === 0) {
    return (
      <Badge variant="outline" className="border-[#ff453a]/40 text-[#ff9aa2]">
        denetim yok
      </Badge>
    )
  }
  return (
    <>
      {variant.controls.map((c) => (
        <Badge key={c} variant="outline" className="border-[#32d74b]/35 text-[#8ff0a4]">
          {CONTROL_MAP[c]?.name}
        </Badge>
      ))}
    </>
  )
}
