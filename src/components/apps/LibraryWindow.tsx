import { ExternalLink } from 'lucide-react'
import { REFERENCES } from '@/lib/references'
import { CONTROLS } from '@/lib/controls'
import { GLOSSARY } from '@/lib/glossary'
import { TRUST_META } from '@/lib/trust'
import { tp } from '@/lib/copy'
import { useProfile, type WindowState } from '@/store/useApp'
import { Window } from '@/components/shell/Window'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const REF_TONE: Record<string, string> = {
  standart: '#6ea8ff',
  taksonomi: '#ffd479',
  akademik: '#a78bfa',
  olay: '#ff453a',
  kilavuz: '#30d5c8',
}

export function LibraryWindow({ win }: { win: WindowState }) {
  const profile = useProfile()

  return (
    <Window id="library" z={win.z} x={win.x} y={win.y} minimized={win.minimized}>
      <Tabs defaultValue="sozluk" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="shrink-0 border-b px-3 py-2">
          <TabsList>
            <TabsTrigger value="sozluk">Sözlük</TabsTrigger>
            <TabsTrigger value="denetim">Denetimler</TabsTrigger>
            <TabsTrigger value="kaynak">Kaynaklar</TabsTrigger>
            <TabsTrigger value="yontem">Yöntem</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sozluk" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2.5 p-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TRUST_META) as (keyof typeof TRUST_META)[]).map((k) => (
                  <div
                    key={k}
                    className="bg-card/50 flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: TRUST_META[k].color }}
                    />
                    <span className="text-[12px]">
                      {profile.id === 'explorer' ? TRUST_META[k].labelSimple : TRUST_META[k].label}
                    </span>
                  </div>
                ))}
              </div>
              {GLOSSARY.map((g) => (
                <Card key={g.term} className="gap-2 py-3">
                  <CardHeader className="px-3">
                    <CardTitle className="text-[13.5px]">{g.term}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground px-3 text-[12.5px] leading-relaxed">
                    {tp(g, profile)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="denetim" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2.5 p-4">
              {CONTROLS.map((c) => (
                <Card key={c.id} className="gap-2 py-3">
                  <CardHeader className="px-3">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-[13.5px]">
                      {c.glyph} {c.name}
                      {c.owasp && (
                        <Badge variant="outline" className="font-normal">
                          OWASP
                        </Badge>
                      )}
                      {c.atlas && (
                        <Badge variant="outline" className="font-normal">
                          {c.atlas.split(' ')[0]}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 px-3 text-[12.5px] leading-relaxed">
                    <p>{tp(c.short, profile)}</p>
                    <p className="text-muted-foreground">{tp(c.how, profile)}</p>
                    <div className="rounded-md border border-[#ffd479]/30 bg-[#ffd479]/8 p-2.5">
                      <div className="mb-1 text-[10.5px] font-semibold tracking-wide text-[#ffd479] uppercase">
                        Sınırlar
                      </div>
                      <p className="text-muted-foreground">{c.limits}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="kaynak" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 p-4">
              {REFERENCES.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bg-card/40 hover:bg-card/80 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{ color: REF_TONE[r.kind], borderColor: `${REF_TONE[r.kind]}55` }}
                    >
                      {r.kind}
                    </Badge>
                    <span className="text-muted-foreground text-[11.5px]">
                      {r.org} · {r.year}
                    </span>
                    <ExternalLink className="text-muted-foreground ml-auto size-3.5" />
                  </div>
                  <h3 className="mt-1.5 text-[13px] font-semibold">{r.title}</h3>
                  <p className="text-muted-foreground mt-1 text-[12px] leading-relaxed">{r.note}</p>
                </a>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="yontem" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2.5 p-4">
              {[
                {
                  t: 'Ne gösterir?',
                  b: 'Belgelenmiş saldırı mekanizmaları, güven sınırları, araç çağrısı yüzeyleri ve güvenlik denetimlerinin eğitim amaçlı temsilî modeli.',
                },
                {
                  t: 'Ne göstermez?',
                  b: 'Bir modelin gerçek, özel düşünce zincirini göstermez. “Karar çekirdeği” ve “kapılar” mimari bileşenlerin birebir karşılığı değildir.',
                },
                {
                  t: 'Belirlenimci simülasyon',
                  b: 'Senaryolar canlı modele sorulmaz; her biri elle yazılmış, doğrulanmış bir olay dizisidir. Mimari canlı model entegrasyonuna açıktır.',
                },
                {
                  t: 'Güvenli örneklem',
                  b: 'Tüm adresler, dosyalar ve kişiler kurgusaldır (.example). Jailbreak senaryosunda çalışan bir şablon gösterilmez.',
                },
                {
                  t: 'Lisans',
                  b: 'MIT. Kaynaksız teknik iddia kabul edilmez; katkı kuralları için depodaki CONTRIBUTING.md.',
                },
              ].map((s) => (
                <Card key={s.t} className="gap-2 py-3">
                  <CardHeader className="px-3">
                    <CardTitle className="text-[13.5px]">{s.t}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground px-3 text-[12.5px] leading-relaxed">
                    {s.b}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Window>
  )
}
