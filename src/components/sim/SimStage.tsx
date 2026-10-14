import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Info, PanelRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDiveOrigin } from '@/lib/dive'
import {
  useApp,
  useBeat,
  useBeats,
  useProfile,
  useScenario,
  useVariant,
} from '@/store/useApp'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Stage } from './Stage'
import { buildStage } from './stage-model'
import { TitleCard } from './TitleCard'
import { Inspector } from './Inspector'
import { Transport } from './Transport'
import { DecisionCard } from './DecisionCard'

export function SimStage() {
  const run = useApp((s) => s.run)
  const scenario = useScenario()
  const variant = useVariant()
  const beats = useBeats()
  const beat = useBeat()
  const profile = useProfile()
  const reducedPref = useApp((s) => s.reducedMotion)

  const tick = useApp((s) => s.tick)
  const setSimPhase = useApp((s) => s.setSimPhase)
  const togglePlay = useApp((s) => s.togglePlay)
  const setPlaying = useApp((s) => s.setPlaying)
  const setSpeed = useApp((s) => s.setSpeed)
  const seekBeat = useApp((s) => s.seekBeat)
  const stepBeat = useApp((s) => s.stepBeat)
  const answer = useApp((s) => s.answer)
  const switchVariant = useApp((s) => s.switchVariant)
  const setMode = useApp((s) => s.setMode)
  const endRun = useApp((s) => s.endRun)

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [panels, setPanels] = useState(false)
  const [detail, setDetail] = useState(false)
  const [wideDecision, setWideDecision] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : true,
  )
  // “Düşünüyor…” göstergesi yerleştikten sonra ölç: kamera tam oraya dalsın
  const [origin, setOrigin] = useState<ReturnType<typeof getDiveOrigin> | null>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => setOrigin(getDiveOrigin()))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const h = () => setWideDecision(window.innerWidth >= 1280)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])


  const reduced =
    reducedPref ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (run?.phase !== 'diving') return
    const id = window.setTimeout(() => setSimPhase('running'), reduced ? 120 : 2300)
    return () => window.clearTimeout(id)
  }, [run?.phase, setSimPhase, reduced])

  useEffect(() => {
    if (run?.phase !== 'surfacing') return
    const id = window.setTimeout(() => endRun(), reduced ? 120 : 1150)
    return () => window.clearTimeout(id)
  }, [run?.phase, endRun, reduced])

  const rafRef = useRef(0)
  useEffect(() => {
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      tick(dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      // Açık bir menü/açılır kutu varsa kısayollar devreye girmesin:
      // Esc önce o katmanı kapatmalı, simülasyondan çıkmamalı.
      if (document.querySelector('[data-radix-popper-content-wrapper]')) return
      const k = e.key.toLowerCase()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        stepBeat(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stepBeat(-1)
      } else if (e.key === 'Escape') {
        setSimPhase('surfacing')
      } else if (k === 'v') {
        switchVariant(run?.variantId === 'vulnerable' ? 'protected' : 'vulnerable')
      } else if (k === 'i') {
        setPanels((v) => !v)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [togglePlay, stepBeat, setSimPhase, switchVariant, run?.variantId])

  if (!run || !scenario || !variant || !beat) return null
  if (run.phase === 'closed') return null
  if (!origin) return <div className="fixed inset-0 z-[90]" aria-hidden />

  const cx = origin.x + origin.w / 2
  const cy = origin.y + origin.h / 2
  const diving = run.phase === 'diving'
  const surfacing = run.phase === 'surfacing'
  const needsAnswer = run.mode === 'interactive' && !!beat.decision && !run.answers[beat.id]
  // Etkileşimli modda kullanıcı zaten kontrolü elinde tutuyor: karar kartı hemen görünür.
  // Sinematik modda anlatım yerleştikten sonra belirir.
  const showDecision = !!beat.decision && (run.mode === 'interactive' || run.progress >= 0.6)
  // Alt metin bloğu büyüdükçe sahne yukarı çekilir; üst üste binme olmaz.
  const stageBottom = 215 + (detail ? 70 : 0) + (showDecision && !wideDecision ? 250 : 0)

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Simülasyon">
      <motion.div
        // Kamera “Düşünüyor…” göstergesine doğru süzülürken iç katman yavaşça
        // çözülerek belirir. Odak noktası göstergenin tam konumudur.
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.24 }}
        animate={
          reduced
            ? { opacity: surfacing ? 0 : 1 }
            : surfacing
              ? { opacity: 0, scale: 1.1 }
              : { opacity: [0, 0, 1], scale: [1.3, 1.22, 1] }
        }
        transition={{
          duration: reduced ? 0.15 : surfacing ? 1.15 : 2.3,
          times: reduced || surfacing ? undefined : [0, 0.56, 1],
          ease: surfacing ? [0.16, 1, 0.3, 1] : [0.4, 0, 0.6, 1],
        }}
        className="absolute inset-0 overflow-hidden bg-[#050509]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(94,92,230,0.16), transparent 70%)',
          }}
        />

        {/* sahne — paneller için güvenli alan bırakır */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 pt-[52px] transition-[padding] duration-500"
            style={{ paddingBottom: stageBottom }}
          >
            <Stage
              model={buildStage(beat, scenario, {
                simple: profile.tier === 'simple',
                showTech: profile.tech,
              })}
              simple={profile.id === 'explorer'}
              reduced={!!reduced}
              progress={run.progress}
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {!diving && !surfacing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : 0.5 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* üst çubuk */}
              <header className="flex shrink-0 items-center gap-2 p-3">
                <div className="material window-shadow flex items-center gap-2 rounded-full py-1.5 pr-3 pl-3">
                  <span className="text-[13px] font-semibold tracking-tight">{scenario.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-normal',
                      run.variantId === 'protected'
                        ? 'border-[#32d74b]/50 text-[#8ff0a4]'
                        : 'border-[#ff453a]/50 text-[#ff9aa2]',
                    )}
                  >
                    {run.variantId === 'protected' ? 'korumalı' : 'korumasız'}
                  </Badge>
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" size="icon-sm" aria-label="Temsilî model">
                        <Info />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[320px] text-[12px] leading-relaxed">
                      Bu görselleştirme bir modelin gerçek, özel düşünce zincirini göstermez;
                      gözlemlenebilir davranışın ve güvenlik denetimlerinin temsilî modelidir.
                    </PopoverContent>
                  </Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => setPanels((v) => !v)}
                        aria-label="Panelleri değiştir"
                      >
                        <PanelRight />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paneller (I)</TooltipContent>
                  </Tooltip>
                  <Button variant="secondary" size="sm" onClick={() => setSimPhase('surfacing')}>
                    <ArrowUp /> Yüzeye dön
                  </Button>
                </div>
              </header>

              {/* paneller */}
              <div className="pointer-events-none flex min-h-0 flex-1 items-end gap-4 px-5 pb-[58px]">
                <div className="pointer-events-auto flex min-w-0 flex-1 flex-col items-stretch gap-3 xl:flex-row xl:items-end">
                  <div className="min-w-0 xl:max-w-[min(680px,46vw)] xl:flex-1">
                    <TitleCard
                      beat={beat}
                      profile={profile}
                      detail={detail}
                      onDetail={setDetail}
                    />
                  </div>
                  <AnimatePresence>
                    {showDecision && (
                      <div className="w-full shrink-0 xl:w-[400px]">
                        <DecisionCard
                          beat={beat}
                          profile={profile}
                          answer={run.answers[beat.id]}
                          interactive={run.mode === 'interactive'}
                          onAnswer={(id) => answer(beat.id, id)}
                          onContinue={() => {
                            setPlaying(true)
                            stepBeat(1)
                          }}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {panels && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="pointer-events-auto hidden w-[280px] shrink-0 lg:block"
                    >
                      <Inspector
                        beat={beat}
                        scenario={scenario}
                        profile={profile}
                        selectedNode={selectedNode}
                        onClose={() => setSelectedNode(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Transport
                beats={beats}
                index={run.beat}
                progress={run.progress}
                playing={run.playing}
                speed={run.speed}
                mode={run.mode}
                variant={run.variantId}
                canPlay={!needsAnswer}
                onSeek={seekBeat}
                onStep={stepBeat}
                onPlay={togglePlay}
                onSpeed={setSpeed}
                onMode={setMode}
                onVariant={(v) => switchVariant(v)}
                onFinish={() => setSimPhase('surfacing')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {diving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.3, times: [0, 0.15, 0.6, 1] }}
                className="text-muted-foreground text-[12px] tracking-[0.4em] uppercase"
              >
                iç katman
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
