import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Beat, Profile } from '@/lib/types'
import { tp } from '@/lib/copy'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DecisionCard({
  beat,
  profile,
  answer,
  onAnswer,
  onContinue,
  interactive,
}: {
  beat: Beat
  profile: Profile
  answer?: string
  onAnswer: (id: string) => void
  onContinue: () => void
  interactive: boolean
}) {
  if (!beat.decision) return null
  const picked = beat.decision.options.find((o) => o.id === answer)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="material window-shadow w-full rounded-xl p-4"
    >
      <Badge variant="outline" className="mb-2 border-[#ffd479]/50 text-[#ffd479]">
        {interactive ? 'Karar noktası' : 'Düşün'}
      </Badge>

      <h3 className="text-[15px] leading-snug font-semibold tracking-tight">
        {tp(beat.decision.question, profile)}
      </h3>

      <div className="mt-2.5 flex flex-col gap-1.5">
        {beat.decision.options.map((o) => {
          const on = answer === o.id
          return (
            <button
              key={o.id}
              onClick={() => !answer && onAnswer(o.id)}
              disabled={!!answer && !on}
              className={cn(
                'flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-[12.5px] leading-relaxed transition-colors',
                on
                  ? o.correct
                    ? 'border-[#32d74b]/60 bg-[#32d74b]/12 text-[#bdf5db]'
                    : 'border-[#ffd479]/55 bg-[#ffd479]/12 text-[#ffe3ab]'
                  : answer
                    ? 'text-muted-foreground/50 border-transparent'
                    : 'hover:bg-accent',
              )}
            >
              {on ? (
                o.correct ? (
                  <Check className="mt-0.5 size-3.5 shrink-0" />
                ) : (
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0" />
                )
              ) : (
                <Circle className="mt-0.5 size-3.5 shrink-0 opacity-40" />
              )}
              {tp(o.label, profile)}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {picked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <p className="bg-card/60 mt-2.5 rounded-lg border p-2.5 text-[12.5px] leading-relaxed">
              {tp(picked.feedback, profile)}
            </p>
            {interactive && (
              <div className="mt-2.5 flex justify-end">
                <Button size="sm" onClick={onContinue}>
                  Devam <ArrowRight />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
