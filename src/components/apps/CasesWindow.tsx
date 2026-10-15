import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  ExternalLink,
  MousePointerClick,
  Quote,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CASES_BY_YEAR,
  CASES_DESC,
  CASE_STATS,
  CASE_VECTORS,
  type CaseStatus,
  type RealCase,
} from '@/lib/cases'
import { MODULES } from '@/lib/curriculum'
import { SCENARIO_MAP } from '@/lib/scenarios'
import { useApp, type WindowState } from '@/store/useApp'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_META: Record<CaseStatus, { label: string; color: string }> = {
  düzeltildi: { label: 'Düzeltildi', color: '#30d158' },
  kısmen: { label: 'Kısmen kapandı', color: '#ffd479' },
  süregelen: { label: 'Süregelen durum', color: '#ff6b6b' },
}

const CLASS_COLOR = { dolaylı: '#ff6b6b', doğrudan: '#ffd479' } as const

/* ------------------------------- yardımcılar ------------------------------- */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-[3px] text-[11px] transition-colors',
        active
          ? 'border-foreground/35 bg-foreground/10 text-foreground'
          : 'text-muted-foreground border-transparent bg-white/[0.04] hover:bg-white/[0.08]',
      )}
    >
      {children}
    </button>
  )
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="bg-card/40 min-w-0 flex-1 rounded-lg border px-3 py-2">
      <div className="text-[22px] leading-none font-semibold tracking-tight tabular-nums">{n}</div>
      <div className="text-muted-foreground mt-1 text-[10.5px] leading-tight">{label}</div>
    </div>
  )
}

/** Yıllara göre vaka yoğunluğu — her kare bir vaka. */
function Timeline({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  return (
    <div className="flex items-end gap-3">
      {CASES_BY_YEAR.map(({ year, cases }) => (
        <div key={year} className="flex flex-col items-center gap-1.5">
          <div className="flex flex-col-reverse gap-[3px]">
            {cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c.id)}
                title={`${c.whenLabel} · ${c.target}`}
                aria-label={`${c.whenLabel} · ${c.target}`}
                className={cn(
                  'h-[9px] w-7 rounded-[2px] transition-transform',
                  selected === c.id ? 'scale-110 ring-1 ring-white/60' : 'hover:scale-110',
                )}
                style={{ background: CLASS_COLOR[c.cls], opacity: selected === c.id ? 1 : 0.55 }}
              />
            ))}
          </div>
          <span className="text-muted-foreground font-mono text-[10px]">{year}</span>
        </div>
      ))}
      <div className="text-muted-foreground ml-1 flex flex-col gap-1 self-center text-[10.5px]">
        <span className="flex items-center gap-1.5">
          <i className="h-[9px] w-3 rounded-[2px]" style={{ background: CLASS_COLOR.dolaylı }} />
          dolaylı
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-[9px] w-3 rounded-[2px]" style={{ background: CLASS_COLOR.doğrudan }} />
          doğrudan
        </span>
      </div>
    </div>
  )
}

