import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { APPS } from '@/lib/apps'
import { AppIcon } from './AppIcon'
import { useApp } from '@/store/useApp'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function DockIcon({
  mouseX,
  Icon,
  name,
  accent,
  running,
  onClick,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>
  Icon: LucideIcon
  name: string
  accent: string
  running: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const dist = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 50 }
    return x - b.x - b.width / 2
  })
  const size = useSpring(useTransform(dist, [-140, 0, 140], [46, 66, 46], { clamp: true }), {
    stiffness: 340,
    damping: 24,
    mass: 0.4,
  })
  const lift = useSpring(useTransform(dist, [-110, 0, 110], [0, -10, 0], { clamp: true }), {
    stiffness: 340,
    damping: 24,
    mass: 0.4,
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          ref={ref}
          onClick={onClick}
          style={{ width: size, height: size, y: lift }}
          whileTap={{ scale: 0.86 }}
          className="relative grid shrink-0 place-items-center"
          aria-label={name}
        >
          <AppIcon icon={Icon} accent={accent} className="size-full" />
          {running && (
            <span className="absolute -bottom-[6px] size-[3.5px] rounded-full bg-white/75" />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={14}>
        {name}
      </TooltipContent>
    </Tooltip>
  )
}

export function Dock() {
  const openApp = useApp((s) => s.openApp)
  const windows = useApp((s) => s.windows)
  const mouseX = useMotionValue(Infinity)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center pb-2">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="material pointer-events-auto flex items-end gap-2 rounded-[22px] px-2.5 pt-1.5 pb-2 ring-1 ring-white/12"
      >
        {APPS.filter((a) => a.dock).map((a) => (
          <DockIcon
            key={a.id}
            mouseX={mouseX}
            Icon={a.icon}
            name={a.name}
            accent={a.accent}
            running={windows.some((w) => w.app === a.id)}
            onClick={() => openApp(a.id)}
          />
        ))}
      </motion.div>
    </div>
  )
}
