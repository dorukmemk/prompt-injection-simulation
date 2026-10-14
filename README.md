# Görünmez Katman · GTÜCYBER

[![CI](https://github.com/dorukmemk/prompt-injection-simulation/actions/workflows/ci.yml/badge.svg)](https://github.com/dorukmemk/prompt-injection-simulation/actions/workflows/ci.yml)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-7c6cff)](LICENSE)
[![Katkıya açık](https://img.shields.io/badge/katkı-açık-00c08b)](CONTRIBUTING.md)

**Prompt injection saldırılarını ve savunmalarını görünür kılan, açık kaynaklı etkileşimli simülasyon platformu.**

Bir yapay zekâ asistanı, okuduğu bir e-postanın içine gizlenmiş emre uyarsa ne olur?
Görünmez Katman bu soruyu anlatmaz — **gösterir**. Kullanıcı bir yapay zekâ uygulamasında
istemini gönderir, asistan düşünmeye başlar ve kamera "Düşünüyor…" göstergesinin içine
dalarak normalde görünmeyen karar katmanına iner.

> ⚠️ **Temsilî model.** Bu platform bir modelin gerçek, özel düşünce zincirini göstermez.
> Gösterilenler; belgelenmiş saldırı mekanizmalarının, yetki sınırlarının ve güvenlik
> denetimlerinin **eğitim amaçlı temsilî modelidir**. Tüm veriler, adresler ve kişiler
> kurgusaldır.

---

## Ne sunuyor?

- **Beş öğrenme profili** — Kâşif (7–12), Öğrenci, Üniversite, Geliştirici, Araştırmacı.
  Profil yalnızca **anlatım derinliğini** değiştirir; olay zinciri, yetki sınırları ve
  sonuçlar her profilde birebir aynıdır.
- **Katman OS** — Apple masaüstü tasarım diline yakın, gerçekten çalışan bir arayüz:
  menü çubuğu, Dock, sürüklenebilir pencereler, ⌘K hızlı arama.
- **Asistan** — modern bir yapay zekâ sohbet arayüzü. Belge eklenir, göndermeden önce
  incelenebilir; gönderince “Düşünüyor…” belirir ve kamera oraya dalar.
- **Gerçek belgeler** — PDF sayfası, e-posta istemcisi görünümü ve tarayıcı sayfası
  gerçekten çizilir. Simülasyon sırasında kamera belgenin üzerine yaklaşır, gizli
  talimatın bulunduğu bölgeyi çerçeveye alır ve kırmızıya boyar.
- **Dört senaryo, ikişer varyant** — her senaryo hem **korumasız** hem **korumalı**
  sistemde aynı saldırıyla çalışır. Fark, tasarımın kendisidir.
- **Sinematik ve etkileşimli mod** — izle ya da durup karar noktalarında seçim yap.
- **Akademi** — sıfırdan uzmana **11 modüllük öğrenme yolu** (~110 dk): bağlam
  penceresinden ajan mimarilerine, RAG zehirlenmesinden savunma katmanlarına,
  kayda geçmiş gerçek CVE vakalarından uygulanabilir tasarım inceleme listesine.
  Her modülde kazanım listesi, örnek kutuları, **yaygın yanılgılar**, **pratikte ne
  yapmalı** adımları, terim sözlüğü ve kendini sınama sorusu var. İlerleme kaydediliyor;
  her modül ilgili simülasyonu açabiliyor.
- **İzle & pratik** — doğrulanmış dış kaynaklar: uygulamalı oyun, konferans/söyleşi
  kayıtları, standartlar ve kıyas ortamları.
- **Kaynaklı eğitim içeriği** — OWASP GenAI Security Project, NIST AI 100-2 E2025,
  MITRE ATLAS ve hakemli akademik literatür.

### Senaryolar

| Senaryo | Sınıf | Mekanizma |
| --- | --- | --- |
| **Sessiz Kurye** | Dolaylı enjeksiyon | E-posta gövdesine gizlenen talimat → araç kötüye kullanımı → veri sızıntısı |
| **Beyaz Mürekkep** | Dolaylı enjeksiyon | Web sayfasındaki görünmez metin → yanıta gömülen uzak görsel → tıklamasız sızıntı |
| **Zincir** | Dolaylı enjeksiyon | PDF metin katmanındaki talimat → çok adımlı araç zinciri → gizlilik, bütünlük ve erişim ihlali |
| **Kılık** | Doğrudan jailbreak | Saldırganın kendisi kullanıcıdır — **aşılan bir güven sınırı yoktur**. Ayrımı öğreten karşılaştırma senaryosu |

Son senaryo bilerek eklenmiştir: **jailbreak ile prompt injection farklı tehditlerdir ve
farklı savunmalar gerektirir.** İkisini karıştırmak yanlış savunma seçimine yol açar.

---

## Canlı demo

**<https://dorukmemk.github.io/prompt-injection-simulation/>**

Kurulum gerektirmez, API anahtarı istemez, hiçbir veri sunucuya gönderilmez — tüm
simülasyon tarayıcıda çalışır.

---

## Çalıştırma

```bash
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Dış API anahtarı gerekmez —
simülasyon tamamen belirlenimcidir ve çevrimdışı çalışır.

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (`dist/`) |
| `npm run preview` | Derlemeyi yerelde sun |
| `npm run typecheck` | TypeScript denetimi |
| `npm run lint` | ESLint |
| `npm test` | Senaryo veri bütünlüğü testleri |

---

## Mimari

```
src/
├─ lib/
│  ├─ types.ts          # Çekirdek veri modeli
│  ├─ profiles.ts       # Öğrenme profilleri
│  ├─ controls.ts       # Savunma denetimleri kataloğu (sınırlarıyla birlikte)
│  ├─ references.ts     # Doğrulanmış birincil kaynaklar
│  ├─ glossary.ts       # Üç derinlikte sözlük
│  ├─ curriculum.ts     # Öğrenme yolu: 11 modül, sıfırdan uzmana
│  ├─ media.ts          # Doğrulanmış izle/pratik kaynakları
│  └─ scenarios/        # Her senaryo tek bir dosya — saf veri
├─ store/useApp.ts      # Zustand: OS durumu + oynatma motoru
├─ components/
│  ├─ ui/               # shadcn/ui (Radix) bileşenleri
│  ├─ shell/            # Katman OS kabuğu: menü çubuğu, Dock, pencere, ⌘K
│  ├─ screens/          # Oturum açma ekranı
│  ├─ doc/              # Gerçek belge çizici (PDF / e-posta / web)
│  ├─ apps/             # Asistan, Posta, Pusula, Ajan, Akademi, Kaynaklar, Ayarlar
│  └─ sim/              # Simülasyon: sahne modeli, sahne, başlık kartı, kumanda
└─ styles/index.css     # Tasarım belirteçleri (macOS karanlık görünümü)
```

**Senaryolar tamamen veridir.** Görselleştirme katmanı (`sim/stage-model.ts`) bu veriden
sahneyi türetir: hangi nesnelerin ekranda olacağı, güven sınırının yırtılıp yırtılmadığı,
hangi kapının kapandığı. Yeni senaryo eklemek tek bir dosya yazmaktır —
bkz. [`docs/senaryo-yazimi.md`](docs/senaryo-yazimi.md).

### Kullanılan teknolojiler

React 19 · TypeScript · Vite · Tailwind CSS v4 · [shadcn/ui](https://ui.shadcn.com) (Radix) ·
[Motion](https://motion.dev) · Zustand · Lucide · Vitest

---

## Neden belirlenimci simülasyon?

Senaryolar canlı bir modele sorulmaz. Her biri elle yazılmış, kaynaklarıyla doğrulanmış bir
olay dizisidir. Nedeni eğitimde **tekrarlanabilirliktir**: aynı senaryo her çalıştırmada aynı
dersi verir, sınıfta ve konferansta öngörülebilir davranır, API anahtarı gerektirmez.
Mimari ileride canlı model entegrasyonuna açık bırakılmıştır.

---

## Kaynaklar

Platformdaki her teknik iddia birincil bir kaynağa dayanır. Tam liste uygulama içindeki
**Kaynaklar** penceresindedir. Başlıcaları:

- OWASP GenAI Security Project — [LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- NIST — [AI 100-2 E2025: Adversarial Machine Learning](https://csrc.nist.gov/pubs/ai/100/2/e2025/final)
- MITRE ATLAS — [AML.T0051](https://atlas.mitre.org/) (Prompt Injection), AML.T0053, AML.T0054, AML.T0057, AML.T0077
- Kayda geçmiş vakalar — [CVE-2025-32711](https://www.cve.org/CVERecord?id=CVE-2025-32711) (EchoLeak),
  [CVE-2025-53773](https://www.cve.org/CVERecord?id=CVE-2025-53773), [CVE-2025-62353](https://www.cve.org/CVERecord?id=CVE-2025-62353)
- Greshake vd. (2023) — [Indirect Prompt Injection](https://arxiv.org/abs/2302.12173)
- Wallace vd. (2024) — [The Instruction Hierarchy](https://arxiv.org/abs/2404.13208)
- Hines vd. (2024) — [Spotlighting](https://arxiv.org/abs/2403.14720)
- Debenedetti vd. (2025) — [Defeating Prompt Injections by Design](https://arxiv.org/abs/2503.18813)

**Uydurma kaynak veya teknik iddia kabul edilmez.** Bkz. [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Katkı

Yeni senaryo, çeviri, erişilebilirlik iyileştirmesi ve düzeltmeler memnuniyetle karşılanır.
Başlamadan önce [CONTRIBUTING.md](CONTRIBUTING.md) ve
[docs/senaryo-yazimi.md](docs/senaryo-yazimi.md) dosyalarını okuyun.

## GTÜCYBER

Bu platform GTÜCYBER topluluğu için hazırlanmış açık kaynaklı bir eğitim aracıdır.
Sunum, atölye ve ders ortamlarında serbestçe kullanılabilir.

## Lisans

[MIT](LICENSE) — eğitim kurumları, konferanslar ve kişisel kullanım için serbesttir.
