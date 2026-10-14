import { motion, useDragControls, useMotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { APP_MAP } from '@/lib/apps'
import { useApp, type WinId } from '@/store/useApp'

function TrafficLights({ id }: { id: WinId }) {
  const close = useApp((s) => s.closeApp)
  const minimize = useApp((s) => s.minimizeApp)
  return (
    <div className="group/tl flex items-center gap-2">
      <button
        type="button"
        draggable={false}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => close(id)}
        aria-label="Kapat"
        className="grid size-3 place-items-center rounded-full bg-[#ff5f57] text-[7px] font-bold text-black/55"
      >
        <span className="opacity-0 group-hover/tl:opacity-100">✕</span>
      </button>
      <button
        type="button"
        draggable={false}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => minimize(id)}
        aria-label="Küçült"
        className="grid size-3 place-items-center rounded-full bg-[#febc2e] text-[8px] font-bold text-black/55"
      >
        <span className="opacity-0 group-hover/tl:opacity-100">–</span>
      </button>
      <span className="size-3 rounded-full bg-white/18" aria-hidden />
    </div>
  )
}

export function Window({
  id,
  z,
  x,
  y,
  minimized,
  sidebar,
  toolbar,
  children,
}: {
  id: WinId
  z: number
  x: number
  y: number
  minimized: boolean
  sidebar?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
}) {
  const meta = APP_MAP[id]
  const focus = useApp((s) => s.focusApp)
  const move = useApp((s) => s.moveApp)

  // Sürükleme pencerenin tamamına uygulanır, başlık çubuğu yalnızca onu başlatır.
  // (Daha önce başlık elemanının kendisi taşınıyordu — pencere yerinde kalıyordu.)
  const controls = useDragControls()
  const dx = useMotionValue(0)
  const dy = useMotionValue(0)

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        move(
          id,
          Math.max(-6, Math.min(74, x + (info.offset.x / window.innerWidth) * 100)),
          Math.max(0, Math.min(70, y + (info.offset.y / window.innerHeight) * 100)),
        )
        dx.set(0)
        dy.set(0)
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={
        minimized
          ? { opacity: 0, scale: 0.55, pointerEvents: 'none' }
          : { opacity: 1, scale: 1, pointerEvents: 'auto' }
      }
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        x: dx,
        y: dy,
        zIndex: z,
        left: `${x}%`,
        top: `${y}%`,
        width: `min(${meta.w}px, calc(100vw - 28px))`,
        height: `min(${meta.h}px, calc(100vh - 120px))`,
      }}
      onPointerDown={() => focus(id)}
      className="material window-shadow absolute flex flex-col overflow-hidden rounded-[11px]"
    >
      <header
        onPointerDown={(e) => {
          // Düğmeler kendi pointer olaylarını durdurur; kalan alan pencereyi taşır.
          controls.start(e)
        }}
        onDragStart={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        className={cn(
          'flex h-[38px] shrink-0 cursor-grab items-center gap-3 border-b border-white/10 px-3',
          'select-none active:cursor-grabbing [&_*]:[-webkit-user-drag:none]',
        )}
      >
        <TrafficLights id={id} />
        <span className="truncate text-[13px] font-semibold tracking-tight">{meta.name}</span>
        {toolbar && (
          <div
            className="ml-auto flex shrink-0 items-center gap-1.5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {toolbar}
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebar && (
          <aside className="hidden w-[190px] shrink-0 border-r border-white/8 bg-black/15 md:block">
            {sidebar}
          </aside>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </motion.div>
  )
}
