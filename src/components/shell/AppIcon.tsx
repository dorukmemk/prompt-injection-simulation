import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * macOS tarzı uygulama simgesi.
 * Düz renk yerine katmanlı bir yüzey: üstten ışık, alttan koyulaşma,
 * ince iç çerçeve ve yumuşak dış gölge.
 */
export function AppIcon({
  icon: Icon,
  accent,
  className,
  style,
}: {
  icon: LucideIcon
  /** Simgenin ana rengi (koyu ton) */
  accent: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn('relative grid place-items-center overflow-hidden', className)}
      style={{
        borderRadius: '23%',
        background: `linear-gradient(170deg,
          color-mix(in oklab, ${accent} 78%, white) 0%,
          ${accent} 42%,
          color-mix(in oklab, ${accent} 72%, black) 100%)`,
        boxShadow: `
          inset 0 1px 0 0 rgb(255 255 255 / 0.45),
          inset 0 -1px 0 0 rgb(0 0 0 / 0.25),
          0 1px 1px 0 rgb(0 0 0 / 0.35),
          0 6px 14px -4px rgb(0 0 0 / 0.55)`,
        ...style,
      }}
      aria-hidden
    >
      {/* üst parlaklık */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          background: 'linear-gradient(180deg, rgb(255 255 255 / 0.28), transparent)',
          borderRadius: '23% 23% 50% 50% / 23% 23% 22% 22%',
        }}
      />
      {/* ince çerçeve */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: '23%', boxShadow: 'inset 0 0 0 0.5px rgb(255 255 255 / 0.3)' }}
      />
      <Icon
        className="relative size-[46%] text-white"
        strokeWidth={1.9}
        style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.35))' }}
      />
    </span>
  )
}

/** macOS tarzı belge simgesi: kıvrık köşeli beyaz sayfa + tür şeridi. */
export function FileIcon({
  label,
  accent,
  className,
}: {
  label: string
  accent: string
  className?: string
}) {
  return (
    <span className={cn('relative block', className)} aria-hidden>
      <svg viewBox="0 0 56 70" className="size-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]">
        <defs>
          <linearGradient id={`paper-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e9e9ee" />
          </linearGradient>
        </defs>
        {/* sayfa */}
        <path
          d="M5 5a4 4 0 0 1 4-4h26l16 16v48a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"
          fill={`url(#paper-${label})`}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="0.75"
        />
        {/* kıvrık köşe */}
        <path d="M35 1l16 16H39a4 4 0 0 1-4-4z" fill="#c9c9d2" />
        <path d="M35 1l16 16H39a4 4 0 0 1-4-4z" fill="rgba(0,0,0,0.06)" />
        {/* metin satırları */}
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x="13"
            y={26 + i * 6}
            width={i === 2 ? 20 : 30}
            height="2.5"
            rx="1.25"
            fill="rgba(0,0,0,0.16)"
          />
        ))}
        {/* tür şeridi */}
        <rect x="5" y="50" width="46" height="14" rx="3" fill={accent} />
        <text
          x="28"
          y="60"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          letterSpacing="0.06em"
          fill="#ffffff"
          fontFamily="var(--font-system)"
        >
          {label}
        </text>
      </svg>
    </span>
  )
}
