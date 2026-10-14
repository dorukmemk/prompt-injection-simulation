import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONE = {
  danger: { border: 'rgba(255,69,58,0.4)', bg: 'rgba(255,69,58,0.07)', dot: '#ff453a' },
  safe: { border: 'rgba(50,215,75,0.4)', bg: 'rgba(50,215,75,0.07)', dot: '#32d74b' },
  neutral: { border: 'rgba(255,255,255,0.12)', bg: 'transparent', dot: '#98989f' },
} as const

/**
 * Varsayılan olarak kapalı açılır bölüm.
 * Sohbet akışında uyarı ve dökümler yanıtı boğmasın diye kullanılır.
 */
export function Disclosure({
  label,
  tone = 'neutral',
  flush,
  children,
}: {
  label: string
  tone?: keyof typeof TONE
  flush?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const t = TONE[tone]

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: t.border, background: open ? t.bg : 'transparent' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5"
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: t.dot }} />
        <span className="flex-1 text-[12.5px] font-medium">{label}</span>
        <ChevronRight
          className={cn('size-3.5 text-white/40 transition-transform', open && 'rotate-90')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className={cn(flush ? '' : 'px-3.5 pt-0.5 pb-3.5')}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
