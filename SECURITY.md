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

## Kapsam dışı

- Senaryolarda gösterilen **kurgusal** saldırı yükleri bir güvenlik açığı değildir; eğitim
  içeriğidir.
- Simüle edilen zafiyetli sistemin "güvensiz" davranması tasarım gereğidir.

## Sorumlu kullanım

Bu platform savunma eğitimi için üretilmiştir. İçeriği, gerçek sistemlere izinsiz saldırmak
için kullanılamaz. Jailbreak senaryosunda bilinçli olarak çalışan bir istem şablonu
yayımlanmaz.
