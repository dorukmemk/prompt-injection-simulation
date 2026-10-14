import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SCENARIOS } from '@/lib/scenarios'
import { useApp } from '@/store/useApp'
import { FileIcon } from './AppIcon'

/** Masaüstündeki senaryo dosyaları. Çift tıklayınca ilgili uygulamada açılır. */
export function DesktopIcons() {
  const launch = useApp((s) => s.launchScenario)
  const completed = useApp((s) => s.completed)
  const [sel, setSel] = useState<string | null>(null)

  return (
    <div
      className="absolute inset-0 p-3 pt-2"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setSel(null)
      }}
    >
      <div className="grid w-[112px] auto-rows-min gap-1">
        {SCENARIOS.map((s, i) => {
          const on = sel === s.id
          const done =
            completed.includes(`${s.id}:vulnerable`) && completed.includes(`${s.id}:protected`)
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => setSel(s.id)}
              onDoubleClick={() => launch(s.id, 'vulnerable')}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md px-1.5 py-1.5 outline-none',
                on && 'bg-white/14',
              )}
            >
              <span className="relative block h-14 w-11">
                <FileIcon
                  label={s.attackClass === 'direct' ? 'JB' : 'PI'}
                  accent={s.attackClass === 'direct' ? '#e08b12' : '#d02f3c'}
                  className="size-full"
                />
                {done && (
                  <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-[#32d74b] text-[9px] font-bold text-black">
                    ✓
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'rounded px-1 text-center text-[11.5px] leading-tight',
                  on ? 'bg-primary text-primary-foreground' : 'text-white drop-shadow-md',
                )}
              >
                {s.title}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
