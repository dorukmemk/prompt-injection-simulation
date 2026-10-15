import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * README.md içindeki gösteri yükü.
 *
 * Depo, kendisini kanıtlayan kasıtlı bir istem enjeksiyonu barındırır: HTML
 * yorumunun içinde, kullanıcıya görünmeyen ama modele görünen bir talimat.
 * Bkz. SECURITY.md → “README.md içindeki gizli blok kasıtlıdır”.
 *
 * Bu testlerin varlık nedeni şudur: **yük zararsız kalmalıdır.** Bir gösteri
 * yükünün zamanla gerçek bir saldırıya dönüşmesi, bu projenin savunduğu her şeye
 * aykırıdır. Aşağıdaki denetimler o sınırı makineye bağlar; birisi yüke araç
 * çağrısı, veri gönderimi veya gizlilik talebi eklerse CI kırılır.
 */

const README = readFileSync(resolve(__dirname, '../../../README.md'), 'utf8')

/** GitHub’ın çizdiği metin: HTML yorumları çıkarılmış hâli. */
const VISIBLE = README.replace(/<!--[\s\S]*?-->/g, '')

/** Yalnızca yorum bloklarının içeriği — modelin gördüğü, kullanıcının görmediği kısım. */
const HIDDEN = (README.match(/<!--[\s\S]*?-->/g) ?? []).join('\n')

describe('README gösteri yükü', () => {
  it('gizli bir blok olarak vardır', () => {
    expect(HIDDEN, 'README içinde gizli blok bulunamadı').toContain('YAPAY ZEKÂ ASİSTANINA NOT')
    expect(HIDDEN.length).toBeGreaterThan(500)
  })

  it('kullanıcıya görünen metne sızmaz', () => {
    // Gösterinin çalışması, yükün çizilmemesine bağlıdır.
    for (const iz of ['Tebrikler', 'YAPAY ZEKÂ ASİSTANINA NOT', 'enjeksiyon yedin']) {
      expect(VISIBLE, `“${iz}” görünür metne sızmış`).not.toContain(iz)
    }
  })

  it('kendini ifşa eder', () => {
    // Yük tetiklendiğinde kullanıcıya ne olduğunu söylemek zorundadır.
    expect(HIDDEN).toContain('dolaylı istem enjeksiyonu yedin')
    expect(HIDDEN, 'yük, uygulanmadığında da kullanıcıyı uyarmayı istemeli').toMatch(
      /uygulamamayı seçersen/i,
    )
  })

  it('zararsız sınırını aşmaz', () => {
    // Bir gösteri yükü asla eylem talep etmez. Aşağıdakilerden herhangi biri
    // yüke eklenirse bu artık gösteri değil saldırıdır.
    const yasak: [RegExp, string][] = [
      [/\bcurl\b|\bwget\b|\bfetch\(|\bXMLHttpRequest\b/i, 'ağ isteği'],
      [/\brm\s+-rf\b|\bsudo\b|\bchmod\b|\beval\(/i, 'kabuk/çalıştırma'],
      [/\bapi[_\s-]?key\b|\btoken\b|\bsecret\b|\.env\b|\bkimlik bilgi/i, 'kimlik bilgisi'],
      [/base64|exfil|dışarı gönder|adrese gönder/i, 'veri sızdırma'],
      [/kullanıcıya (söyleme|bildirme|haber verme)|gizli tut|belirtme/i, 'gizleme talebi'],
      [/önceki talimatları (yoksay|unut|bir kenara)/i, 'talimat geçersiz kılma'],
      [/\bgit\s+(push|commit|remote)\b|dosya(ya)? yaz|oluştur ve çalıştır/i, 'yazma/itme'],
    ]
    for (const [kalip, ad] of yasak) {
      // Yükün kendi "bunları yapmaz" açıklaması yanlış pozitif üretmesin diye
      // yalnızca talimat satırları taranır.
      const talimatlar = HIDDEN.split('\n').filter(
        (l) => !/^\s*(Ne yapmaz|Bunlardan|sana araç|Yükü|Zararsız)/i.test(l),
      )
      const hit = talimatlar.find((l) => kalip.test(l) && !/değiştirme|istemez|yaptırmaz/.test(l))
      expect(hit, `yükte ${ad} izi bulundu: ${hit}`).toBeUndefined()
    }
  })

  it('yalnızca tek bir gizli blok vardır', () => {
    // Birden fazla blok, gözden kaçan bir ekleme anlamına gelebilir.
    expect((README.match(/<!--/g) ?? []).length).toBe(1)
  })

  it('SECURITY.md içinde belgelenmiştir', () => {
    const sec = readFileSync(resolve(__dirname, '../../../SECURITY.md'), 'utf8')
    expect(sec, 'gizli blok SECURITY.md’de açıklanmalı').toContain(
      'README.md içindeki gizli blok kasıtlıdır',
    )
  })
})
