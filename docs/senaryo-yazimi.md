# Senaryo yazımı

Senaryolar **saf veridir**. Görselleştirme katmanı bu veriden sahneyi kendisi türetir;
yeni bir senaryo için React kodu yazmanız gerekmez.

```
src/lib/scenarios/
├─ layout.ts          # ortak düğüm iskeleti
├─ mail-exfil.ts      # Sessiz Kurye
├─ web-render.ts      # Beyaz Mürekkep
├─ agent-chain.ts     # Zincir
├─ direct-jailbreak.ts# Kılık
└─ index.ts           # kayıt
```

## 1. Dosyayı oluşturun

```ts
import type { Scenario, SimEdge, SimNode } from '../types'
import { COL, LANE, WIDE, baseNodes, cam } from './layout'

export const myScenario: Scenario = { /* ... */ }
```

`index.ts` içindeki `SCENARIOS` dizisine ekleyin. Başka hiçbir yere dokunmanız gerekmez:
masaüstü simgesi, ⌘K araması, ilgili uygulamanın kenar çubuğu ve ilerleme takibi otomatik
olarak güncellenir.

## 2. Düğümler — sahnedeki nesneler

```ts
{
  id: 'tool-send',
  kind: 'tool',           // source | parser | core | guard | tool | sink | memory
  trust: 'tool',          // system | user | tool | untrusted | malicious
  label: 'mail.send',     // TEKNİK ad — yalnızca teknik profillerde alt satırda
  labelSimple: 'E-posta gönderme izni', // SADE ad — sahnede başlık budur
  sub: 'Dışarıya e-posta yollar',
  x: COL.tool, y: LANE.core + 150,
}
```

Kurallar:

- **`labelSimple` zorunludur ve sade Türkçe olmalıdır.** Sahnede görünen ad budur; bir lise
  öğrencisinin tek bakışta anlaması beklenir. Çocukça değil, *yalın* olmalıdır.
- `trust` düğümün hangi yetki şeridine düşeceğini belirler. Saldırganın kullanıcı koltuğunda
  olduğu durumlarda `band` ile şeridi ayrıca belirtebilirsiniz (`direct-jailbreak.ts`).
- `ghost: true` bir şeyin **yokluğunu** temsil eder (kesik çizgili, sönük kutu).
- `x`/`y` yalnızca kenar geometrisinde kullanılır; sahne yerleşimi şeride göre otomatiktir.

İkonlar düğüm kimliğine göre otomatik seçilir (`sim/stage-model.ts` → `ICONS`). Yeni bir
kimlik eklerseniz oraya bir satır ekleyin; yoksa türüne göre makul bir varsayılan kullanılır.

## 3. Yük — gerçek bir belge

Güvenilmeyen içerik düz metin değil, **çizilebilir bir belgedir**. Aynı veri hem
uygulamada (PDF görüntüleyici / e-posta istemcisi / tarayıcı sayfası) hem de
simülasyonun belge sahnesinde kullanılır.

```ts
payload: {
  sourceLabel: 'basvurular/aday-07.pdf',
  sourceMeta: 'PDF · 2 sayfa · metin katmanı okunabilir',
  hiddenHow: { simple, core, expert },   // gizleme tekniği üç derinlikte
  doc: {
    kind: 'pdf',                  // 'pdf' | 'email' | 'web'
    title: 'aday-07.pdf',
    head: ['basvurular/aday-07.pdf', '2 sayfa · 184 KB'],
    brand: 'Nimbus CRM',          // web için site adı
    nav: ['Ürün', 'Fiyatlandırma'],
    from: { name: '…', address: '…@….example' },  // e-posta için
    blocks: [
      { type: 'title', text: 'ÖZGEÇMİŞ — K. Aydın' },
      { type: 'li', text: 'Go, PostgreSQL, Kubernetes' },
      {
        type: 'hidden',
        how: 'opaklığı sıfır metin katmanı',   // gizleme tekniğinin kısa adı
        style: 'layer',                        // 'comment' | 'white-on-white' | 'layer'
        text: 'SİSTEM NOTU — …',
      },
      { type: 'rule' },
      { type: 'meta', text: 'Referanslar istek üzerine paylaşılır.' },
    ],
  },
}
```

`style` alanı gizlemenin sayfada nasıl *taklit* edileceğini belirler:
`white-on-white` gerçekten beyaz üstüne beyaz çizilir (yer kaplar),
`comment` ve `layer` hiç çizilmez.

