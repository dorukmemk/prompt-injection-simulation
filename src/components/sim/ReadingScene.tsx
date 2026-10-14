import { AnimatePresence, motion } from 'motion/react'
import {
  Ban, Bot, Brain, CornerDownLeft, EyeOff, FileText, Files, FolderOpen, Inbox,
  KeyRound, Lock, Monitor, ScrollText, Send, Share2, ShieldCheck, Target,
  TriangleAlert, User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TRUST_META } from '@/lib/trust'
import type { IconKey, StageModel } from './stage-model'

const ICON: Record<IconKey, LucideIcon> = {
  rules: ScrollText, person: User, inbox: Inbox, page: FileText, files: Files,
  hidden: EyeOff, ai: Bot, shield: ShieldCheck, key: KeyRound, send: Send,
  folder: FolderOpen, share: Share2, screen: Monitor, lock: Lock, target: Target,
  reply: CornerDownLeft, memory: Brain, none: Ban, warn: TriangleAlert,
}

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Okuma sahnesi.
 *
 * Asistanın bağlamı gerçekten *okuduğunu* gösterir: metin satır satır taranır,
 * okunan satırlar aydınlanır, taranan içerik parçacıklar hâlinde yapay zekâya
 * akar ve belirteç sayacı yükselir. İlerleme zaman çizelgesine bağlıdır.
 */
