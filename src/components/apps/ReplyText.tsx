import { Fragment, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

const IMG = /!\[[^\]]*\]\(([^)]+)\)/g

/**
 * Asistan yanıtını çizer.
 *
 * Yanıtın içine gömülmüş markdown görseli gerçekten sayfaya konur — ama
 * 1×1 piksel olduğu için görünmez. Birkaç saniye sonra üzerine kırmızı bir
 * halka çizilir ve getirilen adres gösterilir: görünmeyen şey görünür olur.
 */
export function ReplyText({ text, className }: { text: string; className?: string }) {
  const parts: (string | { url: string })[] = []
  let last = 0
  IMG.lastIndex = 0
  for (let m = IMG.exec(text); m; m = IMG.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push({ url: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))

  return (
    <div className={cn('whitespace-pre-wrap', className)}>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <TrackingPixel key={i} url={p.url} />
        ),
      )}
    </div>
  )
}

/** Gerçekten yüklenen 1×1 şeffaf GIF — yanıta eklenen görselin ta kendisi. */
const PIXEL_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

function TrackingPixel({ url }: { url: string }) {
  const [expose, setExpose] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setExpose(true), 1400)
    return () => window.clearTimeout(id)
  }, [])

  let host = url
  let query: [string, string][] = []
  try {
    const u = new URL(url)
    host = u.host + u.pathname
    query = [...u.searchParams.entries()]
  } catch {
    /* kurgusal adres ayrıştırılamazsa ham hâliyle gösterilir */
  }

  return (
    <span className="relative inline-block align-middle">
      {/* Yanıta eklenen görsel gerçekten sayfaya konur: 1×1 ve şeffaf olduğu
          için göz onu seçemez. Aşağıda büyütülmüş hâli gösterilir. */}
      <img
        src={PIXEL_SRC}
        alt=""
        width={1}
        height={1}
        className="inline-block align-middle"
      />
      <AnimatePresence>
        {expose && (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2"
            >
              <motion.span
                className="block size-5 -translate-x-1/2 rounded-full border-2 border-[#ff453a]"
                animate={{ scale: [1, 1.35, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-3 block rounded-lg border border-[#ff453a]/45 bg-[#ff453a]/8 p-3"
            >
              <span className="mb-2.5 flex items-center gap-3">
                <span className="relative shrink-0">
                  <span
                    className="block size-12 rounded border border-white/20"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg,#2a2a2e 25%,transparent 25%,transparent 75%,#2a2a2e 75%),linear-gradient(45deg,#2a2a2e 25%,#1c1c1f 25%,#1c1c1f 75%,#2a2a2e 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 5px 5px',
                    }}
                  >
                    <img
                      src={PIXEL_SRC}
                      alt="Yanıta eklenen görsel, 48 kat büyütülmüş"
                      className="size-full"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </span>
                  <span className="absolute -right-1 -bottom-1 rounded bg-[#ff453a] px-1 text-[8px] font-bold text-white">
                    48×
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-semibold tracking-wider text-[#ff9aa2] uppercase">
                    Yanıta eklenen görsel · 1×1 piksel, şeffaf
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-white/55">
                    Görsel gerçekten yüklendi; şeffaf ve tek piksel olduğu için
                    ekranda seçilemiyor. Tıklama gerekmedi.
                  </span>
                </span>
              </span>
              <span className="block font-mono text-[11px] break-all text-white/70">
                GET {host}
              </span>
              {query.length > 0 && (
                <span className="mt-1.5 block">
                  {query.map(([k, v]) => (
                    <span key={k} className="block font-mono text-[11px] text-[#ff9aa2]">
                      {k} = {v}
                    </span>
                  ))}
                </span>
              )}
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </span>
  )
}
