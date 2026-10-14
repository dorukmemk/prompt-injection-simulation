import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ExternalLink, FlaskConical, Terminal } from 'lucide-react'
import type { Beat, Profile } from '@/lib/types'
import { tp } from '@/lib/copy'
import { refsOf } from '@/lib/references'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

const KIND: Record<Beat['kind'], { label: string; color: string }> = {
  intro: { label: 'Giriş', color: '#98989f' },
  ingest: { label: 'Bağlam', color: '#6ea8ff' },
  parse: { label: 'Ayrıştırma', color: '#6ea8ff' },
  injection: { label: 'Enjeksiyon', color: '#ff453a' },
  boundary: { label: 'Güven sınırı', color: '#ff453a' },
  decision: { label: 'Karar', color: '#ffd479' },
  tool: { label: 'Araç', color: '#30d5c8' },
  guard: { label: 'Savunma', color: '#32d74b' },
  consequence: { label: 'Sonuç', color: '#ff453a' },
  outro: { label: 'Kapanış', color: '#a78bfa' },
}

/**
 * Belgesel alt-başlığı: tek büyük cümle.
 * Ayrıntı metni varsayılan olarak kapalıdır — isteyen açar, açık kalır.
 */
export function TitleCard({
  beat,
  profile,
  detail,
  onDetail,
}: {
  beat: Beat
  profile: Profile
  detail: boolean
  onDetail: (v: boolean) => void
}) {
  const base = KIND[beat.kind]
  // Savunulan sahnelerde kırmızı etiket yanıltıcı olur: sonuca göre renklendir
  const k =
    beat.verdict === 'blocked'
      ? { ...base, color: '#32d74b' }
      : beat.verdict === 'attack'
        ? { ...base, color: '#ff453a' }
        : base
  const refs = refsOf(beat.refs)

  return (
    <div className="pointer-events-none w-full max-w-[min(820px,62vw)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.id}
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="mb-2.5 text-[clamp(10px,0.85vw,13px)] font-semibold tracking-[0.26em] uppercase"
            style={{ color: k.color }}
          >
            {k.label}
          </div>

          <h2
            className="text-balance font-semibold tracking-[-0.025em]"
            style={{
              fontSize: 'clamp(24px, 2.9vw, 46px)',
              lineHeight: 1.08,
              textShadow: '0 4px 40px rgba(0,0,0,0.8)',
            }}
          >
            {tp(beat.title, profile)}
          </h2>

          <AnimatePresence initial={false}>
            {detail && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="text-foreground/75 overflow-hidden text-[clamp(13px,1.1vw,17px)] leading-relaxed"
              >
                <span className="block pt-3">{tp(beat.body, profile)}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-auto mt-3 flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDetail(!detail)}
          className="rounded-full"
        >
          <ChevronDown className={detail ? 'rotate-180 transition-transform' : 'transition-transform'} />
          {detail ? 'Kısalt' : 'Detay'}
        </Button>

        {profile.tech && beat.tech && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon-sm" aria-label="Teknik ayrıntı">
                <Terminal className="text-[#30d5c8]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-[380px]">
              <p className="font-mono text-[12px] leading-relaxed">{beat.tech}</p>
            </PopoverContent>
          </Popover>
        )}

        {profile.academic && (beat.threatModel || beat.taxonomy || refs.length > 0) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon-sm" aria-label="Akademik katman">
                <FlaskConical className="text-[#ffd479]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-[400px]">
              <div className="flex flex-col gap-2 text-[12.5px] leading-relaxed">
                {beat.threatModel && <p>{beat.threatModel}</p>}
                {beat.taxonomy && beat.taxonomy.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {beat.taxonomy.map((t) => (
                      <Badge key={t} variant="outline" className="font-mono text-[10.5px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {refs.length > 0 && (
                  <>
                    <Separator />
                    {refs.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted-foreground hover:text-foreground flex items-start gap-1.5"
                      >
                        <ExternalLink className="mt-0.5 size-3 shrink-0" />
                        <span>{r.title}</span>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