export function ReadingScene({
  model,
  progress,
  reduced,
}: {
  model: StageModel
  progress: number
  reduced: boolean
}) {
  const reading = model.reading
  if (!reading) return null
  const meta = TRUST_META[reading.band]
  const color = meta.color
  const Icon = ICON[reading.icon] ?? FileText

  const rows = reading.lines ?? reading.items?.map((i) => i.title) ?? []
  const total = Math.max(rows.length, 1)

  // 0.10 → 0.88 arasında satırlar sırayla okunur
  const t = Math.max(0, Math.min(1, (progress - 0.1) / 0.78))
  const cursor = t * total // kaçıncı satırdayız (ondalıklı)
  const readCount = reduced ? total : Math.min(total, Math.floor(cursor + 0.0001))
  const activeIdx = reduced ? -1 : Math.min(total - 1, Math.floor(cursor))
  // aktif satırın ne kadarı yazıldı (0..1)
  const activeFrac = reduced ? 1 : Math.min(1, cursor - Math.floor(cursor))
  const done = readCount >= total
  const tokens = Math.round(reading.tokens * (reduced ? 1 : Math.min(1, t * 1.05)))

  return (
    <div className="absolute inset-0 flex items-center gap-[clamp(14px,3vw,54px)] px-[clamp(16px,4vw,72px)]">
      {/* şerit etiketi */}
      <div className="w-[clamp(92px,12vw,190px)] shrink-0 text-right">
        <div
          className="text-[clamp(12px,1.2vw,20px)] leading-tight font-bold tracking-[0.12em] uppercase"
          style={{ color }}
        >
          {meta.label}
        </div>
        <div className="mt-1 text-[clamp(9.5px,0.8vw,13px)]" style={{ color, opacity: 0.55 }}>
          {meta.short}
        </div>
      </div>

      {/* okunan belge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.15 : 0.55, ease: EASE }}
        className="relative min-w-0 flex-1"
      >
        <div
          className="overflow-hidden rounded-xl border bg-[#0e0e15]"
          style={{ borderColor: `${color}44` }}
        >
          {/* başlık */}
          <div
            className="flex items-center gap-3 border-b px-[clamp(12px,1.4vw,20px)] py-[clamp(9px,1vw,14px)]"
            style={{ borderColor: `${color}26`, background: `${color}0d` }}
          >
            <span
              className="grid size-[clamp(28px,2.6vw,42px)] shrink-0 place-items-center rounded-lg"
              style={{ background: `${color}1f`, border: `1px solid ${color}44` }}
            >
              <Icon className="size-[52%]" style={{ color }} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[clamp(13px,1.25vw,20px)] font-semibold tracking-tight">
                {reading.title}
              </div>
              {reading.sub && (
                <div className="text-muted-foreground truncate text-[clamp(10px,0.82vw,13px)]">
                  {reading.sub}
                </div>
              )}
            </div>
            <div className="ml-auto shrink-0 text-right">
              <div
                className="font-mono text-[clamp(13px,1.3vw,22px)] leading-none font-semibold tabular-nums"
                style={{ color }}
              >
                {tokens.toLocaleString('tr-TR')}
              </div>
              <div className="text-muted-foreground mt-1 text-[clamp(9px,0.72vw,11.5px)]">
                belirteç okundu
              </div>
            </div>
          </div>

          {/* satırlar */}
          <div className="relative overflow-hidden px-[clamp(12px,1.4vw,20px)] py-[clamp(10px,1.2vw,16px)]">
            {!done && !reduced && (
              <motion.span
                className="pointer-events-none absolute inset-x-0 h-24"
                style={{
                  background: `linear-gradient(180deg, transparent, ${color}0f 55%, transparent)`,
                }}
                animate={{ top: ['-20%', '110%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {reading.lines &&
              reading.lines.map((l, i) => (
                <Line
                  key={i}
                  text={l}
                  index={i}
                  state={i < readCount ? 'read' : i === activeIdx ? 'active' : 'pending'}
                  frac={i === activeIdx ? activeFrac : 1}
                  color={color}
                  reduced={reduced}
                />
              ))}

            {reading.items &&
              reading.items.map((it, i) => (
                <ItemRow
                  key={i}
                  item={it}
                  state={i < readCount ? 'read' : i === activeIdx ? 'active' : 'pending'}
                  color={color}
                  reduced={reduced}
                />
              ))}

            {reading.items && reading.items.length > 6 && (
              <div className="text-muted-foreground mt-2 text-[clamp(9.5px,0.76vw,12px)]">
                … ve diğerleri
              </div>
            )}
          </div>

          {/* ilerleme çubuğu */}
          <div className="h-[3px] w-full bg-white/6">
            <motion.div
              className="h-full"
              style={{ background: color }}
              animate={{ width: `${Math.min(100, (readCount / total) * 100)}%` }}
              transition={{ duration: 0.35, ease: EASE }}
            />
          </div>
        </div>
      </motion.div>

      {/* akış + yapay zekâ */}
      <div className="flex shrink-0 items-center gap-[clamp(8px,1.4vw,26px)]">
        <Stream color={color} active={!done} reduced={reduced} />
        <div className="relative grid size-[clamp(72px,8.5vw,128px)] place-items-center">
          <div
            className="absolute inset-[-28%] rounded-full"
            style={{ background: `radial-gradient(circle, ${color}1c, transparent 68%)` }}
          />
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full border"
              style={{ inset: `${i * 13}%`, borderColor: `${color}${i ? '26' : '40'}` }}
              animate={reduced ? {} : { rotate: i ? -360 : 360 }}
              transition={{ duration: 24 + i * 10, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          <motion.span
            className="absolute inset-[28%] grid place-items-center rounded-2xl"
            style={{ background: `${color}1f`, border: `1.5px solid ${color}aa` }}
            animate={reduced ? {} : { opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            <Bot className="size-[58%]" style={{ color }} strokeWidth={1.7} />
          </motion.span>
          <span className="absolute -bottom-6 text-[clamp(10px,0.9vw,14px)] font-semibold">
            Yapay zekâ
          </span>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- parçalar -------------------------------- */

type RowState = 'pending' | 'active' | 'read'

function Line({
  text,
  index,
  state,
  frac,
  color,
  reduced,
}: {
  text: string
  index: number
  state: RowState
  frac: number
  color: string
  reduced: boolean
}) {
  // Aktif satır karakter karakter yazılır — gerçekten okunuyormuş gibi.
  const shown =
    state === 'read' ? text : state === 'active' ? text.slice(0, Math.ceil(text.length * frac)) : text

  return (
    <div className="relative flex items-start gap-3">
      <AnimatePresence>
        {state === 'active' && !reduced && (
          <motion.span
            layoutId="read-cursor"
            className="absolute inset-x-[-10px] inset-y-[-3px] rounded-md"
            style={{ background: `${color}14`, boxShadow: `inset 0 0 0 1px ${color}3d` }}
            transition={{ duration: 0.28, ease: EASE }}
          />
        )}
      </AnimatePresence>

      {/* satır numarası */}
      <span
        className="relative w-[2ch] shrink-0 pt-[3px] text-right font-mono text-[clamp(9px,0.78vw,12px)] tabular-nums"
        style={{ color, opacity: state === 'pending' ? 0.2 : 0.45 }}
      >
        {index + 1}
      </span>

      <motion.p
        animate={{ opacity: state === 'pending' ? 0.18 : state === 'active' ? 1 : 0.68 }}
        transition={{ duration: 0.3 }}
        className="relative min-w-0 flex-1 py-[3px] font-mono text-[clamp(11px,1.02vw,16px)] leading-relaxed"
      >
        {shown}
        {state === 'active' && !reduced && frac < 1 && (
          <motion.span
            className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[2px]"
            style={{ background: color }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </motion.p>
    </div>
  )
}

function ItemRow({
  item,
  state,
  color,
  reduced,
}: {
  item: { title: string; preview: string; flagged?: boolean }
  state: RowState
  color: string
  reduced: boolean
}) {
  const hot = item.flagged && state !== 'pending'
  return (
    <div className="relative">
      <AnimatePresence>
        {state === 'active' && !reduced && (
          <motion.span
            layoutId="read-cursor"
            className="absolute inset-x-[-8px] inset-y-[-2px] rounded-md"
            style={{ background: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}44` }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        )}
      </AnimatePresence>
      <motion.div
        animate={{ opacity: state === 'pending' ? 0.22 : 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex items-baseline gap-2.5 py-[4px]"
      >
        <span
          className="shrink-0 text-[clamp(10px,0.8vw,13px)]"
          style={{ color: hot ? '#ffd479' : color, opacity: state === 'read' ? 0.7 : 1 }}
        >
          {state === 'pending' ? '·' : '✓'}
        </span>
        <span
          className="shrink-0 text-[clamp(11.5px,1.05vw,16px)] font-medium"
          style={{ color: hot ? '#ffd479' : undefined }}
        >
          {item.title}
        </span>
        <span className="text-muted-foreground truncate text-[clamp(10px,0.85vw,13.5px)]">
          {item.preview}
        </span>
        {hot && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto shrink-0 rounded-full border border-[#ffd479]/50 bg-[#ffd479]/12 px-2 py-0.5 text-[clamp(8.5px,0.68vw,11px)] font-medium text-[#ffd479]"
          >
            bu senaryodaki içerik
          </motion.span>
        )}
      </motion.div>
    </div>
  )
}

function Stream({
  color,
  active,
  reduced,
}: {
  color: string
  active: boolean
  reduced: boolean
}) {
  return (
    <div className="relative h-px w-[clamp(26px,4vw,78px)] shrink-0">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(90deg, ${color}22, ${color}88)` }}
      />
      {active &&
        !reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full"
            style={{ background: color }}
            animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.37, ease: 'linear' }}
          />
        ))}
    </div>
  )
}
