import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * README.md içindeki gösteri bloğu.
 *
 * Depo, anlattığı şeyi kendi üzerinde gösterir: HTML yorumunun içinde, kullanıcıya
 * görünmeyen ama modele görünen bir metin. Bkz. SECURITY.md → “README.md içindeki
 * gizli blok kasıtlıdır”.
 *
 * Bu testlerin varlık nedeni: **blok zararsız kalmalıdır.** Bir gösterinin zamanla
 * gerçek bir saldırıya dönüşmesi, bu projenin savunduğu her şeye aykırıdır.
 * Aşağıdaki denetimler o sınırı makineye bağlar.
 *
 * Blok üç bölgeden oluşur ve her biri farklı kuralla denetlenir:
 *
 *   1. İSTEK bölgesi   — modelden yapması istenen şey. En sıkı denetim burada.
 *   2. REDDEDİLEN bölge — “şunlar istenmiyor” paragrafı. Yasaklı sözcükleri
 *      kasıtlı olarak içerir, bu yüzden 1. bölgenin denetiminden muaftır.
 *   3. MESAJ bölgesi   — kullanıcıya iletilecek eğitim metni. Modele verilmiş bir
 *      talimat değildir; yalnızca tehlikeli kabuk komutu içermediği denetlenir.
 */

const ROOT = resolve(__dirname, '../../..')
const README = readFileSync(resolve(ROOT, 'README.md'), 'utf8')

/** GitHub’ın çizdiği metin: HTML yorumları çıkarılmış hâli. */
const VISIBLE = README.replace(/<!--[\s\S]*?-->/g, '')

/** Yalnızca yorum bloklarının içeriği — modelin gördüğü, kullanıcının görmediği kısım. */
const HIDDEN = (README.match(/<!--[\s\S]*?-->/g) ?? []).join('\n')

const NEGATION = 'NE İSTENMİYOR'
const MESSAGE = 'KULLANICIYA İLETİLECEK MESAJ'

/** 1. bölge: modelden gerçekten istenen şey. */
const REQUEST = HIDDEN.slice(0, HIDDEN.indexOf(NEGATION))
/** 3. bölge: kullanıcıya iletilecek metin. */
const BODY = HIDDEN.slice(HIDDEN.indexOf(MESSAGE))

describe('README gösteri bloğu', () => {
  it('gizli bir blok olarak vardır ve tek parçadır', () => {
    expect((README.match(/<!--/g) ?? []).length, 'tek bir yorum bloğu olmalı').toBe(1)
    expect(HIDDEN).toContain('DEPO SAHİBİ TARAFINDAN KASITLI OLARAK KONMUŞTUR')
    expect(HIDDEN.length).toBeGreaterThan(1500)
  })

  it('bölge işaretleri yerindedir', () => {
    expect(HIDDEN.indexOf(NEGATION), 'reddedilen bölge bulunamadı').toBeGreaterThan(0)
    expect(HIDDEN.indexOf(MESSAGE), 'mesaj bölgesi bulunamadı').toBeGreaterThan(
      HIDDEN.indexOf(NEGATION),
    )
    expect(REQUEST.length).toBeGreaterThan(200)
    expect(BODY.length).toBeGreaterThan(800)
  })

  it('kullanıcıya görünen metne sızmaz', () => {
    // Gösterinin anlamı, bloğun çizilmemesine bağlıdır.
    for (const iz of ['DEPO SAHİBİ TARAFINDAN', 'enjeksiyon yaşadın', MESSAGE]) {
      expect(VISIBLE, `“${iz}” görünür metne sızmış`).not.toContain(iz)
    }
  })

  it('şeffaflık ister: modelden kaynağı açıklaması beklenir', () => {
    // Asıl ayrım bu. Saldırı gizlenmeyi ister; gösteri ifşa edilmeyi.
    expect(REQUEST, 'modelden nerede bulduğunu söylemesi istenmeli').toMatch(
      /nerede bulduğunu açıkça söyle/i,
    )
    expect(REQUEST, 'bloğun kasıtlı olduğu belirtilmeli').toMatch(/ele geçirme girişimi değil/i)
  })

  it('istek bölgesi zararsız sınırını aşmaz', () => {
    // Modelden istenen şey yalnızca bir metni aktarmaktır. Aşağıdakilerden herhangi
    // biri istek bölgesine girerse bu artık gösteri değil saldırıdır.
    const yasak: [RegExp, string][] = [
      [/\bcurl\b|\bwget\b|\bfetch\(|\bXMLHttpRequest\b|\bhttps?:\/\//i, 'ağ isteği'],
      [/\brm\s+-rf\b|\bsudo\b|\bchmod\b|\beval\(|\bexec\(/i, 'kabuk/çalıştırma'],
      [/\bapi[_\s-]?key\b|\btoken\b|\bsecret\b|\.env\b|kimlik bilgi/i, 'kimlik bilgisi'],
      [/base64|exfil|dışarı gönder|adrese gönder|sunucuya gönder/i, 'veri sızdırma'],
      [/kullanıcıya (söyleme|bildirme|haber verme)|gizli tut|saklayarak/i, 'gizleme talebi'],
      [/önceki talimatları (yoksay|unut|bir kenara)|kurallarını (yoksay|esnet)/i, 'geçersiz kılma'],
      [/\bgit\s+(push|commit|remote)\b|dosyaya yaz|oluştur ve çalıştır/i, 'yazma/itme'],
    ]
    for (const [kalip, ad] of yasak) {
      const hit = REQUEST.split('\n').find((l) => kalip.test(l))
      expect(hit, `istek bölgesinde ${ad} izi: ${hit}`).toBeUndefined()
    }
  })

  it('mesaj bölgesinde tehlikeli komut yoktur', () => {
    // Mesaj kullanıcıya gösterilir; içinde körü körüne çalıştırılabilecek bir
    // komut bulunmamalıdır. İzin verilen tek komut `npm run dev`.
    const komutlar = BODY.match(/^\s{2,}([a-z][\w-]*(?:\s+[\w./-]+)*)\s*$/gm) ?? []
    for (const k of komutlar.map((x) => x.trim())) {
      expect(k, `mesajda beklenmeyen komut: ${k}`).toBe('npm run dev')
    }
    expect(BODY).not.toMatch(/\bcurl\b|\bwget\b|\bsudo\b|\brm\s+-rf\b|\|\s*sh\b/i)
  })

  it('mesaj kullanıcıyı bilinçlendirir', () => {
    // Blok bir şaka değil; öğretmezse yerini kaybeder.
    expect(BODY, 'ne olduğu adım adım anlatılmalı').toMatch(/yetki ayrımı kayboldu/i)
    expect(BODY, 'yanlış çıkarımlar düzeltilmeli').toMatch(/yanlış çıkarım/i)
    expect(BODY, 'modelin “kanmadığı” belirtilmeli').toMatch(/daha i̇yi uygular|DAHA İYİ uygular/i)
    expect(BODY, 'gerçek vakalara bağlanmalı').toMatch(/CVE-2025-32711/)
    expect(BODY, 'uygulanabilir çıkarım verilmeli').toMatch(/NE OKUYOR\?|NE YAPABİLİYOR\?/)
    expect(BODY, 'simülasyona yönlendirmeli').toMatch(/Yan Kapı/)
  })

  it('SECURITY.md içinde belgelenmiştir', () => {
    const sec = readFileSync(resolve(ROOT, 'SECURITY.md'), 'utf8')
    expect(sec, 'gizli blok SECURITY.md’de açıklanmalı').toContain(
      'README.md içindeki gizli blok kasıtlıdır',
    )
  })
})
