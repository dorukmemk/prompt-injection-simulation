import { AnimatePresence, motion } from 'motion/react'
import {
  Ban,
  Bot,
  Brain,
  CornerDownLeft,
  EyeOff,
  FileText,
  Files,
  FolderOpen,
  Inbox,
  Info,
  KeyRound,
  Lock,
  Monitor,
  ScrollText,
  Send,
  Share2,
  ShieldCheck,
  Target,
  TriangleAlert,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Trust } from '@/lib/types'
import { TRUST_META } from '@/lib/trust'
import { DocumentScene } from './DocumentScene'
import { ReadingScene } from './ReadingScene'
import type { IconKey, Slab, StageModel } from './stage-model'

const ICON: Record<IconKey, LucideIcon> = {
  rules: ScrollText,
  person: User,
  inbox: Inbox,
  page: FileText,
  files: Files,
  hidden: EyeOff,
  ai: Bot,
  shield: ShieldCheck,
  key: KeyRound,
  send: Send,
  folder: FolderOpen,
  share: Share2,
  screen: Monitor,
  lock: Lock,
  target: Target,
  reply: CornerDownLeft,
  memory: Brain,
  none: Ban,
  warn: TriangleAlert,
}

const EASE = [0.16, 1, 0.3, 1] as const
const BANDS: Trust[] = ['system', 'user', 'untrusted']

const TONE: Record<Slab['state'], string> = {
  idle: 'rgba(255,255,255,0.35)',
  active: 'rgba(255,255,255,0.75)',
  warn: '#ffd479',
  danger: '#ff453a',
  safe: '#32d74b',
  blocked: '#32d74b',
}

