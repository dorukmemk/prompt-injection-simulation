import { motion } from 'motion/react'
import { useState } from 'react'
import { ArrowRight, Info, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROFILES } from '@/lib/profiles'
import type { ProfileId } from '@/lib/types'
import { useApp } from '@/store/useApp'
import { Wallpaper } from '@/components/shell/Wallpaper'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const REPO = 'https://github.com/dorukmemk/prompt-injection-simulation'

/** macOS oturum açma ekranı deseni: kullanıcı seç, gir. */
export function Login() {
  const setProfile = useApp((s) => s.setProfile)
  const enterOS = useApp((s) => s.enterOS)
  const saved = useApp((s) => s.profileId)
  const [picked, setPicked] = useState<ProfileId | null>(saved)
  const [leaving, setLeaving] = useState(false)

  function go() {
    if (!picked) return
    setProfile(picked)
    setLeaving(true)
    window.setTimeout(enterOS, 620)
  }

  return (
    <motion.div
      className="relative flex h-full w-full flex-col"
      animate={leaving ? { opacity: 0, filter: 'blur(18px)', scale: 1.04 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Wallpaper />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 flex flex-col items-center"
        >
          <h1 className="text-[clamp(34px,5vw,52px)] leading-none font-bold tracking-[0.08em]">
            GTÜCYBER
          </h1>
        </motion.div>

        <div className="flex flex-wrap items-start justify-center gap-7 sm:gap-10">
          {PROFILES.map((p, i) => {
            const on = picked === p.id
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                onClick={() => setPicked(p.id)}
                aria-pressed={on}
                className="group flex w-24 flex-col items-center gap-3 outline-none"
              >
                <motion.span
                  animate={{ scale: on ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={cn(
                    'grid size-[72px] place-items-center rounded-full text-[28px] backdrop-blur-xl transition-all duration-300',
                    on
                      ? 'bg-white/22 ring-[3px] ring-white/70'
                      : 'bg-white/10 ring-0 group-hover:bg-white/16',
                  )}
                >
                  {p.glyph}
                </motion.span>
                <span
                  className={cn(
                    'text-center text-[13px] leading-tight font-medium transition-colors',
                    on ? 'text-foreground' : 'text-foreground/60',
                  )}
                >
                  {p.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          layout
          className="mt-10 flex h-10 items-center"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-[12.5px] text-muted-foreground">
                {PROFILES.find((p) => p.id === picked)?.age}
              </span>
              <Button size="sm" onClick={go} className="rounded-full">
                Giriş <ArrowRight />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <footer className="relative flex items-center justify-center gap-1 pb-5">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full">
              <Info /> Temsilî model
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-[330px] text-[12.5px] leading-relaxed">
            Bu platform bir modelin gerçek, özel düşünce zincirini göstermez. Gösterilenler;
            belgelenmiş saldırı mekanizmaları, yetki sınırları ve güvenlik denetimlerinin eğitim
            amaçlı temsilî modelidir. Tüm veriler kurgusaldır.
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground rounded-full"
        >
          <a href={REPO} target="_blank" rel="noreferrer noopener">
            <Scale /> MIT
          </a>
        </Button>
      </footer>
    </motion.div>
  )
}
