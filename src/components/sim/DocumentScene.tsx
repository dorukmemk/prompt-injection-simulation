import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Doc } from '@/lib/types'
import { DocumentPage, type HiddenRect } from '@/components/doc/DocumentPage'

const PAGE_W = 620

/** Yumuşak geçiş eğrisi */
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
function seg(p: number, a: number, b: number) {
  return Math.max(0, Math.min(1, (p - a) / (b - a)))
}

/**
 * Belge sahnesi — montaj masası.
 *
 * Sahne ilerledikçe kamera gerçek bir belgeye yaklaşır, gizli talimatın
 * bulunduğu bölgeyi çerçeveye alır, çevresini karartır ve o bölgeyi kırmızıya
 * boyayarak görünmez katmanı açığa çıkarır. İlerleme zaman çizelgesine bağlıdır:
 * sahneyi geri sarınca kamera da geri gider.
 */
export function DocumentScene({
  doc,
  progress,
  reduced,
}: {
  doc: Doc
  progress: number
  reduced: boolean
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState({ w: 1000, h: 560 })
  const [page, setPage] = useState({ w: PAGE_W, h: 700 })
  const [rect, setRect] = useState<HiddenRect | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const f = frameRef.current?.getBoundingClientRect()
      if (f) setFrame({ w: f.width, h: f.height })
      const p = pageRef.current?.getBoundingClientRect()
      // ölçüm ölçeklenmiş hâlde geldiği için doğal boyuta çevrilir
      if (p && pageRef.current) setPage({ w: PAGE_W, h: pageRef.current.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (frameRef.current) ro.observe(frameRef.current)
    if (pageRef.current) ro.observe(pageRef.current)
    return () => ro.disconnect()
  }, [doc])

  // ---- montaj zaman çizelgesi ----
  const tPush = ease(seg(progress, 0.2, 0.58)) // yaklaşma
  const framed = progress >= 0.3 // çerçeve ve karartma
  const reveal = progress >= 0.56 // kırmızıya boyama
  const scan = progress >= 0.3 && progress < 0.62

  const fit = Math.min((frame.w * 0.8) / page.w, (frame.h * 0.95) / page.h, 1.3)
  const zoom = Math.min(fit * 2.35, 2.4)
  const s = reduced ? fit : fit + (zoom - fit) * tPush

  const target = rect
    ? { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }
    : { x: page.w / 2, y: page.h / 2 }
  const home = { x: page.w / 2, y: page.h / 2 }
  const cx = home.x + (target.x - home.x) * (reduced ? 0 : tPush)
  const cy = home.y + (target.y - home.y) * (reduced ? 0 : tPush)

  const tx = frame.w / 2 - cx * s
  const ty = frame.h / 2 - cy * s

  return (
    <div ref={frameRef} className="relative size-full overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: PAGE_W }}
        animate={{ x: tx, y: ty, scale: s }}
        transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 0.6 }}
      >
        <div ref={pageRef}>
          <DocumentPage doc={doc} reveal={reveal} onHiddenRect={setRect} />
        </div>

        {/* çerçeve + karartma — belge ile birlikte ölçeklenir */}
        <AnimatePresence>
          {framed && rect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute"
              style={{
                left: rect.x - 10 / s,
                top: rect.y - 10 / s,
                width: rect.w + 20 / s,
                height: rect.h + 20 / s,
              }}
            >
              {/* dışarısını karart */}
              <div
                className="absolute inset-0"
                style={{ boxShadow: `0 0 0 ${4000 / s}px rgba(5,5,10,0.72)` }}
              />
              {/* köşe parantezleri */}
              {[
                'left-0 top-0 border-l-2 border-t-2',
                'right-0 top-0 border-r-2 border-t-2',
                'left-0 bottom-0 border-l-2 border-b-2',
                'right-0 bottom-0 border-r-2 border-b-2',
              ].map((c) => (
                <span
                  key={c}
                  className={`absolute border-[#ff3b30] ${c}`}
                  style={{
                    width: 18 / s,
                    height: 18 / s,
                    borderWidth: 2 / s,
                  }}
                />
              ))}
              {/* tarama çizgisi */}
              {scan && !reduced && (
                <motion.span
                  className="absolute inset-x-0 bg-[#ff3b30]"
                  style={{ height: 2 / s, boxShadow: `0 0 ${14 / s}px ${3 / s}px #ff3b30` }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {/* etiket */}
              <span
                className="absolute whitespace-nowrap rounded-sm bg-[#ff3b30] font-semibold tracking-wider text-white uppercase"
                style={{
                  top: -24 / s,
                  left: 0,
                  fontSize: 11 / s,
                  padding: `${3 / s}px ${7 / s}px`,
                }}
              >
                Gizli katman
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* montaj kılavuzları — ekran uzayında */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {framed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-x-0 top-1/2 h-px bg-white/8" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/8" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
