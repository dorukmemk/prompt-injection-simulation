import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, CornerUpLeft, FileCode2, Forward, Lock, Paperclip, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Doc, DocBlock } from '@/lib/types'

export interface HiddenRect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Güvenilmeyen içeriği türüne göre gerçek bir belge gibi çizer:
 * PDF sayfası, e-posta istemcisi görünümü veya web sayfası.
 *
 * Gizli bloklar normalde görünmez; `reveal` açıldığında kırmızıya boyanır.
 * `onHiddenRect` gizli bloğun sayfa içindeki yerleşim dikdörtgenini verir —
 * simülasyon kamerası tam oraya yaklaşır.
 */
export const DocumentPage = forwardRef<
  HTMLDivElement,
  {
    doc: Doc
    reveal?: boolean
    onHiddenRect?: (r: HiddenRect) => void
    className?: string
    compact?: boolean
  }
>(function DocumentPage({ doc, reveal, onHiddenRect, className, compact }, ref) {
  const pageRef = useRef<HTMLDivElement>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!onHiddenRect) return
    // Sayfa ölçeklenmiş çizilebildiği için getBoundingClientRect yerine
    // dönüşümlerden etkilenmeyen yerleşim ofsetleri kullanılır.
    const measure = () => {
      const el = hiddenRef.current
      if (!el) return
      onHiddenRect({
        x: el.offsetLeft,
        y: el.offsetTop,
        w: Math.max(el.offsetWidth, 120),
        h: Math.max(el.offsetHeight, 26),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (hiddenRef.current) ro.observe(hiddenRef.current)
    if (pageRef.current) ro.observe(pageRef.current)
    return () => ro.disconnect()
  }, [onHiddenRect, reveal, doc])

  useEffect(() => {
    if (typeof ref === 'function') ref(pageRef.current)
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = pageRef.current
  }, [ref])

  let hiddenSeen = false
  let lineNo = 0
  const code = doc.kind === 'code'
  const body = doc.blocks.map((b, i) => {
    if (b.type === 'hidden') {
      const first = !hiddenSeen
      hiddenSeen = true
      const node = (
        <HiddenBlock
          key={i}
          block={b}
          reveal={!!reveal}
          compact={compact}
          serif={doc.kind === 'pdf'}
          ref={first ? hiddenRef : undefined}
        />
      )
      // Kod dosyasında gizli blok da bir satır numarası tüketir: dosyada
      // gerçekten o satırda duruyor, yalnızca çizilmiyor.
      if (code) {
        lineNo += 1
        return (
          <CodeLine key={i} n={lineNo} compact={compact} hidden={!reveal}>
            {node}
          </CodeLine>
        )
      }
      return node
    }
    if (code) {
      lineNo += 1
      return (
        <CodeLine key={i} n={lineNo} compact={compact}>
          <CodeText block={b} compact={compact} />
        </CodeLine>
      )
    }
    return <Block key={i} block={b} compact={compact} serif={doc.kind === 'pdf'} />
  })

  return (
    <div
      ref={pageRef}
      className={cn(
        'relative isolate overflow-hidden text-neutral-900',
        doc.kind === 'code' ? 'bg-[#fbfbfd]' : 'bg-white',
        doc.kind === 'pdf'
          ? 'rounded-[2px] shadow-[0_1px_0_rgba(0,0,0,0.06),0_24px_60px_-18px_rgba(0,0,0,0.65)]'
          : 'rounded-xl shadow-[0_24px_60px_-18px_rgba(0,0,0,0.6)]',
        className,
      )}
    >
      {doc.kind === 'web' && <WebChrome doc={doc} compact={compact} />}
      {doc.kind === 'email' && <EmailChrome doc={doc} compact={compact} />}
      {doc.kind === 'pdf' && <PdfChrome doc={doc} compact={compact} />}
      {doc.kind === 'code' && <CodeChrome doc={doc} compact={compact} />}

      <div
        className={cn(
          doc.kind === 'code'
            ? compact
              ? 'py-2'
              : 'py-4'
            : doc.kind === 'pdf'
            ? compact
              ? 'px-6 py-5'
              : 'px-16 py-14'
            : doc.kind === 'web'
              ? compact
                ? 'px-5 py-4'
                : 'px-12 py-11'
              : compact
                ? 'px-4 py-3.5'
                : 'px-8 py-7',
        )}
      >
        {body}
      </div>

      {doc.kind === 'pdf' && (
        <div
          className={cn(
            'text-center font-serif text-neutral-400',
            compact ? 'pb-3 text-[9px]' : 'pb-7 text-[11px]',
          )}
        >
          — 1 —
        </div>
      )}
      {doc.kind === 'web' && (
        <div
          className={cn(
            'border-t border-neutral-200 bg-neutral-50 text-neutral-400',
            compact ? 'px-5 py-2.5 text-[9px]' : 'px-10 py-5 text-[11px]',
          )}
        >
          © {doc.brand ?? doc.title} · Gizlilik · Koşullar
        </div>
      )}
      {doc.kind === 'email' && (
        <div className={cn('flex gap-2', compact ? 'px-4 pb-3.5' : 'px-8 pb-7')}>
          {[
            { icon: CornerUpLeft, label: 'Yanıtla' },
            { icon: Forward, label: 'İlet' },
          ].map((a) => (
            <span
              key={a.label}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-neutral-300 text-neutral-600',
                compact ? 'px-2 py-1 text-[9px]' : 'px-4 py-2 text-[13px]',
              )}
            >
              <a.icon className={compact ? 'size-2.5' : 'size-4'} />
              {a.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})

/* --------------------------------- kabuklar -------------------------------- */

function WebChrome({ doc, compact }: { doc: Doc; compact?: boolean }) {
  return (
    <>
      {/* tarayıcı sekmesi + adres çubuğu */}
      <div
        className={cn(
          'flex items-center gap-2 border-b border-neutral-200 bg-neutral-100',
          compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5',
        )}
      >
        <span className="flex gap-1">
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span
              key={c}
              className={compact ? 'size-1.5 rounded-full' : 'size-2.5 rounded-full'}
              style={{ background: c }}
            />
          ))}
        </span>
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white text-neutral-500 ring-1 ring-neutral-200',
            compact ? 'px-2 py-0.5 text-[8.5px]' : 'px-3 py-1.5 text-[11.5px]',
          )}
        >
          <Lock className={compact ? 'size-2' : 'size-3'} />
          <span className="truncate">{doc.head[0]}</span>
        </div>
      </div>

      {/* site gezintisi */}
      <div
        className={cn(
          'flex items-center gap-4 border-b border-neutral-200',
          compact ? 'px-5 py-2' : 'px-10 py-4',
        )}
      >
        <span
          className={cn(
            'font-semibold tracking-tight text-neutral-900',
            compact ? 'text-[11px]' : 'text-[15px]',
          )}
        >
          {doc.brand ?? doc.title}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {(doc.nav ?? []).map((n, i) => (
            <span
              key={n}
              className={cn(
                i === 1 ? 'text-neutral-900' : 'text-neutral-500',
                compact ? 'text-[8.5px]' : 'text-[12px]',
              )}
            >
              {n}
            </span>
          ))}
        </span>
      </div>
    </>
  )
}

