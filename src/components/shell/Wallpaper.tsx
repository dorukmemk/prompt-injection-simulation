import { cn } from '@/lib/utils'

/** macOS duvar kâğıdı: yavaş hareket eden derin gradyan. */
export function Wallpaper({ className, dimmed }: { className?: string; dimmed?: boolean }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-0 bg-[#0a0a10]" />
      <div
        className="wallpaper-layer absolute -top-1/4 -left-[10%] h-[90%] w-[70%] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(88,86,214,0.5), transparent 68%)',
          opacity: dimmed ? 0.35 : 0.8,
        }}
      />
      <div
        className="wallpaper-layer absolute top-[10%] -right-[15%] h-[85%] w-[65%] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(48,209,200,0.28), transparent 68%)',
          opacity: dimmed ? 0.3 : 0.7,
          animationDelay: '-13s',
        }}
      />
      <div
        className="wallpaper-layer absolute -bottom-1/3 left-[25%] h-[80%] w-[75%] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,55,95,0.2), transparent 65%)',
          opacity: dimmed ? 0.25 : 0.55,
          animationDelay: '-26s',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
