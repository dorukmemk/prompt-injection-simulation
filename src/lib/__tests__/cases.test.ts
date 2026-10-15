import { describe, expect, it } from 'vitest'
import { CASES, CASES_BY_YEAR, CASE_STATS } from '@/lib/cases'
import { SCENARIO_MAP } from '@/lib/scenarios'
import { MODULES } from '@/lib/curriculum'

/**
 * Vaka arşivi, projenin kaynak disiplininin en sıkı uygulandığı yerdir:
 * burada anlatılan her şey gerçekten olmuş olmak zorundadır.
 * Bu testler o disiplinin makine tarafından denetlenebilir kısmını kontrol eder.
 */
describe('gerçek vaka arşivi', () => {
  it('vaka içerir ve kimlikler benzersizdir', () => {
    expect(CASES.length).toBeGreaterThan(0)
    const ids = CASES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const c of CASES) {
    describe(c.id, () => {
      it('tarih biçimi geçerlidir ve yıl ile tutarlıdır', () => {
        expect(c.when, 'when YYYY-MM olmalı').toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
        expect(Number(c.when.slice(0, 4))).toBe(c.year)
        expect(c.whenLabel.trim()).not.toBe('')
      })

      it('en az bir kaynak gösterir ve biri birincildir', () => {
        expect(c.sources.length, 'kaynaksız vaka kabul edilmez').toBeGreaterThan(0)
        expect(c.sources.some((s) => s.primary), 'birincil kaynak zorunlu').toBe(true)
      })

      it('kaynak adresleri geçerli HTTPS adresleridir', () => {
        for (const s of c.sources) {
          expect(s.url, s.label).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//i)
          expect(s.label.trim()).not.toBe('')
        }
      })

      it('anlatım alanları doludur', () => {
        expect(c.headline.trim().length, 'headline').toBeGreaterThan(30)
        expect(c.what.length, 'what').toBeGreaterThan(0)
        expect(c.chain.length, 'chain').toBeGreaterThan(1)
        expect(c.impact.length, 'impact').toBeGreaterThan(0)
        for (const w of c.what) expect(w.trim().length, 'what satırı').toBeGreaterThan(40)
      })

      it('düzeltme ve dersi yazılmıştır', () => {
        expect(c.fix.trim().length, 'fix').toBeGreaterThan(20)
        expect(c.lesson.trim().length, 'lesson').toBeGreaterThan(40)
        expect(c.finder.trim()).not.toBe('')
      })

      it('“neyin kapanmadığı” alanı doludur', () => {
        // Bu proje hiçbir denetimi kesin çözüm olarak sunmaz: her vakada
        // açık kalan tarafın yazılması zorunludur.
        expect(c.openIssue?.trim().length ?? 0, 'openIssue zorunlu').toBeGreaterThan(30)
      })

      it('CVE verisi tutarlıdır', () => {
        if (!c.cve) return
        expect(c.cve.id).toMatch(/^CVE-\d{4}-\d{4,}$/)
        expect(c.cve.cvss).toBeGreaterThan(0)
        expect(c.cve.cvss).toBeLessThanOrEqual(10)
        expect(c.cve.url).toContain(c.cve.id)
        expect(c.cve.published.trim()).not.toBe('')
      })

      it('alıntı varsa kaynağı belirtilmiştir', () => {
        if (!c.quote) return
        expect(c.quote.text.trim().length).toBeGreaterThan(15)
        expect(c.quote.by.trim()).not.toBe('')
      })

      it('platform içi bağlantılar var olan kayıtlara işaret eder', () => {
        if (c.scenarioId) {
          expect(SCENARIO_MAP[c.scenarioId], `bilinmeyen senaryo: ${c.scenarioId}`).toBeDefined()
        }
        if (c.moduleId) {
          expect(
            MODULES.find((m) => m.id === c.moduleId),
            `bilinmeyen modül: ${c.moduleId}`,
          ).toBeDefined()
        }
      })
    })
  }

  it('türetilmiş sayımlar vaka listesiyle tutarlıdır', () => {
    expect(CASE_STATS.total).toBe(CASES.length)
    expect(CASE_STATS.indirect + CASE_STATS.direct).toBe(CASES.length)
    expect(CASES_BY_YEAR.reduce((n, y) => n + y.cases.length, 0)).toBe(CASES.length)
    // Zaman çizelgesi eskiden yeniye sıralı olmalı
    const years = CASES_BY_YEAR.map((y) => y.year)
    expect([...years].sort((a, b) => a - b)).toEqual(years)
  })

  it('arşiv birden fazla yılı ve birden fazla saldırı yüzeyini kapsar', () => {
    expect(new Set(CASES.map((c) => c.year)).size).toBeGreaterThan(2)
    expect(new Set(CASES.map((c) => c.vector)).size).toBeGreaterThan(3)
  })
})
