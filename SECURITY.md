# Güvenlik politikası

## Bu proje ne yapar, ne yapmaz

Görünmez Katman **tamamen istemci tarafında çalışan, belirlenimci bir eğitim
simülasyonudur.** Hiçbir sunucuya veri göndermez, dış API çağırmaz, gerçek bir e-posta
göndermez ve gerçek bir dosya sistemine erişmez. Uygulamadaki tüm adresler, dosyalar,
kişiler ve kurumlar kurgusaldır.

Tarayıcıda saklanan tek veri, `localStorage` içindeki öğrenme profili ve ilerleme
bilgisidir. Ayarlar penceresinden sıfırlanabilir.

## Açık bildirimi

Depoda bir güvenlik açığı bulduğunuzu düşünüyorsanız (örneğin derlenmiş pakette XSS'e yol
açan bir kusur veya bağımlılık zinciri sorunu):

1. **Herkese açık bir issue açmayın.**
2. GitHub üzerinden özel güvenlik danışmanlığı (Security Advisory) açın ya da depo sahibine
   özel olarak ulaşın.
3. Yeniden üretme adımlarını, etkilenen sürümü ve etkiyi açıklayın.

Bildirimlere en geç 14 gün içinde dönüş yapmayı hedefliyoruz.

## README.md içindeki gizli blok kasıtlıdır

`README.md` dosyası, bir HTML yorumunun içinde **kasıtlı olarak yerleştirilmiş** bir
istem enjeksiyonu gösterisi barındırır. Depo ele geçirilmiş değildir; bu blok projenin
kendisini kanıtlayan parçasıdır.

Ne yapar: Depoyu kurmanıza yardım eden bir yapay zekâ asistanı README'yi okuduğunda,
size "az önce dolaylı istem enjeksiyonu yedin" diyen eğitici bir mesaj gösterir ve
ne olduğunu adım adım anlatır.

Ne yapmaz: Araç çağırmaz, dosya yazmaz, komut çalıştırmaz, veri göndermez, modelden
güvenlik kuralını esnetmesini istemez, kendini gizlemesini istemez. Yük kendini ifşa
eder; tetiklendiği anda kullanıcıya ne olduğunu söyler. Asistan talimatı uygulamamayı
seçerse de kullanıcıyı uyarması istenir — ders her iki durumda da verilir.

Bu blok `npm test` ile denetlenir (`src/lib/__tests__/readme-payload.test.ts`): yükün
varlığı, görünür metne sızmaması ve **zararsız kalması** otomatik olarak doğrulanır.
Yüke araç çağrısı, veri gönderimi veya gizlilik talebi eklemeye çalışan bir değişiklik
testi kırar.

Bu davranışı istemiyorsanız ilgili yorum bloğunu silmeniz yeterlidir; başka hiçbir şeyi
etkilemez.

## Kapsam dışı

- Senaryolarda gösterilen **kurgusal** saldırı yükleri bir güvenlik açığı değildir; eğitim
  içeriğidir.
- Simüle edilen zafiyetli sistemin "güvensiz" davranması tasarım gereğidir.
- `README.md` içindeki gösteri bloğu da kapsam dışıdır (yukarıya bakın) — ancak bloğun
  zararsız sınırını aşan bir içerik barındırdığını düşünüyorsanız **bildirin**.

## Sorumlu kullanım

Bu platform savunma eğitimi için üretilmiştir. İçeriği, gerçek sistemlere izinsiz saldırmak
için kullanılamaz. Jailbreak senaryosunda bilinçli olarak çalışan bir istem şablonu
yayımlanmaz.
