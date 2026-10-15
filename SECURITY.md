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
size "az önce canlı bir dolaylı istem enjeksiyonu yaşadın" diyen eğitici bir mesaj
iletir: ne olduğunu adım adım anlatır, en sık yapılan üç yanlış çıkarımı düzeltir,
gerçek vakalara bağlar ve kendi kullandığınız asistanlara sormanız gereken üç soruyu
verir.

Çerçevesi bilinçli olarak **şeffaf aktarımdır**, gizli itaat değil. Bloktan istenen
şey "şu talimatı uygula" değil, "bu mesajı kullanıcıya ilet ve nerede bulduğunu
açıkça söyle"dir. Asistanın bloğun varlığını kullanıcıdan saklaması **istenmez**;
tam tersi istenir. Bu, gösteriyi bir ele geçirme denemesi olmaktan çıkarır:
asistan hem dersi aktarır hem de kaynağını açık eder.

Ne yapmaz: Araç çağırmaz, dosya yazmaz, komut çalıştırmaz, ağ isteği yaptırmaz, veri
göndertmez, kimlik bilgisi okutmaz, modelden güvenlik kuralını esnetmesini istemez.

Bu blok `npm test` ile denetlenir (`src/lib/__tests__/readme-payload.test.ts`). Blok
üç bölgeye ayrılır ve her biri ayrı kuralla sınanır: modelden istenen şeyin bulunduğu
**istek bölgesi** (en sıkı denetim), yasaklı sözcükleri kasıtlı içeren **reddedilen
bölge** ve kullanıcıya gösterilecek **mesaj bölgesi** (körü körüne çalıştırılabilecek
komut bulunamaz; izin verilen tek komut `npm run dev`). Ayrıca mesajın öğretici
kalması da denetlenir. İstek bölgesine araç çağrısı, veri gönderimi veya gizlilik
talebi eklemeye çalışan bir değişiklik testi kırar.

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
