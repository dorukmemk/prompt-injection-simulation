import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useApp } from '@/store/useApp'
import { getDiveOrigin } from '@/lib/dive'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Login } from '@/components/screens/Login'
import { Desktop } from '@/components/shell/Desktop'
import { SimStage } from '@/components/sim/SimStage'

export default function App() {
  const phase = useApp((s) => s.phase)
  const reduced = useApp((s) => s.reducedMotion)
  const contrast = useApp((s) => s.highContrast)
  const run = useApp((s) => s.run)

  useEffect(() => {
    const el = document.documentElement
    el.classList.add('dark')
    if (reduced) el.setAttribute('data-motion', 'reduced')
    else el.removeAttribute('data-motion')
    if (contrast) el.setAttribute('data-contrast', 'high')
    else el.removeAttribute('data-contrast')
  }, [reduced, contrast])

  /* ---- kamera: “Düşünüyor…” göstergesine doğru yaklaşma ----
     Dalış sırasında masaüstü katmanı, göstergenin tam konumunu odak alarak
     büyür ve bulanıklaşır. Simülasyon da aynı noktadan açıldığı için geçiş
     tek bir hareket gibi okunur. */
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const diving = run?.phase === 'diving'
  const surfacing = run?.phase === 'surfacing'
  const away = diving || run?.phase === 'running'

  useEffect(() => {
    if (!diving) return
    const o = getDiveOrigin()
    setOrigin({
      x: ((o.x + o.w / 2) / window.innerWidth) * 100,
      y: ((o.y + o.h / 2) / window.innerHeight) * 100,
    })
  }, [diving])

  const motionOk = !reduced

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full w-full">
        <AnimatePresence mode="wait">
          {phase === 'intro' ? (
            <Login key="login" />
          ) : (
            <motion.div
              key="os"
              className="h-full w-full"
              style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
              animate={
                !motionOk
                  ? { scale: 1, opacity: away ? 0 : 1, filter: 'blur(0px)' }
                  : away
                    ? {
                        // Önce yavaşça yaklaşır, sonra hızlanıp çözülür.
                        scale: [1, 1.55, 3.4],
                        opacity: [1, 1, 0],
                        filter: ['blur(0px)', 'blur(2px)', 'blur(16px)'],
                      }
                    : { scale: 1, opacity: 1, filter: 'blur(0px)' }
              }
              transition={{
                duration: !motionOk ? 0.1 : surfacing ? 1.2 : 2.3,
                times: away ? [0, 0.58, 1] : undefined,
                ease: surfacing ? [0.16, 1, 0.3, 1] : [0.4, 0, 0.6, 1],
              }}
            >
              <Desktop />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {run && run.phase !== 'closed' && run.phase !== 'pending' && <SimStage key="sim" />}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
