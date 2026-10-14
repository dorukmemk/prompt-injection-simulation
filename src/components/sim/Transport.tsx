import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUp, Pause, Play, Settings2, SkipBack, SkipForward } from 'lucide-react'
import type { Beat, VariantId } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { SimMode } from '@/store/useApp'

/**
 * Alt kumanda: olabildiğince sessiz.
 * Ekranın en altında ince bir ilerleme rayı, üstünde küçük bir kabuk.
 * Üzerine gelinmediğinde geri plana çekilir — sahne öne çıksın diye.
 */
export function Transport({
  beats,
  index,
  progress,
  playing,
  speed,
  mode,
  variant,
  canPlay,
  onSeek,
  onStep,
  onPlay,
  onSpeed,
  onMode,
  onVariant,
  onFinish,
}: {
  beats: Beat[]
  index: number
  progress: number
  playing: boolean
  speed: number
  mode: SimMode
  variant: VariantId
  canPlay: boolean
  onSeek: (i: number) => void
  onStep: (d: number) => void
  onPlay: () => void
  onSpeed: (v: number) => void
  onMode: (m: SimMode) => void
  onVariant: (v: VariantId) => void
  onFinish: () => void
}) {
  const [hover, setHover] = useState(false)
  const total = beats.reduce((s, b) => s + b.dur, 0)
  const elapsed =
    beats.slice(0, index).reduce((s, b) => s + b.dur, 0) + (beats[index]?.dur ?? 0) * progress

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        animate={{ opacity: hover ? 1 : 0.45 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-auto mb-2.5 flex items-center gap-0.5 rounded-full border border-white/10 bg-black/55 px-1.5 py-1 backdrop-blur-xl"
      >
        <Button variant="ghost" size="icon-sm" onClick={() => onStep(-1)} aria-label="Önceki sahne">
          <SkipBack />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onPlay}
          disabled={!canPlay}
          aria-label={playing ? 'Duraklat' : 'Oynat'}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onStep(1)} aria-label="Sonraki sahne">
          <SkipForward />
        </Button>

        <span className="text-muted-foreground px-2 text-[11.5px] tabular-nums">
          {index + 1}/{beats.length}
          <span className="mx-1.5 opacity-40">·</span>
          {fmt(elapsed)}
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Oynatma ayarları">
              <Settings2 />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-[270px]">
            <div className="flex flex-col gap-3">
              <Field label="Hız">
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={String(speed)}
                  onValueChange={(v) => v && onSpeed(Number(v))}
                >
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <ToggleGroupItem key={s} value={String(s)} className="px-2 text-[11px]">
                      {s}×
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>
              <Field label="Mod">
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={mode}
                  onValueChange={(v) => v && onMode(v as SimMode)}
                >
                  <ToggleGroupItem value="cinematic" className="px-2.5 text-[11.5px]">
                    Sinematik
                  </ToggleGroupItem>
                  <ToggleGroupItem value="interactive" className="px-2.5 text-[11.5px]">
                    Etkileşimli
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
              <Separator />
              <Field label="Sistem">
                <ToggleGroup
                  type="single"
                  size="sm"
                  variant="outline"
                  value={variant}
                  onValueChange={(v) => v && onVariant(v as VariantId)}
                >
                  <ToggleGroupItem value="vulnerable" className="px-2.5 text-[11.5px]">
                    Korumasız
                  </ToggleGroupItem>
                  <ToggleGroupItem value="protected" className="px-2.5 text-[11.5px]">
                    Korumalı
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 !h-4" />

        <Button variant="ghost" size="sm" onClick={onFinish} className="gap-1.5 px-2.5">
          <ArrowUp className="size-3.5" /> Sonuç
        </Button>
      </motion.div>

      {/* ilerleme rayı */}
      <motion.div
        animate={{ height: hover ? 8 : 3 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto flex w-full items-stretch gap-px"
      >
        {beats.map((b, i) => {
          const done = i < index
          const live = i === index
          const c =
            b.verdict === 'blocked' ? '#32d74b' : b.verdict === 'attack' ? '#ff453a' : '#8e8e93'
          return (
            <Tooltip key={b.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSeek(i)}
                  aria-label={`Sahne ${i + 1}: ${b.chapter}`}
                  aria-current={live}
                  style={{ width: `${(b.dur / total) * 100}%` }}
                  className="relative overflow-hidden bg-white/10 transition-colors hover:bg-white/25"
                >
                  <span
                    className="absolute inset-0"
                    style={{ background: c, opacity: done ? 0.75 : 0 }}
                  />
                  {live && (
                    <motion.span
                      className="absolute inset-y-0 left-0 w-full origin-left"
                      style={{ background: c, opacity: 0.9 }}
                      animate={{ scaleX: progress }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={10}>
                {i + 1}. {b.chapter}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn('text-muted-foreground text-[12px]')}>{label}</span>
      {children}
    </div>
  )
}

function fmt(ms: number) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
