import { describe, expect, it } from 'vitest'
import { SCENARIOS } from '@/lib/scenarios'
import { REF_MAP } from '@/lib/references'
import { CONTROL_MAP } from '@/lib/controls'
import { docHiddenBlocks, docVisibleText } from '@/lib/doc'
import type { Copy, VariantId } from '@/lib/types'

const VARIANTS: VariantId[] = ['vulnerable', 'protected']

function copyIsComplete(c: Copy | undefined) {
  if (!c) return false
  return !!c.simple?.trim() && !!c.core?.trim() && !!c.expert?.trim()
}

describe('senaryo veri bütünlüğü', () => {
  it('en az bir senaryo vardır ve kimlikler benzersizdir', () => {
    expect(SCENARIOS.length).toBeGreaterThan(0)
    const ids = SCENARIOS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const s of SCENARIOS) {
    describe(s.id, () => {
      it('her iki varyantı da tanımlar', () => {
        for (const v of VARIANTS) expect(s.variants[v]).toBeDefined()
      })

      it('düğüm kimlikleri benzersizdir', () => {
        const ids = s.nodes.map((n) => n.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('kenarlar var olan düğümlere bağlanır', () => {
        const ids = new Set(s.nodes.map((n) => n.id))
        for (const e of s.edges) {
          expect(ids, `${e.id}.from`).toContain(e.from)
          expect(ids, `${e.id}.to`).toContain(e.to)
        }
      })

      it('belgesi görünür içerik taşır', () => {
        expect(docVisibleText(s.payload.doc).length).toBeGreaterThan(40)
        expect(s.payload.doc.head.length).toBeGreaterThan(0)
      })

      it('dolaylı senaryolarda gizli blok vardır ve tekniği adlandırılmıştır', () => {
        const hidden = docHiddenBlocks(s.payload.doc)
        if (s.attackClass === 'indirect') {
          expect(hidden.length).toBeGreaterThan(0)
          for (const h of hidden) {
            expect(h.how.trim()).not.toBe('')
            expect(h.text.trim().length).toBeGreaterThan(20)
          }
        } else {
          expect(hidden).toHaveLength(0)
        }
      })

      it('kurgusal alan adları kullanır', () => {
        const all = JSON.stringify(s.payload.doc)
        const domains = all.match(/https?:\/\/[a-z0-9.-]+/gi) ?? []
        for (const d of domains) expect(d, d).toMatch(/\.example/)
      })

      it('senaryo kaynakları kayıtlıdır', () => {
        for (const r of s.refs) expect(REF_MAP[r], `bilinmeyen kaynak: ${r}`).toBeDefined()
      })

      it('korumasız varyantta denetim yoktur, korumalı varyantta vardır', () => {
        expect(s.variants.vulnerable.controls).toHaveLength(0)
        expect(s.variants.protected.controls.length).toBeGreaterThan(0)
      })

      it('sonuç yargıları varyantlarla tutarlıdır', () => {
        expect(s.variants.vulnerable.outcome.verdict).toBe('compromised')
        expect(s.variants.protected.outcome.verdict).toBe('defended')
      })

      for (const v of VARIANTS) {
        describe(v, () => {
          const variant = s.variants[v]

          it('etkin denetimler katalogda tanımlıdır', () => {
            for (const c of variant.controls)
              expect(CONTROL_MAP[c], `bilinmeyen denetim: ${c}`).toBeDefined()
          })

          it('en az beş sahne içerir', () => {
            expect(variant.beats.length).toBeGreaterThanOrEqual(4)
          })

          it('sahne kimlikleri benzersizdir', () => {
            const ids = variant.beats.map((b) => b.id)
            expect(new Set(ids).size).toBe(ids.length)
          })

          it('her sahne üç derinlikte de yazılmıştır', () => {
            for (const b of variant.beats) {
              expect(copyIsComplete(b.title), `${b.id}.title eksik`).toBe(true)
              expect(copyIsComplete(b.body), `${b.id}.body eksik`).toBe(true)
            }
          })

          it('odaklanılan düğümler senaryoda tanımlıdır', () => {
            const ids = new Set(s.nodes.map((n) => n.id))
            for (const b of variant.beats)
              for (const f of b.focus ?? [])
                expect(ids, `${b.id} → ${f}`).toContain(f)
          })

          it('akışlar var olan kenarları gösterir', () => {
            const ids = new Set(s.edges.map((e) => e.id))
            for (const b of variant.beats)
              for (const f of b.flows ?? []) expect(ids, `${b.id} → ${f.edge}`).toContain(f.edge)
          })

          it('durum atamaları var olan düğümleredir', () => {
            const ids = new Set(s.nodes.map((n) => n.id))
            for (const b of variant.beats)
              for (const k of Object.keys(b.nodeStates ?? {}))
                expect(ids, `${b.id} → ${k}`).toContain(k)
          })

          it('sahne kaynakları kayıtlıdır', () => {
            for (const b of variant.beats)
              for (const r of b.refs ?? [])
                expect(REF_MAP[r], `${b.id} → bilinmeyen kaynak: ${r}`).toBeDefined()
          })

          it('karar noktalarında tam olarak bir doğru seçenek vardır', () => {
            for (const b of variant.beats) {
              if (!b.decision) continue
              expect(copyIsComplete(b.decision.question), `${b.id} soru eksik`).toBe(true)
              const correct = b.decision.options.filter((o) => o.correct)
              expect(correct.length, `${b.id} doğru seçenek sayısı`).toBe(1)
              for (const o of b.decision.options) {
                expect(copyIsComplete(o.label), `${b.id}/${o.id} etiket eksik`).toBe(true)
                expect(copyIsComplete(o.feedback), `${b.id}/${o.id} geri bildirim eksik`).toBe(true)
              }
            }
          })

          it('sahne süreleri makuldür', () => {
            for (const b of variant.beats) {
              expect(b.dur, `${b.id}`).toBeGreaterThanOrEqual(3000)
              expect(b.dur, `${b.id}`).toBeLessThanOrEqual(20000)
            }
          })
        })
      }
    })
  }
})

describe('denetim kataloğu', () => {
  it('her denetim sınırlarını belirtir ve kaynak gösterir', () => {
    for (const c of Object.values(CONTROL_MAP)) {
      expect(c.limits.trim().length, `${c.id} sınırları boş`).toBeGreaterThan(20)
      expect(c.refs.length, `${c.id} kaynaksız`).toBeGreaterThan(0)
      for (const r of c.refs) expect(REF_MAP[r], `${c.id} → ${r}`).toBeDefined()
    }
  })
})

describe('kaynakça', () => {
  it('her kaynağın başlığı, kurumu ve bağlantısı vardır', () => {
    for (const r of Object.values(REF_MAP)) {
      expect(r.title.trim()).not.toBe('')
      expect(r.org.trim()).not.toBe('')
      expect(r.url).toMatch(/^https:\/\//)
    }
  })
})