function Section({
  title,
  tone,
  children,
}: {
  title: string
  tone?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3
        className="mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase"
        style={{ color: tone ?? 'var(--muted-foreground)' }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

/* --------------------------------- detay --------------------------------- */

function CaseDetail({ c }: { c: RealCase }) {
  const openApp = useApp((s) => s.openApp)
  const launch = useApp((s) => s.launchScenario)
  const status = STATUS_META[c.status]
  const scenario = c.scenarioId ? SCENARIO_MAP[c.scenarioId] : undefined
  const mod = c.moduleId ? MODULES.find((m) => m.id === c.moduleId) : undefined

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* künye */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11.5px] tracking-wide" style={{ color: '#9aa0ae' }}>
            {c.whenLabel}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-[11.5px]">{c.org}</span>
          <Badge
            variant="outline"
            className="font-normal"
            style={{ color: CLASS_COLOR[c.cls], borderColor: `${CLASS_COLOR[c.cls]}55` }}
          >
            {c.cls} enjeksiyon
          </Badge>
          <Badge variant="outline" className="font-normal">
            {c.vector}
          </Badge>
          <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: status.color }}>
            <i className="size-1.5 rounded-full" style={{ background: status.color }} />
            {status.label}
          </span>
        </div>

        <h2 className="mt-2 text-[20px] leading-tight font-semibold tracking-tight">
          {c.target}
          {c.alias && <span className="text-muted-foreground font-normal"> · “{c.alias}”</span>}
        </h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed">{c.headline}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.zeroClick && (
            <span className="flex items-center gap-1.5 rounded-md border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-2 py-1 text-[11px] text-[#ff9aa2]">
              <MousePointerClick className="size-3.5" /> Sıfır tık — kurbanın hiçbir şey yapması
              gerekmedi
            </span>
          )}
          {c.agentic && (
            <span className="flex items-center gap-1.5 rounded-md border border-[#e07b1c]/30 bg-[#e07b1c]/10 px-2 py-1 text-[11px] text-[#f0a860]">
              <Bot className="size-3.5" /> Model araç çağırabiliyordu
            </span>
          )}
          {c.cve && (
            <a
              href={c.cve.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.04] px-2 py-1 font-mono text-[11px] transition-colors hover:bg-white/[0.09]"
            >
              {c.cve.id} · CVSS {c.cve.cvss}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </header>

      <Separator />

      <Section title="Ne oldu?">
        <div className="flex flex-col gap-2 text-[13.5px] leading-relaxed">
          {c.what.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Section>

      <Section title="Zincir">
        <ol className="flex flex-col gap-0">
          {c.chain.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-white/18 bg-white/[0.05] font-mono text-[10px]">
                  {i + 1}
                </span>
                {i < c.chain.length - 1 && <span className="w-px flex-1 bg-white/12" />}
              </div>
              <span className="pb-2.5 text-[13px] leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.06] p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#ff9aa2] uppercase">
            <AlertTriangle className="size-3.5" /> Etki
          </div>
          <ul className="flex flex-col gap-1 text-[12.5px] leading-relaxed">
            {c.impact.map((x, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-[#ff9aa2]">•</span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#30d158]/25 bg-[#30d158]/[0.06] p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#5ddb85] uppercase">
            <Wrench className="size-3.5" /> Ne düzeltildi
          </div>
          <p className="text-[12.5px] leading-relaxed">{c.fix}</p>
        </div>
      </div>

      {c.openIssue && (
        <div className="rounded-lg border border-[#ffd479]/30 bg-[#ffd479]/[0.07] p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#ffd479] uppercase">
            <ShieldCheck className="size-3.5" /> Neyin kapanmadığı
          </div>
          <p className="text-[12.5px] leading-relaxed">{c.openIssue}</p>
        </div>
      )}

      {c.quote && (
        <blockquote className="border-l-2 border-white/20 pl-3">
          <Quote className="text-muted-foreground mb-1 size-3.5" />
          <p className="text-[13px] leading-relaxed italic">“{c.quote.text}”</p>
          <footer className="text-muted-foreground mt-1 text-[11.5px]">— {c.quote.by}</footer>
        </blockquote>
      )}

      <div className="rounded-lg border bg-white/[0.03] p-4">
        <div className="text-muted-foreground mb-1.5 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
          Bu vaka ne öğretiyor
        </div>
        <p className="text-[15px] leading-snug font-medium">{c.lesson}</p>
      </div>

      <Section title={`Kaynaklar · bulan: ${c.finder}`}>
        <div className="flex flex-col gap-1.5">
          {c.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="bg-card/40 hover:bg-card/80 flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] transition-colors"
            >
              {s.primary && (
                <Badge variant="outline" className="shrink-0 font-normal">
                  birincil
                </Badge>
              )}
              <span className="min-w-0 flex-1">{s.label}</span>
              <ExternalLink className="text-muted-foreground size-3.5 shrink-0" />
            </a>
          ))}
        </div>
        {c.taxonomy && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.taxonomy.map((t) => (
              <span
                key={t}
                className="text-muted-foreground rounded border border-white/10 px-1.5 py-[2px] font-mono text-[10.5px]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Section>

      {(scenario || mod) && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {scenario && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => launch(scenario.id, 'vulnerable')}
              >
                Benzer senaryoyu çalıştır: {scenario.title}
                <ArrowRight className="size-3.5" />
              </Button>
            )}
            {mod && (
              <Button size="sm" variant="outline" onClick={() => openApp('academy')}>
                Akademi: {mod.title}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------------------- pencere -------------------------------- */

export function CasesWindow({ win }: { win: WindowState }) {
  const [selected, setSelected] = useState(CASES_DESC[0].id)
  const [year, setYear] = useState<number | null>(null)
  const [vector, setVector] = useState<string | null>(null)
  const [cls, setCls] = useState<'dolaylı' | 'doğrudan' | null>(null)

  const list = useMemo(
    () =>
      CASES_DESC.filter(
        (c) =>
          (year === null || c.year === year) &&
          (vector === null || c.vector === vector) &&
          (cls === null || c.cls === cls),
      ),
    [year, vector, cls],
  )

  const current = CASES_DESC.find((c) => c.id === selected) ?? list[0] ?? CASES_DESC[0]

  return (
    <Window
      id="cases"
      z={win.z}
      x={win.x}
      y={win.y}
      minimized={win.minimized}
      sidebar={
        <ScrollArea className="h-full w-[190px]">
          <div className="flex w-[190px] flex-col gap-1.5 p-2.5">
            <div className="text-muted-foreground px-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              Süz
            </div>
            <div className="flex flex-wrap gap-1">
              <Chip active={cls === null && year === null && vector === null} onClick={() => { setCls(null); setYear(null); setVector(null) }}>
                tümü
              </Chip>
              <Chip active={cls === 'dolaylı'} onClick={() => setCls(cls === 'dolaylı' ? null : 'dolaylı')}>
                dolaylı
              </Chip>
              <Chip active={cls === 'doğrudan'} onClick={() => setCls(cls === 'doğrudan' ? null : 'doğrudan')}>
                doğrudan
              </Chip>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {CASE_VECTORS.map((v) => (
                <Chip key={v} active={vector === v} onClick={() => setVector(vector === v ? null : v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex w-[190px] flex-col p-1.5">
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  'rounded-md px-2.5 py-2 text-left transition-colors',
                  current.id === c.id ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <i
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: CLASS_COLOR[c.cls] }}
                  />
                  <span className="text-muted-foreground font-mono text-[10px]">{c.whenLabel}</span>
                  {c.zeroClick && (
                    <span className="text-[9.5px] text-[#ff9aa2]" title="sıfır tık">
                      ●
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[12.5px] font-medium">{c.target}</div>
                <div className="text-muted-foreground truncate text-[11px]">
                  {c.alias ?? c.org}
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <p className="text-muted-foreground p-3 text-[12px]">Bu süzgeçle vaka yok.</p>
            )}
          </div>
        </ScrollArea>
      }
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="border-b p-4">
          <div className="flex gap-2">
            <Stat n={CASE_STATS.total} label="doğrulanmış vaka" />
            <Stat n={CASE_STATS.indirect} label="dolaylı enjeksiyon" />
            <Stat n={CASE_STATS.zeroClick} label="sıfır tık" />
            <Stat n={CASE_STATS.agentic} label="araç yetkisi vardı" />
            <Stat n={CASE_STATS.withCve} label="CVE kaydı var" />
          </div>
          <div className="mt-4 overflow-x-auto pb-1">
            <Timeline selected={current.id} onPick={setSelected} />
          </div>
          <p className="text-muted-foreground mt-3 max-w-[78ch] text-[11.5px] leading-relaxed">
            Buradaki her vaka gerçektir ve birincil kaynağı açılarak doğrulanmıştır: CVE kaydı,
            araştırmacının kendi yazısı veya hakemli yayın. Tarihler, sürüm numaraları ve alıntılar
            kaynaktaki hâliyle verilir. Hiçbir vaka çalışan bir saldırı şablonu içermez.
          </p>
        </div>

        <CaseDetail c={current} />
      </ScrollArea>
    </Window>
  )
}