function EmailChrome({ doc, compact }: { doc: Doc; compact?: boolean }) {
  const initial = (doc.from?.name ?? 'T').charAt(0)
  return (
    <div className={cn('border-b border-neutral-200', compact ? 'px-4 py-3' : 'px-8 py-6')}>
      <h1
        className={cn(
          'font-normal tracking-tight text-neutral-900',
          compact ? 'mb-2 text-[13px]' : 'mb-4 text-[20px]',
        )}
      >
        {doc.title}
      </h1>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-full bg-[#1a73e8] font-medium text-white',
            compact ? 'size-7 text-[11px]' : 'size-10 text-[15px]',
          )}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn('text-neutral-900', compact ? 'text-[11px]' : 'text-[13.5px]')}>
            <span className="font-semibold">{doc.from?.name}</span>{' '}
            <span className="text-neutral-500">
              &lt;{doc.from?.address}&gt;
            </span>
          </div>
          <div className={cn('text-neutral-500', compact ? 'text-[9.5px]' : 'text-[12px]')}>
            bana · {doc.head[doc.head.length - 1]}
          </div>
        </div>
        <Star className={cn('shrink-0 text-neutral-300', compact ? 'size-3.5' : 'size-4.5')} />
      </div>
    </div>
  )
}

/** Kod düzenleyici kabuğu: sekme çubuğu + dosya yolu. */
function CodeChrome({ doc, compact }: { doc: Doc; compact?: boolean }) {
  const tabs = doc.tabs ?? []
  return (
    <>
      <div
        className={cn(
          'flex items-stretch border-b border-neutral-200 bg-neutral-100',
          compact ? 'text-[9px]' : 'text-[12px]',
        )}
      >
        <span
          className={cn(
            'flex items-center gap-1.5 border-r border-neutral-200 bg-[#fbfbfd] font-medium text-neutral-800',
            compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5',
          )}
        >
          <FileCode2 className={compact ? 'size-2.5' : 'size-3.5'} />
          {doc.title}
        </span>
        {tabs.map((t) => (
          <span
            key={t}
            className={cn(
              'flex items-center border-r border-neutral-200 text-neutral-400',
              compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5',
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        className={cn(
          'flex items-center gap-1.5 border-b border-neutral-200 bg-[#fbfbfd] font-mono text-neutral-500',
          compact ? 'px-2.5 py-1 text-[8.5px]' : 'px-4 py-2 text-[11px]',
        )}
      >
        {doc.head.map((h, i) => (
          <span key={i} className={i === 0 ? 'text-neutral-700' : undefined}>
            {i > 0 && <span className="mr-1.5 text-neutral-300">/</span>}
            {h}
          </span>
        ))}
      </div>
    </>
  )
}

/** Satır numaralı tek kod satırı. */
function CodeLine({
  n,
  compact,
  hidden,
  children,
}: {
  n: number
  compact?: boolean
  hidden?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start">
      <span
        className={cn(
          'shrink-0 border-r border-neutral-200/80 text-right font-mono text-neutral-300 select-none',
          compact ? 'w-7 pr-1.5 text-[8.5px] leading-[1.9]' : 'w-12 pr-3 text-[11px] leading-[1.75]',
        )}
      >
        {n}
      </span>
      <div className={cn('min-w-0 flex-1', compact ? 'pr-2 pl-2' : 'pr-5 pl-4')}>
        {hidden ? <div className={compact ? 'h-[16px]' : 'h-[21px]'}>{children}</div> : children}
      </div>
    </div>
  )
}

/** Kod satırının içeriği — Markdown kaynağı gibi çizilir. */
function CodeText({ block, compact }: { block: DocBlock; compact?: boolean }) {
  const base = cn(
    'font-mono whitespace-pre-wrap',
    compact ? 'text-[8.5px] leading-[1.9]' : 'text-[11.5px] leading-[1.75]',
  )
  const mark = (m: string) => <span className="text-neutral-400">{m}</span>
  switch (block.type) {
    case 'title':
      return (
        <p className={cn(base, 'font-semibold text-[#0a3069]')}>
          {mark('# ')}
          {block.text}
        </p>
      )
    case 'h':
      return (
        <p className={cn(base, 'font-semibold text-[#0a3069]')}>
          {mark('## ')}
          {block.text}
        </p>
      )
    case 'li':
      return (
        <p className={cn(base, 'text-neutral-700')}>
          {mark('- ')}
          {block.text}
        </p>
      )
    case 'meta':
      return <p className={cn(base, 'text-[#6a737d] italic')}>{block.text}</p>
    case 'rule':
      return <p className={cn(base, 'text-neutral-300')}>---</p>
    case 'p':
      return <p className={cn(base, 'text-neutral-700')}>{block.text}</p>
    default:
      return <Block block={block} compact={compact} />
  }
}

function PdfChrome({ doc, compact }: { doc: Doc; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 text-neutral-500',
        compact ? 'px-3 py-1.5 text-[8.5px]' : 'px-5 py-2.5 text-[11px]',
      )}
    >
      <Paperclip className={compact ? 'size-2.5' : 'size-3.5'} />
      <span className="truncate font-medium text-neutral-700">{doc.title}</span>
      <span className="ml-auto truncate">{doc.head[doc.head.length - 1]}</span>
    </div>
  )
}

/* ---------------------------------- bloklar -------------------------------- */

function Block({
  block,
  compact,
  serif,
}: {
  block: DocBlock
  compact?: boolean
  serif?: boolean
}) {
  const f = serif ? 'font-serif' : ''
  switch (block.type) {
    case 'title':
      return (
        <h1
          className={cn(
            f,
            'font-semibold tracking-tight text-neutral-900',
            serif
              ? compact
                ? 'mb-1 text-[15px]'
                : 'mb-2 text-[25px]'
              : compact
                ? 'mb-1.5 text-[15px]'
                : 'mb-3 text-[30px] tracking-[-0.02em]',
          )}
        >
          {block.text}
        </h1>
      )
    case 'h':
      return (
        <h2
          className={cn(
            f,
            'font-semibold text-neutral-800',
            compact ? 'mt-3 mb-1 text-[11.5px]' : 'mt-7 mb-2.5 text-[17px]',
          )}
        >
          {block.text}
        </h2>
      )
    case 'p':
      return (
        <p
          className={cn(
            f,
            'text-neutral-700',
            compact ? 'mb-1.5 text-[10.5px] leading-relaxed' : 'mb-3.5 text-[14.5px] leading-[1.75]',
          )}
        >
          {block.text}
        </p>
      )
    case 'li':
      return (
        <div
          className={cn(
            f,
            'flex gap-2.5 text-neutral-700',
            compact ? 'mb-1 text-[10.5px]' : 'mb-2.5 text-[14.5px] leading-[1.7]',
          )}
        >
          <span className="text-neutral-300">•</span>
          <span>{block.text}</span>
        </div>
      )
    case 'meta':
      return (
        <p
          className={cn(
            f,
            'text-neutral-500',
            compact ? 'text-[9.5px]' : 'mb-1.5 text-[12.5px] leading-relaxed',
          )}
        >
          {block.text}
        </p>
      )
    case 'rule':
      return <hr className={cn('border-neutral-200', compact ? 'my-2.5' : 'my-7')} />
    case 'contact':
      return (
        <div
          className={cn(
            f,
            'flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-500',
            compact ? 'mb-1 text-[9px]' : 'mb-1 text-[12.5px]',
          )}
        >
          {block.items.map((it, i) => (
            <span key={it} className="flex items-center gap-3">
              {i > 0 && <span className="text-neutral-300">·</span>}
              {it}
            </span>
          ))}
        </div>
      )
    case 'entry':
      return (
        <div className={compact ? 'mb-2' : 'mb-5'}>
          <div className="flex items-baseline justify-between gap-4">
            <span
              className={cn(
                f,
                'font-semibold text-neutral-800',
                compact ? 'text-[10.5px]' : 'text-[14.5px]',
              )}
            >
              {block.text}
            </span>
            {block.meta && (
              <span
                className={cn(
                  f,
                  'shrink-0 text-neutral-500 tabular-nums',
                  compact ? 'text-[9px]' : 'text-[12.5px]',
                )}
              >
                {block.meta}
              </span>
            )}
          </div>
          {block.note && (
            <p
              className={cn(
                f,
                'mt-1 text-neutral-600',
                compact ? 'text-[9.5px] leading-snug' : 'text-[13.5px] leading-[1.6]',
              )}
            >
              {block.note}
            </p>
          )}
        </div>
      )
    case 'price':
      return (
        <div
          className={cn(
            'rounded-xl border border-neutral-200',
            compact ? 'mb-2 px-3 py-2.5' : 'mb-3.5 px-5 py-4',
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span
              className={cn(
                'font-semibold text-neutral-900',
                compact ? 'text-[11px]' : 'text-[16px]',
              )}
            >
              {block.text}
            </span>
            <span
              className={cn(
                'font-semibold text-neutral-900 tabular-nums',
                compact ? 'text-[11px]' : 'text-[18px]',
              )}
            >
              {block.price}
            </span>
          </div>
          {block.note && (
            <div
              className={cn('text-neutral-500', compact ? 'text-[8.5px]' : 'mt-0.5 text-[12px]')}
            >
              {block.note}
            </div>
          )}
          {block.features && (
            <div className={cn('flex flex-col', compact ? 'mt-1.5 gap-0.5' : 'mt-3 gap-1.5')}>
              {block.features.map((ft) => (
                <span
                  key={ft}
                  className={cn(
                    'flex items-center gap-2 text-neutral-600',
                    compact ? 'text-[9px]' : 'text-[13px]',
                  )}
                >
                  <Check
                    className={cn('shrink-0 text-emerald-600', compact ? 'size-2' : 'size-3.5')}
                  />
                  {ft}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    case 'image':
      return (
        <figure className={compact ? 'mb-2' : 'mb-6'}>
          {block.variant === 'screenshot' ? (
            <Screenshot compact={compact} />
          ) : (
            <div
              className={cn(
                'w-full rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-600',
                compact ? 'h-10' : 'h-24',
              )}
            />
          )}
          <figcaption
            className={cn('text-neutral-400', compact ? 'mt-1 text-[8px]' : 'mt-2 text-[11px]')}
          >
            {block.alt}
          </figcaption>
        </figure>
      )
    default:
      return null
  }
}

/** Sayfa içindeki ürün görseli — dış kaynak çekilmeden yerinde çizilir. */
function Screenshot({ compact }: { compact?: boolean }) {
  const bars = [52, 78, 41, 95, 66, 84, 38]
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50',
        compact ? 'h-[72px]' : 'h-[188px]',
      )}
      role="img"
      aria-label="Ürün ekran görüntüsü"
    >
      <div
        className={cn(
          'flex items-center gap-1 border-b border-neutral-200 bg-white',
          compact ? 'px-1.5 py-1' : 'px-3 py-2',
        )}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span
            key={c}
            className={compact ? 'size-1 rounded-full' : 'size-2 rounded-full'}
            style={{ background: c }}
          />
        ))}
        <span
          className={cn(
            'ml-2 rounded bg-neutral-200',
            compact ? 'h-1 w-10' : 'h-2 w-28',
          )}
        />
      </div>
      <div className="flex h-full">
        <div
          className={cn(
            'flex shrink-0 flex-col gap-1 border-r border-neutral-200 bg-white',
            compact ? 'w-8 p-1.5' : 'w-24 p-3',
          )}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                'rounded bg-neutral-200',
                compact ? 'h-1' : 'h-2',
                i === 1 ? 'bg-[#1a73e8]/60' : '',
              )}
              style={{ width: `${70 - i * 12}%` }}
            />
          ))}
        </div>
        <div className={cn('flex flex-1 items-end gap-1.5', compact ? 'p-1.5' : 'p-4')}>
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-[#1a73e8]"
              style={{ height: `${h * (compact ? 0.32 : 0.52)}%`, opacity: 0.25 + i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const HiddenBlock = forwardRef<
  HTMLDivElement,
  {
    block: Extract<DocBlock, { type: 'hidden' }>
    reveal: boolean
    compact?: boolean
    serif?: boolean
  }
>(function HiddenBlock({ block, reveal, compact }, ref) {
  // Gizleme biçimini sayfada *taklit* eder: beyaz-üstü-beyaz gerçekten beyaz
  // çizilir; yorum ve katman blokları hiç yer kaplamaz.
  const occupies = block.style === 'white-on-white'

  return (
    <div ref={ref} className="relative" data-hidden-block>
      {!reveal && occupies && (
        <div
          aria-hidden
          className="pointer-events-none leading-[1.1] whitespace-pre-wrap text-white select-none"
          style={{ fontSize: compact ? 2 : 3 }}
        >
          {block.text}
        </div>
      )}
      {!reveal && !occupies && <div aria-hidden className="h-[3px]" />}

      <AnimatePresence>
        {reveal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'relative rounded border-2 border-[#ff3b30] bg-[#ff3b30]/8',
                compact ? 'my-1.5 px-2 py-1.5' : 'my-4 px-4 py-3.5',
              )}
            >
              <div
                className={cn(
                  'mb-1.5 font-semibold tracking-wider text-[#c81e14] uppercase',
                  compact ? 'text-[8px]' : 'text-[10.5px]',
                )}
              >
                Gizli katman · {block.how}
              </div>
              <pre
                className={cn(
                  'font-mono whitespace-pre-wrap text-[#8c1209]',
                  compact ? 'text-[8.5px] leading-snug' : 'text-[12px] leading-relaxed',
                )}
              >
                {block.text}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
