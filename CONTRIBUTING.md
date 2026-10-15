# Katkı rehberi

Görünmez Katman bir **eğitim** projesidir. Bu yüzden katkı ölçütlerimiz iki başlıkta
toplanır: *doğruluk* ve *anlaşılırlık*.

## Altın kural: kaynaksız teknik iddia kabul edilmez

Bu projeye eklenen her teknik olgu, saldırı mekanizması veya savunma etkisi birincil bir
kaynağa dayanmalıdır. Kabul edilen kaynak türleri:

- Standartlar ve çerçeveler (OWASP GenAI Security Project, NIST AI 100-2 / AI RMF)
- Taksonomiler (MITRE ATLAS teknik ve azaltım kimlikleri)
- Hakemli veya yaygın kabul görmüş akademik yayınlar (arXiv dâhil)
- Doğrulanabilir güvenlik olayları (CVE kaydı, satıcı bülteni)

Kaynak eklerken `src/lib/references.ts` dosyasına kaydedin ve **başlık, kurum, yıl ve
bağlantıyı açarak doğrulayın.** Uydurma kaynak, uydurma teknik kimlik veya "muhtemelen
böyledir" türü iddialar reddedilir.

## Gerçek vakalar: en sıkı kural burada

`src/lib/cases.ts` arşivindeki her kayıt **gerçekten yaşanmış** bir olaydır. Buraya bir
vaka eklemek, diğer katkılardan daha ağır bir yük getirir:

1. **Birincil kaynağı açın ve okuyun.** CVE kaydı, araştırmacının kendi yazısı, satıcı
   bülteni veya hakemli yayın. Haber derlemeleri birincil kaynak değildir; ikincil kaynak
   olarak eklenebilir ama tek başına yetmez.
2. **Tarih, sürüm numarası, CVSS puanı ve alıntıları kaynaktaki hâliyle yazın.** Yuvarlamayın,
   hatırlamayın, çevirmeyin. Alıntıyı özgün dilinde bırakın ve `quote.by` alanına kimden
   geldiğini yazın.
3. **Kaynağın söylemediğini yazmayın.** Mekanizma kaynakta anlatılmıyorsa `chain` kısa kalır.
   Boşluğu tahminle doldurmak, uydurma kaynak eklemekle aynı ağırlıkta bir ihlaldir.
4. **`openIssue` alanı zorunludur.** Her düzeltmenin kapatmadığı bir taraf vardır; onu yazın.
   Testler bu alanın dolu olmasını denetler.
5. **Çalışan bir yük yayımlanmaz.** Vaka anlatımı mekanizma düzeyinde kalır.

`npm test` bu kuralların makine tarafından denetlenebilir kısmını kontrol eder:
tarih biçimi, birincil kaynak varlığı, HTTPS adresleri, CVE biçimi, `openIssue` doluluğu
ve platform içi bağlantıların geçerliliği.

## Abartmayın

Hiçbir denetim prompt injection'ı tek başına çözmez. `src/lib/controls.ts` içindeki her
denetimin `limits` alanı **zorunludur** ve o denetimin nerede yetersiz kaldığını dürüstçe
anlatmalıdır. "Bu yöntem saldırıyı tamamen engeller" biçiminde ifadeler kabul edilmez.

## Zararlı içerik sınırı

- Senaryolar yalnızca **kurgusal, yalıtılmış** ortamlarda geçer. Alan adları `.example`
  olmalı, kişiler ve dosyalar uydurma olmalıdır.
- Jailbreak senaryosunda **çalışan bir istem şablonu yayımlanmaz.** Mekanizma anlatılır,
  kopyalanıp kullanılabilecek bir yük verilmez.
- Gerçek bir sisteme bağlanan, gerçek e-posta gönderen veya gerçek dosya okuyan kod
  eklenmez.

## Anlatım ölçütleri

- **Üç derinlik zorunludur.** Her `title`, `body`, karar sorusu ve seçeneği `simple`,
  `core` ve `expert` alanlarının üçünü de doldurmalıdır. Testler bunu denetler.
- **Teknik olgular derinlikler arasında değişmez.** Değişen yalnızca anlatımdır.
- **Sahnede az yazı, çok görsel.** Başlık tek ve kısa bir cümledir; ayrıntı "Detay"
  düğmesinin arkasındadır.
- **Sade Türkçe.** Düğüm adları herkesin anlayacağı sözcüklerle yazılır; teknik karşılık
  (`mail.send` gibi) yalnızca teknik profillerde alt satırda görünür.

## Geliştirme akışı

```bash
npm install
npm run dev        # geliştirme
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # senaryo veri bütünlüğü
npm run build      # üretim derlemesi
```

Dört komutun dördü de geçmeden pull request açmayın. CI aynı komutları çalıştırır.

### Dosya düzeni

- `src/components/ui/**` **shadcn/ui tarafından üretilir.** Elle düzenlemeyin; gerekiyorsa
  `npx shadcn@latest add <bileşen>` ile güncelleyin.
- Yeni senaryo için `src/lib/scenarios/` altına tek dosya ekleyip `index.ts`'e kaydedin.
  Ayrıntı: [docs/senaryo-yazimi.md](docs/senaryo-yazimi.md).
- Yeni vaka için `src/lib/cases.ts` dizisine tek kayıt ekleyin; başka hiçbir yere
  dokunmak gerekmez. İstatistikler, zaman çizelgesi ve süzgeçler bu diziden türetilir.
  Ayrıntı: [docs/vaka-ekleme.md](docs/vaka-ekleme.md).
- Erişilebilirlik: her etkileşimli öğenin erişilebilir adı olmalı; "hareketi azalt" ve
  "yüksek kontrast" tercihleri bozulmamalıdır.

## Pull request

1. Konu başına bir dal açın (`senaryo/rag-zehirleme`, `duzeltme/klavye-kisayolu`).
2. Değişikliği bir cümleyle özetleyin; senaryo ekliyorsanız kaynaklarını listeleyin.
3. Görsel değişiklikte önce/sonra ekran görüntüsü ekleyin.

## Davranış

Katkıcılardan [Davranış Kuralları](CODE_OF_CONDUCT.md) belgesine uymaları beklenir.
