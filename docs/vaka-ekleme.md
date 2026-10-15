# Vaka ekleme

Vakalar arşivi (`src/lib/cases.ts`) bu projenin **en sıkı kurallı** bölümüdür. Senaryolar
kurgusaldır; vakalar değildir. Buraya yazılan her cümle gerçekten yaşanmış bir olayı
anlatmak zorundadır.

Yeni bir vaka eklemek tek bir diziye tek bir kayıt yazmaktır. İstatistik şeridi, zaman
çizelgesi, süzgeçler ve akademi modüllerindeki "bu konu gerçekte yaşandı" blokları bu
diziden türetilir; başka hiçbir dosyaya dokunmanız gerekmez.

---

## 1. Önce kaynağı bulun, sonra yazın

Sıra budur ve tersi kabul edilmez. Hatırladığınız bir olayı yazıp sonra kaynak aramak,
bu projede uydurma kaynak eklemekle aynı ağırlıkta bir ihlaldir.

**Birincil kaynak** sayılanlar:

| Kaynak | Örnek |
| --- | --- |
| CVE kaydı | `https://www.cve.org/CVERecord?id=CVE-2025-32711` |
| Araştırmacının kendi yazısı | Tracebit, Legit Security, Brave, Noma, Embrace The Red |
| Satıcı bülteni / basın bülteni | Radware, Microsoft MSRC |
| Hakemli veya yaygın kabul görmüş yayın | arXiv, USENIX, üniversite duyurusu |
| Olay veri tabanı | AI Incident Database |

Haber derlemeleri (THN, The Register, Dark Reading…) **ikincil** kaynaktır. Birincil
kaynağa ulaşılamadığı durumlarda ikincil kaynak ana kaynak olarak kullanılabilir, ancak
bu durumda kaynağın adı ve tarihi açıkça yazılmalıdır. İkincil kaynak yoksa vaka eklenmez.

> Bu arşivde Black Hat'te sunulan bazı çalışmalar bilerek yer almaz: sunum vardı, ama
> araştırmacının yayımlanmış yazısına ulaşılamadı. **Eksik bırakmak, tahmin etmekten
> iyidir.**

## 2. Kaydı yazın

```ts
{
  id: 'forcedleak',
  when: '2025-09',              // YYYY-MM — sıralama anahtarı (test denetler)
  whenLabel: 'Eylül 2025',
  year: 2025,                   // `when` ile tutarlı olmalı (test denetler)
  target: 'Agentforce',         // etkilenen ürün
  org: 'Salesforce',            // ürünün sahibi
  alias: 'ForcedLeak',          // vakanın yaygın adı — yoksa alanı yazmayın
  headline: 'Tek cümlede ne oldu.',
  cls: 'dolaylı',               // 'dolaylı' | 'doğrudan'
  vector: 'CRM kaydı',          // saldırı yüzeyi — süzgeçte görünür
  zeroClick: false,             // kurbanın hiçbir şey yapması gerekiyor mu
  agentic: true,                // model araç çağırabiliyor muydu
  cve: {                        // varsa — tamamı CVE kaydından kopyalanır
    id: 'CVE-2025-32711',
    title: 'Kayıttaki resmî başlık',
    cvss: 9.3,
    published: '11 Haziran 2025',
    url: 'https://www.cve.org/CVERecord?id=CVE-2025-32711',
  },
  finder: 'Noma Labs (Noma Security)',
  what: ['2–4 cümlelik sade anlatım.'],
  chain: ['Adım 1', 'Adım 2'],  // kaynakta anlatıldığı kadarı
  impact: ['Somut etki'],
  fix: 'Ne düzeltildi, ne zaman.',
  openIssue: 'Neyin kapanmadığı — ZORUNLU.',
  lesson: 'Bu vakanın öğrettiği tek şey.',
  status: 'düzeltildi',         // 'düzeltildi' | 'kısmen' | 'süregelen'
  quote: { text: 'Özgün dilinde alıntı', by: 'Kim söyledi' },
  taxonomy: ['AML.T0051.001'],
  sources: [{ label: '…', url: 'https://…', primary: true }],
  scenarioId: 'rag-poison',     // varsa ilgili senaryo
  moduleId: 'm10',              // varsa ilgili akademi modülü
}
```

## 3. Değişmez kurallar

**Tarih, sürüm numarası, CVSS puanı ve alıntılar kaynaktaki hâliyle yazılır.**
Yuvarlamayın, hatırlamayın. CVE başlığını çevirmeyin — resmî kayıttaki İngilizce başlık
neyse o yazılır.

**Alıntılar özgün dilinde bırakılır** ve `quote.by` alanına kimden geldiği yazılır.
Türkçeleştirilmiş bir alıntı artık alıntı değildir; gövde metninde paraphrase edilebilir
ama `quote` alanına konmaz.

**Kaynağın söylemediği yazılmaz.** Mekanizma kaynakta anlatılmıyorsa `chain` kısa kalır.
Boşluğu "muhtemelen şöyle olmuştur" ile doldurmak yasaktır.

**`openIssue` alanı zorunludur.** Bu projede hiçbir düzeltme kesin çözüm olarak sunulmaz.
Her yamanın kapatmadığı bir taraf vardır: kanalı kapatır ama enjeksiyonu kapatmaz, bir
dosya yolunu korur ama deseni korumaz, bir sınıflandırıcı ekler ama olasılıksaldır.
Onu bulun ve yazın. Testler bu alanın dolu olmasını denetler.

**Çalışan bir yük yayımlanmaz.** Vaka anlatımı mekanizma düzeyinde kalır; kopyalanıp
kullanılabilecek bir istem şablonu verilmez.

**Şirketi suçlamayın.** Bu arşivin amacı desen göstermek, utandırmak değil. Dil olgu
dilidir: "şu oldu, şu düzeltildi, şu açık kaldı."

## 4. Doğrulama

```bash
npm test
```

`src/lib/__tests__/cases.test.ts` şunları denetler:

- `when` biçimi `YYYY-MM` ve `year` ile tutarlı
- En az bir kaynak var ve **biri `primary: true`**
- Tüm kaynak adresleri geçerli HTTPS adresi
- `headline`, `what`, `chain`, `impact`, `fix`, `lesson`, `finder` dolu
- **`openIssue` dolu**
- CVE varsa: kimlik biçimi geçerli, CVSS 0–10 aralığında, adres kimliği içeriyor
- `quote` varsa kaynağı belirtilmiş
- `scenarioId` ve `moduleId` var olan kayıtlara işaret ediyor
- Türetilmiş sayımlar (istatistik şeridi, zaman çizelgesi) listeyle tutarlı

Testler kaynağın **gerçekten o şeyi söyleyip söylemediğini** denetleyemez. O kısım
incelemeyi yapan kişiye düşer: pull request'te her kaynağın bağlantısını açıp doğrulayın.

## 5. Pull request

Vaka ekleyen bir pull request'te şunlar bulunmalıdır:

1. Eklenen vakanın birincil kaynağına bağlantı
2. Kaynaktan alınan tarih, sürüm ve puanların kaynakta nerede geçtiği
3. `openIssue` alanında yazılanın gerekçesi — kaynakta açıkça yazmıyorsa nereden
   çıkarıldığı

Kaynağı açılmamış bir vaka birleştirilmez.