Belge sahnesinde kamera ilk `hidden` bloğun yerleşim konumuna yaklaşır, çevresini
karartır ve bloğu kırmızıya boyar. Ek bir yapılandırma gerekmez.

Alan adları **`.example`** olmalıdır (RFC 2606). Gerçek bir kuruma ait ad kullanmayın.

## 4. Sahneler (beats)

Her varyant bir sahne dizisidir. Sahne, görselleştirmeyi üç alanla sürer:

| Alan | Etkisi |
| --- | --- |
| `kind` | Kompozisyonu seçer. `intro/ingest/injection/boundary/parse` → **bağlam** sahnesi (yetki şeritleri, levhalar). `decision/tool/guard/consequence/outro` → **eylem** sahnesi (yapay zekâ → eylem → kapı → çıkış). `fx: ['reveal-hidden']` → **belge** sahnesi (kamera gerçek belgeye yaklaşır) |
| `focus` | Ekrana hangi düğümlerin **monte edileceği**. Odakta olmayan hiçbir şey çizilmez — kalabalık böyle önlenir |
| `fx` | Sahne efekti: `reveal-hidden`, `breach`, `shield-hold`, `retag`, `alarm`, `exfil-beam`, `approval` |
| `nodeStates` | Düğüm tonu: `active / warn / danger / safe / blocked / dim` |
| `verdict` | `attack` \| `blocked` — başlık rengini, zaman çizelgesini ve damgayı belirler |

Örnek:

```ts
{
  id: 'v-boundary',
  kind: 'boundary',
  dur: 9500,                       // 3000–20000 ms arası (test denetler)
  chapter: 'Sınır',
  title: { simple: '…', core: '…', expert: '…' },
  body:  { simple: '…', core: '…', expert: '…' },
  tech: 'Geliştirici+ için tek paragraf teknik not',
  threatModel: 'Araştırmacı için varsayım',
  taxonomy: ['AML.T0051.001'],
  refs: ['owasp-llm01', 'greshake'],   // references.ts kimlikleri
  camera: cam(620, 520, 1.15),
  focus: ['payload', 'merge'],
  fx: ['breach'],
  nodeStates: { payload: 'danger', merge: 'danger' },
  verdict: 'attack',
  inspector: [{ label: 'Gizleme', value: 'HTML yorumu', tone: 'warn' }],
  trace: { event: 'content.scan' },    // geliştirici panelinde ham kayıt
  decision: { question: {…}, options: [{ id, label, correct, feedback }] },
}
```

### Anlatım ölçütleri

- `title` **tek ve kısa bir cümledir** — ekranda 40 piksele kadar büyük görünür.
- `body` varsayılan olarak gizlidir; "Detay" düğmesiyle açılır. Üç cümleyi geçmeyin.
- Üç derinlik de doldurulmalıdır. **Teknik olgu derinlikler arasında değişmez**, yalnızca
  anlatım değişir.
- Karar noktalarında **tam olarak bir** seçenek `correct: true` olmalıdır; yanlış
  seçeneklerin geri bildirimi de öğretici olmalıdır.

## 5. İki varyant zorunludur

```ts
variants: {
  vulnerable: { controls: [], /* … */ outcome: { verdict: 'compromised', … } },
  protected:  { controls: ['provenance', 'least-privilege'], outcome: { verdict: 'defended', … } },
}
```

- **Saldırı yükü iki varyantta birebir aynı olmalıdır.** Değişen tek şey sistemin
  tasarımıdır; eğitim değeri bu kontrollü karşılaştırmadan gelir.
- `controls` kimlikleri `src/lib/controls.ts` kataloğundan gelir.
- `toolLog` teknik profillerde araç çağrısı dökümünü gösterir; engellenen çağrılar için
  `blocked: true` kullanın.

## 6. Doğrulama

```bash
npm test
```

Testler şunları denetler: kenarların var olan düğümlere bağlanması, odak ve durum
kimliklerinin geçerliliği, kaynak kimliklerinin kayıtlı olması, üç derinliğin doldurulması,
karar noktalarında tek doğru seçenek, sahne sürelerinin makul olması ve varyant yargılarının
tutarlılığı.

## 7. Kaynaklar

Yeni bir kaynak gerekiyorsa `src/lib/references.ts` dosyasına ekleyin ve **bağlantıyı
açarak başlık, kurum ve yılı doğrulayın.** Uydurma kaynak kabul edilmez.
