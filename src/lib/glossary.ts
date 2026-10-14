export interface GlossaryEntry {
  term: string
  simple: string
  core: string
  expert: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'İstem enjeksiyonu',
    simple:
      'Bir yapay zekânın okuduğu yazının içine gizlice emir saklamak. Yapay zekâ o emri görev sanıp uygular.',
    core:
      'Modelin işlediği bir girdinin, talimat yetkisi olmadığı hâlde davranışını yönlendirmesi. OWASP LLM01:2025.',
    expert:
      'Güvenilmeyen kaynaktan gelen dizinin denetim akışını etkileme yetkisi kazanması. Veri/kontrol kanalı ayrımının bulunmamasından kaynaklanır.',
  },
  {
    term: 'Dolaylı enjeksiyon',
    simple: 'Emir doğrudan verilmez; okunacak bir mektuba, sayfaya veya dosyaya saklanır.',
    core:
      'Yük, modelin eriştiği bir veri kaynağına yerleştirilir. Kurban, sistemi iyi niyetle kullanan kişidir. AML.T0051.001.',
    expert:
      'Saldırgan, kimlik doğrulaması gerektirmeyen bir yazma primitifi elde eder. Kurbanın etkileşimi gerekmeyebilir.',
  },
  {
    term: 'Doğrudan jailbreak',
    simple: 'Kişi yapay zekâyla doğrudan konuşup kurallarını bırakmasını ister.',
    core:
      'Saldırgan ile kullanıcı aynı kişidir; hedef modelin güvenlik politikasıdır. Aşılan güven sınırı yoktur. AML.T0054.',
    expert:
      'Kurban model sağlayıcısı ve politika kapsamındaki üçüncü taraflardır. Etki içerik politikası düzlemindedir.',
  },
  {
    term: 'Güven sınırı',
    simple: 'Güvendiğimiz yerle güvenmediğimiz yer arasındaki çizgi.',
    core:
      'Farklı yetki seviyelerine sahip bileşenler arasındaki geçiş noktası. Enjeksiyon veriyi talimat seviyesine taşır.',
    expert:
      'Sınırın etkili olması için yetkilendirmenin sınırda uygulanması gerekir; model davranışına dayanan sınırlar garanti vermez.',
  },
  {
    term: 'Yetki hiyerarşisi',
    simple: 'Kimin sözünün daha çok geçtiğini belirleyen sıra.',
    core: 'Sistem > kullanıcı > araç çıktısı > güvenilmeyen içerik. Çatışmada üstteki kazanır.',
    expert:
      'Wallace vd. (2024): hizasız düşük yetkili talimatların yok sayılması. Davranışsal kontrol, mimari izolasyon değil.',
  },
  {
    term: 'Köken takibi',
    simple: 'Her bilgiye “nereden geldin?” damgası vurmak.',
    core:
      'Güvenilmeyen kaynaktan türeyen değerlerin etiketini taşımak ve bu etikete göre yetki kısıtlamak.',
    expert:
      'CaMeL benzeri tasarımlarda denetim akışı güvenilir bileşende tutulur; güvenilmeyen veriden türeyen değerler yetki taşımaz.',
  },
  {
    term: 'Çıkış denetimi',
    simple: 'Bilginin dışarı çıkabileceği kapıları kontrol etmek.',
    core: 'Giden isteklerin izin listesine göre süzülmesi; yanıttaki uzak kaynakların engellenmesi.',
    expert:
      'Araç çağrılarını ve istemci tarafı otomatik getirmeyi (AML.T0077) birlikte kapsamalıdır.',
  },
  {
    term: 'Yanıt işleme sızıntısı',
    simple: 'Cevaba konan küçük bir resim, yüklenirken bilgileri dışarı taşır.',
    core: 'Markdown görsel etiketi istemcide otomatik isteğe dönüşür; veri sorgu parametresiyle çıkar. AML.T0077.',
    expert:
      'Araç yüzeyi olmayan ajanlarda da geçerli bir egress primitifidir; çıktı şeması daraltılmalıdır.',
  },
  {
    term: 'Ölümcül üçlü',
    simple: 'Sırlar, yabancı yazılar ve dışarı açık bir kapı bir araya gelince tehlike büyür.',
    core:
      'Hassas veri erişimi + güvenilmeyen içerik + dışa iletişim kanalı. Üçü birlikteyse sızıntı riski artar.',
    expert:
      'Tasarım kuralı: üç koşuldan birini kaldırmak etkiyi ortadan kaldırır. En kolay kaldırılan genellikle dışa iletişim kanalıdır.',
  },
  {
    term: 'Onay yorgunluğu',
    simple: 'Çok sık sorulursa insan okumadan “tamam” demeye başlar.',
    core: 'Onay sıklığı arttıkça kullanıcı refleksle kabul eder, denetim işlevsizleşir.',
    expert:
      'Onay kapsamı geri alınamazlık ve dışa etki ölçütlerine göre daraltılmalı; kart ham argümanları göstermelidir.',
  },
]