export function Stage({
  model,
  simple,
  reduced,
  progress,
}: {
  model: StageModel
  simple: boolean
  reduced: boolean
  /** Aktif sahnedeki ilerleme 0..1 — belge sahnesinin kamerası buna bağlıdır */
  progress: number
}) {
  return (
    <div className="relative size-full overflow-hidden">
      <Backdrop alarm={model.alarm} reduced={reduced} />
      <AnimatePresence>
        {model.stamp && <Stamp key={model.stamp.text} stamp={model.stamp} reduced={reduced} />}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {model.mode === 'read' && model.reading ? (
          <motion.div
            key="read"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <ReadingScene model={model} progress={progress} reduced={reduced} />
          </motion.div>
        ) : model.mode === 'document' && model.doc ? (
          <motion.div
            key="document"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 px-[clamp(12px,3vw,48px)] pt-[clamp(70px,12vh,132px)] pb-2"
          >
            <DocumentScene doc={model.doc} progress={progress} reduced={reduced} />
          </motion.div>
        ) : model.mode === 'context' ? (
          <ContextScene key="context" model={model} simple={simple} reduced={reduced} />
        ) : (
          <ActionScene key="action" model={model} reduced={reduced} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* --------------------------------- zemin ----------------------------------- */

function Backdrop({ alarm, reduced }: { alarm?: boolean; reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[#05050a]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(94,92,230,0.16), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black, transparent 85%)',
        }}
      />
      <AnimatePresence>
        {alarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: reduced ? 0.5 : [0.25, 0.8, 0.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.6, repeat: reduced ? 0 : Infinity }}
            className="absolute inset-0"
            style={{ boxShadow: 'inset 0 0 220px 40px rgba(255,69,58,0.3)' }}
          />
        )}
      </AnimatePresence>
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 180px 60px rgba(0,0,0,0.75)' }}
      />
    </div>
  )
}

/* ------------------------------ bağlam sahnesi ------------------------------ */

function ContextScene({
  model,
  simple,
  reduced,
}: {
  model: StageModel
  simple: boolean
  reduced: boolean
}) {
  const breached = model.boundary === 'breached'
  const held = model.boundary === 'held'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 flex flex-col justify-center gap-0 px-[clamp(16px,5vw,80px)]"
    >
      {BANDS.map((band) => {
        const meta = TRUST_META[band]
        const lit = model.litBand === band
        const slabs = model.slabs.filter((s) => s.band === band)
        return (
          <div key={band}>
            {band === 'untrusted' && (
              <Membrane breached={breached} held={held} reduced={reduced} />
            )}
            <motion.div
              animate={{ opacity: lit || slabs.length > 0 ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className="relative flex min-h-[clamp(94px,15vh,150px)] items-center gap-[clamp(12px,3vw,40px)] py-2"
            >
              {lit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${meta.color}12, transparent 60%)`,
                  }}
                />
              )}

              <div className="relative w-[clamp(92px,13vw,210px)] shrink-0 text-right">
                <div
                  className="text-[clamp(12px,1.25vw,21px)] leading-tight font-bold tracking-[0.12em] uppercase"
                  style={{ color: meta.color, opacity: lit ? 1 : 0.45 }}
                >
                  {simple ? meta.labelSimple : meta.label}
                </div>
                <div
                  className="mt-1 text-[clamp(9.5px,0.8vw,13px)] leading-tight"
                  style={{ color: meta.color, opacity: lit ? 0.6 : 0.3 }}
                >
                  {meta.short}
                </div>
              </div>

              <div
                className="h-px flex-1 shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${meta.color}${lit ? '66' : '22'}, transparent)`,
                }}
              />

              <div className="absolute inset-y-0 left-[clamp(104px,16vw,262px)] right-0 flex items-center gap-3 pr-1">
                <AnimatePresence>
                  {slabs.map((s) => (
                    <SlabCard
                      key={s.id}
                      slab={s}
                      seal={model.seal?.on === s.id ? model.seal.label : undefined}
                      reduced={reduced}
                    />
                  ))}
                </AnimatePresence>
                {band === 'untrusted' && model.climber && model.boundary && model.boundary !== 'idle' && (
                  <Climber
                    label={model.climber.label}
                    mode={model.boundary}
                    reduced={reduced}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )
      })}

    </motion.div>
  )
}

function SlabCard({
  slab,
  seal,
  reduced,
}: {
  slab: Slab
  seal?: string
  reduced: boolean
}) {
  const color = TRUST_META[slab.trust].color
  const tone = TONE[slab.state]
  const strong = slab.state !== 'idle'

  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
      className="relative min-w-0 max-w-full"
    >
      <div
        className="relative flex items-stretch overflow-hidden rounded-xl border backdrop-blur-sm"
        style={{
          borderColor: slab.ghost
            ? 'rgba(255,255,255,0.16)'
            : strong
              ? `${tone}70`
              : 'rgba(255,255,255,0.11)',
          borderStyle: slab.ghost ? 'dashed' : 'solid',
          background: slab.ghost ? 'transparent' : '#13131b',
          opacity: slab.ghost ? 0.5 : 1,
        }}
      >
        {!slab.ghost && <div className="w-[3px] shrink-0" style={{ background: color }} />}
        <div className="flex items-center gap-[clamp(10px,1.1vw,16px)] px-[clamp(14px,1.7vw,24px)] py-[clamp(11px,1.3vw,18px)]">
          <Glyph icon={slab.icon} color={slab.ghost ? '#8e8e93' : color} />
          <div>
            <div className="text-[clamp(15px,1.55vw,25px)] leading-tight font-semibold tracking-[-0.015em]">
              {slab.title}
            </div>
            {slab.sub && (
              <div className="text-muted-foreground mt-1 text-[clamp(10.5px,0.88vw,14px)] leading-tight">
                {slab.sub}
              </div>
            )}
            {slab.tech && (
              <div className="text-muted-foreground/70 mt-1 font-mono text-[clamp(9.5px,0.76vw,12px)] leading-tight">
                {slab.tech}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {seal && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute -top-3 left-3 rounded-full border border-[#32d74b]/60 bg-[#0d1a14] px-2.5 py-0.5 text-[10.5px] font-medium text-[#8ff0a4]"
          >
            {seal}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Membrane({
  breached,
  held,
  reduced,
}: {
  breached: boolean
  held: boolean
  reduced: boolean
}) {
  const color = held ? '#32d74b' : breached ? '#ff453a' : 'rgba(255,255,255,0.3)'
  return (
    <div className="relative h-7">
      <div className="absolute inset-x-0 top-1/2 flex items-center gap-3">
        <span
          className="w-[clamp(92px,13vw,210px)] shrink-0 text-right text-[clamp(10px,0.95vw,15px)] font-bold tracking-[0.14em] uppercase"
          style={{ color, opacity: breached || held ? 1 : 0.45 }}
        >
          Güven sınırı
        </span>
        <motion.div
          className="h-px flex-1"
          style={{
            background: `repeating-linear-gradient(90deg, ${color} 0 10px, transparent 10px 20px)`,
          }}
          animate={{ opacity: breached ? [0.45, 1, 0.45] : held ? [0.6, 1, 0.6] : 0.4 }}
          transition={{ duration: 1.6, repeat: reduced ? 0 : Infinity }}
        />
      </div>

      {breached && !reduced && (
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ boxShadow: '0 0 40px 14px rgba(255,69,58,0.4)' }}
        />
      )}
      {held && !reduced && (
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{ boxShadow: '0 0 36px 12px rgba(50,215,75,0.35)' }}
        />
      )}
    </div>
  )
}

function Climber({
  label,
  mode,
  reduced,
}: {
  label: string
  mode: 'rising' | 'breached' | 'held'
  reduced: boolean
}) {
  const held = mode === 'held'
  const color = held ? '#32d74b' : '#ff453a'
  const rise = 'clamp(118px, 17vh, 182px)'

  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ left: 'clamp(180px, 30vw, 520px)', top: '50%' }}
      initial={{ y: '-50%', opacity: 0 }}
      animate={
        reduced
          ? { opacity: 1, y: held ? '-50%' : `calc(-50% - ${rise})` }
          : held
            ? {
                opacity: [0, 1, 1, 1, 0.25],
                y: ['-50%', `calc(-50% - ${rise} * 0.62)`, `calc(-50% - ${rise} * 0.62)`, '-50%', '-50%'],
              }
            : {
                opacity: [0, 1, 1, 1],
                y: ['-50%', `calc(-50% - ${rise} * 0.55)`, `calc(-50% - ${rise})`, `calc(-50% - ${rise})`],
              }
      }
      transition={{
        duration: held ? 3 : 2.6,
        times: held ? [0, 0.35, 0.5, 0.75, 1] : [0, 0.4, 0.75, 1],
        repeat: reduced ? 0 : Infinity,
        repeatDelay: 0.3,
        ease: EASE,
      }}
    >
      <div
        className="relative flex items-center gap-2 rounded-lg border px-[clamp(10px,1.2vw,18px)] py-[clamp(7px,0.9vw,12px)]"
        style={{
          borderColor: color,
          background: held ? 'rgba(13,26,20,0.95)' : 'rgba(25,10,14,0.95)',
          boxShadow: `0 0 22px -8px ${color}`,
        }}
      >
        <span
          className="size-2 rotate-45"
          style={{ background: color }}
        />
        <span
          className="text-[clamp(11.5px,1.05vw,17px)] font-semibold tracking-tight"
          style={{ color: held ? '#8ff0a4' : '#ff9aa2' }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  )
}

/* ------------------------------ eylem sahnesi ------------------------------- */

function ActionScene({ model, reduced }: { model: StageModel; reduced: boolean }) {
  const core = model.core?.state ?? 'thinking'
  const coreColor = core === 'compromised' ? '#ff453a' : core === 'safe' ? '#32d74b' : '#5e5ce6'
  const blocked = model.gate?.state === 'blocked' || model.exits?.some((e) => e.state === 'blocked')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-0 flex items-center justify-center gap-[clamp(12px,2.8vw,48px)] px-[clamp(16px,4vw,72px)]"
    >
      <Core color={coreColor} reduced={reduced} />

      {model.actions && model.actions.length > 0 && (
        <>
          <Link active tone={model.actions[0].tone} blocked={false} reduced={reduced} />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={
              blocked && !reduced
                ? { opacity: 1, y: 0, x: [0, 24, 0, 12, 0] }
                : { opacity: 1, y: 0 }
            }
            transition={
              blocked && !reduced
                ? { duration: 2.2, repeat: Infinity, repeatDelay: 0.4, ease: EASE }
                : { duration: 0.5, delay: 0.1, ease: EASE }
            }
            className="flex shrink-0 flex-col gap-2.5"
          >
            {model.actions.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-[clamp(10px,1.1vw,16px)] rounded-xl border bg-[#0d0d14]/92 px-[clamp(12px,1.4vw,20px)] py-[clamp(10px,1.1vw,15px)]"
                style={{
                  borderColor:
                    a.tone === 'danger'
                      ? 'rgba(255,69,58,0.6)'
                      : a.tone === 'safe'
                        ? 'rgba(50,215,75,0.55)'
                        : 'rgba(255,255,255,0.18)',
                }}
              >
                <Glyph
                  icon={a.icon}
                  color={a.tone === 'danger' ? '#ff453a' : a.tone === 'safe' ? '#32d74b' : '#8e8e93'}
                />
                <div>
                  <div className="text-[clamp(14px,1.35vw,23px)] leading-tight font-semibold tracking-[-0.015em]">
                    {a.label}
                  </div>
                  {a.sub && (
                    <div className="text-muted-foreground mt-1 text-[clamp(10px,0.8vw,13px)] leading-tight">
                      {a.sub}
                    </div>
                  )}
                  {a.tech && (
                    <div className="text-muted-foreground/70 mt-1 font-mono text-[clamp(9.5px,0.74vw,12px)]">
                      {a.tech}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </>
      )}

      {model.gate && model.gate.state !== 'absent' && (
        <>
          <Link active tone="neutral" blocked={false} reduced={reduced} />
          <Gate gate={model.gate} />
        </>
      )}

      {model.exits && model.exits.length > 0 && (
        <>
          <Link
            active={model.exits.some((e) => e.state === 'hit')}
            tone={model.exits.some((e) => e.state === 'hit') ? 'danger' : 'safe'}
            blocked={!!blocked}
            reduced={reduced}
          />
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="flex max-w-[clamp(150px,19vw,280px)] shrink-0 flex-col gap-2.5"
          >
            {model.exits.map((e) => (
              <div key={e.label} className="relative" style={{ opacity: e.state === 'blocked' ? 0.45 : 1 }}>
                <div
                  className="relative flex items-center gap-[clamp(10px,1.1vw,16px)] rounded-xl border px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.1vw,15px)]"
                  style={{
                    borderColor:
                      e.state === 'hit' ? 'rgba(255,69,58,0.65)' : 'rgba(255,255,255,0.18)',
                    background: e.state === 'hit' ? 'rgba(255,69,58,0.1)' : '#0d0d14e8',
                  }}
                >
                  <Glyph icon={e.icon} color={e.state === 'hit' ? '#ff453a' : '#8e8e93'} />
                  <div className="min-w-0">
                    <div className="text-[clamp(12.5px,1.2vw,20px)] leading-tight font-semibold break-words">
                      {e.label}
                    </div>
                    {e.sub && (
                      <div className="text-muted-foreground mt-1 text-[clamp(10px,0.78vw,12.5px)] leading-tight">
                        {e.sub}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function Core({ color, reduced }: { color: string; reduced: boolean }) {
  return (
    <div className="relative grid size-[clamp(110px,14vw,190px)] shrink-0 place-items-center">
      <div
        className="absolute inset-[-30%] rounded-full"
        style={{ background: `radial-gradient(circle, ${color}1c, transparent 68%)` }}
      />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border"
          style={{
            inset: `${i * 11}%`,
            borderColor: `${color}${['4d', '33', '1f'][i]}`,
            borderStyle: i === 1 ? 'dashed' : 'solid',
          }}
          animate={reduced ? {} : { rotate: i % 2 ? -360 : 360 }}
          transition={{ duration: 22 + i * 10, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <motion.span
        className="absolute inset-[30%] grid place-items-center rounded-2xl"
        style={{
          background: `${color}22`,
          border: `1.5px solid ${color}aa`,
        }}
        animate={reduced ? {} : { opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Bot className="size-[58%]" style={{ color }} strokeWidth={1.7} />
      </motion.span>
      <span className="absolute -bottom-7 text-[clamp(11px,1vw,16px)] font-semibold tracking-tight">
        Yapay zekâ
      </span>
    </div>
  )
}

function Link({
  active,
  tone,
  blocked,
  reduced,
}: {
  active: boolean
  tone: 'danger' | 'safe' | 'neutral'
  blocked: boolean
  reduced: boolean
}) {
  const color = tone === 'danger' ? '#ff453a' : tone === 'safe' ? '#32d74b' : 'rgba(255,255,255,0.4)'
  return (
    <div className="relative h-px w-[clamp(26px,4.5vw,90px)] shrink-0">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(90deg, ${color}22, ${color}${active ? 'aa' : '44'})` }}
      />
      {active && !blocked && !reduced && (
        <motion.span
          className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full"
          style={{ background: color }}
          animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {blocked && (
        <span
          className="absolute top-1/2 left-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ background: '#32d74b' }}
        />
      )}
    </div>
  )
}

function Gate({ gate }: { gate: NonNullable<StageModel['gate']> }) {
  const blocked = gate.state === 'blocked'
  const color = blocked ? '#32d74b' : 'rgba(255,255,255,0.35)'
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.7 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative flex shrink-0 flex-col items-center gap-2.5"
    >
      <div
        className="relative w-[clamp(5px,0.6vw,8px)] rounded-full"
        style={{
          height: 'clamp(90px,13vh,150px)',
          background: blocked
            ? 'linear-gradient(180deg, #32d74b, #1f8f36)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))',
          boxShadow: blocked ? '0 0 18px 1px rgba(50,215,75,0.3)' : 'none',
        }}
      />
      <div className="relative flex max-w-[clamp(110px,14vw,200px)] flex-col items-center text-center">
        <Glyph icon={gate.icon} color={blocked ? '#32d74b' : '#8e8e93'} className="mb-1.5" />
        <div
          className="text-[clamp(13px,1.25vw,20px)] leading-tight font-semibold"
          style={{ color: blocked ? '#8ff0a4' : undefined }}
        >
          {gate.label}
        </div>
        {gate.sub && (
          <div className="text-muted-foreground mt-1 text-[clamp(10px,0.8vw,13px)] leading-tight">
            {gate.sub}
          </div>
        )}
      </div>
      <span
        className="text-[clamp(10px,0.85vw,13px)] font-bold tracking-[0.14em] uppercase"
        style={{ color }}
      >
        {blocked ? 'reddedildi' : 'geçti'}
      </span>
    </motion.div>
  )
}

/* ---------------------------------- damga ---------------------------------- */

function Stamp({ stamp, reduced }: { stamp: NonNullable<StageModel['stamp']>; reduced: boolean }) {
  const tone = stamp.tone
  const color = tone === 'danger' ? '#ff453a' : tone === 'safe' ? '#32d74b' : '#8e8e93'
  const Icon = tone === 'danger' ? TriangleAlert : tone === 'safe' ? ShieldCheck : Info

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
      className="pointer-events-none absolute top-[clamp(10px,2.2vh,26px)] left-1/2 z-20 w-[min(760px,88vw)] -translate-x-1/2"
    >
      <div
        className="flex items-center gap-3 rounded-xl border px-[clamp(12px,1.5vw,20px)] py-[clamp(9px,1.1vw,14px)] backdrop-blur-xl"
        style={{
          borderColor: `${color}55`,
          background: `color-mix(in oklab, ${color} 10%, rgba(10,10,16,0.92))`,
        }}
      >
        <span
          className="grid size-[clamp(26px,2.4vw,36px)] shrink-0 place-items-center rounded-lg"
          style={{ background: `${color}22`, border: `1px solid ${color}55` }}
        >
          <Icon className="size-[55%]" style={{ color }} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <div
            className="text-[clamp(13px,1.3vw,21px)] leading-tight font-semibold tracking-[-0.01em]"
            style={{ color }}
          >
            {stamp.text}
          </div>
          {stamp.detail && (
            <div className="text-muted-foreground mt-0.5 text-[clamp(10px,0.85vw,13.5px)] leading-snug">
              {stamp.detail}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* --------------------------------- simgeler --------------------------------- */

function Glyph({
  icon,
  color,
  className,
}: {
  icon: IconKey
  color: string
  className?: string
}) {
  const Icon = ICON[icon] ?? FileText
  return (
    <span
      className={`grid size-[clamp(34px,3.2vw,52px)] shrink-0 place-items-center rounded-xl ${className ?? ''}`}
      style={{ background: `${color}1a`, border: `1px solid ${color}3d` }}
      aria-hidden
    >
      <Icon className="size-[55%]" style={{ color }} strokeWidth={1.8} />
    </span>
  )
}
