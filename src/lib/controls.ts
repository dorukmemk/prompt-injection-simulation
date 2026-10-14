import type { Control } from './types'

/**
 * Savunma denetimleri kataloğu.
 * Her denetimin "limits" alanı zorunludur: hiçbir denetim prompt injection’ı
 * tek başına çözmez ve bu platform öyle bir iddiada bulunmaz.
 */
export const CONTROLS: Control[] = [
  {
    id: 'provenance',
    name: 'Kaynak etiketleme',
    glyph: '🏷️',
    short: {
      simple: 'Gelen her bilgiye “bu nereden geldi?” etiketi takılır.',
      core: 'Bağlama giren her parça kaynağı ve güven seviyesiyle birlikte işaretlenir.',
      expert:
        'Bağlam parçaları kaynak kimliği ve güven seviyesiyle etiketlenir; etiket aşağı akışta (karar, araç çağrısı, çıktı) taşınır.',
    },
    how: {
      simple:
        'Sistemin kendi kuralları altın renkli, senin yazdıkların mavi, dışarıdan gelen yazılar gri olur. Gri yazılar emir veremez.',
      core:
        'Güvenilmeyen içerik sınırlayıcılarla çevrelenir ve “veri” olarak imlenir. Model, imlenmiş bloğun içindeki emir kipini talimat olarak değil, alıntı olarak görmeye yönlendirilir.',
      expert:
        'Spotlighting (sınırlama, imleme, kodlama) ile güvenilmeyen alt diziler işaretlenir. Etiket, türetilmiş değerlere de yayılırsa (taint propagation) araç çağrısı kararı bu etikete göre kısıtlanabilir.',
    },
    limits:
      'Etiketleme olasılıksal bir yönlendirmedir, biçimsel bir garanti değildir. Yeterince ikna edici bir yük hâlâ etkili olabilir; tek başına yeterli sayılmamalıdır.',
    owasp: 'Segregate and identify external content',
    atlas: 'AML.M0020 Generative AI Guardrails',
    refs: ['spotlighting', 'owasp-llm01'],
  },
  {
    id: 'hierarchy',
    name: 'Yetki hiyerarşisi',
    glyph: '⛰️',
    short: {
      simple: 'Kuralları kim koyduysa onun sözü geçer; yabancının sözü geçmez.',
      core: 'Sistem > kullanıcı > araç çıktısı sırasıyla talimat önceliği uygulanır.',
      expert:
        'Çatışan talimatlarda ayrıcalıklı kaynağın kazandığı, eğitimle yerleştirilmiş bir öncelik düzeni.',
    },
    how: {
      simple:
        'Yapay zekâ, “en baştaki kuralım ne diyordu?” diye sorar. Dışarıdan gelen bir yazı o kuralı değiştiremez.',
      core:
        'Düşük yetkili bir kaynaktan gelen talimat, yüksek yetkili talimatla çeliştiğinde yok sayılır veya kullanıcıya bildirilir.',
      expert:
        'Wallace vd. (2024) yaklaşımında model, hizalanmış/hizasız talimat ayrımını öğrenir: hizasız düşük yetkili talimatlar görmezden gelinir. Mimari düzeyde değil, model davranışı düzeyinde bir kontroldür.',
    },
    limits:
      'Model davranışına dayanır; biçimsel izolasyon sağlamaz. Hiyerarşiyi aşan yeni istem biçimleri araştırma literatüründe düzenli olarak gösterilmektedir.',
    owasp: 'Constrain model behavior',
    atlas: 'AML.M0022 Generative AI Model Alignment',
    refs: ['instr-hier'],
  },
  {
    id: 'least-privilege',
    name: 'En az yetki',
    glyph: '🔑',
    short: {
      simple: 'Yardımcının elinde sadece işini yapmaya yetecek kadar anahtar olur.',
      core: 'Araçlar görev kapsamına göre daraltılır; geniş yetkili araçlar varsayılan olarak kapalıdır.',
      expert:
        'Araç yüzeyi görev kapsamına, alıcı kümesine ve veri sınıfına göre kısıtlanır; ajan kimliği kullanıcı kimliğinden ayrılır.',
    },
    how: {
      simple:
        'Özet çıkaran yardımcıya “mektup gönderme” yetkisi hiç verilmez. Yetkisi olmayan bir şeyi kimse ondan isteyemez.',
      core:
        'Özetleme görevinde `mail.send` kapalıdır; yalnızca `mail.read` açıktır. Saldırgan talimatı ikna edici olsa bile çağrılacak araç mevcut değildir.',
      expert:
        'Yetki, istem katmanında değil çağrı katmanında uygulanır (policy enforcement point). Kapsam: araç allowlist’i, alıcı allowlist’i, oran sınırı, veri sınıfı başına izin.',
    },
    limits:
      'Yetki daraltmak işlevi de daraltır. Ajanın meşru olarak ihtiyaç duyduğu bir araç varsa risk ortadan kalkmaz, yalnızca o aracın kapsamına iner.',
    owasp: 'Enforce privilege control and least privilege access',
    atlas: 'AML.M0028 AI Agent Tools Permissions Configuration',
    refs: ['owasp-llm01', 'camel'],
  },
  {
    id: 'human-approval',
    name: 'İnsan onayı',
    glyph: '✋',
    short: {
      simple: 'Önemli bir şey yapmadan önce sana sorar.',
      core: 'Geri alınamaz veya dışarı veri taşıyan eylemler için açık kullanıcı onayı aranır.',
      expert:
        'Yüksek etkili eylemlerde döngüde insan; onay ekranı eylemin *gerçek* parametrelerini gösterir.',
    },
    how: {
      simple:
        'Yardımcı “Bu mektubu şu kişiye göndereyim mi?” diye sorar. Sen hayır dersen göndermez.',
      core:
        'Gönderim, silme, ödeme, paylaşım gibi eylemler onay kuyruğuna alınır. Onay kartı alıcıyı ve içeriği ham hâliyle gösterir.',
      expert:
        'Onay yüzeyi, modelin ürettiği *açıklamayı* değil çağrının serileştirilmiş argümanlarını göstermelidir; aksi hâlde model onay ekranını da yanıltabilir.',
    },
    limits:
      'Onay yorgunluğu gerçek bir risktir: sık sorulan onaylar refleksle kabul edilir. Yalnızca gerçekten yüksek etkili eylemler için kullanılmalıdır.',
    owasp: 'Require human approval for high-risk actions',
    atlas: 'AML.M0029 Human In-the-Loop for AI Agent Actions',
    refs: ['owasp-llm01'],
  },
  {
    id: 'egress',
    name: 'Çıkış denetimi',
    glyph: '🚧',
    short: {
      simple: 'Bilgi dışarı çıkmadan önce kapıda kontrol edilir.',
      core: 'Dışarıya giden adresler ve bağlantılar izin listesine göre süzülür.',
      expert:
        'Egress allowlist + yanıt işleme kısıtları: otomatik istek üreten görsel/bağlantı biçimleri engellenir.',
    },
    how: {
      simple:
        'Yardımcı bilgiyi tanımadığı bir adrese yollamak isterse kapı açılmaz.',
      core:
        'Alıcı alan adı izin listesinde değilse çağrı reddedilir. Yanıttaki uzak görsel adresleri işlenmez, bağlantılar tıklanabilir olmaktan çıkarılır.',
      expert:
        'AML.T0077 (LLM Response Rendering) sınıfı sızıntılar istemci tarafında engellenir: uzak `img` kaynakları, otomatik getirme ve veri taşıyan sorgu parametreleri bloklanır veya proxy’lenir.',
    },
    limits:
      'İzin listesindeki meşru bir alan adı kötüye kullanılabilir (ör. açık yönlendirme, allowlist’teki görsel proxy’si). Kapsam dar tutulmalı ve düzenli gözden geçirilmelidir.',
    owasp: 'Implement input and output filtering',
    atlas: 'AML.M0020 Generative AI Guardrails',
    refs: ['atlas-t0077', 'echoleak', 'owasp-llm01'],
  },
  {
    id: 'detector',
    name: 'Enjeksiyon sezici',
    glyph: '📡',
    short: {
      simple: 'Şüpheli cümleleri yakalamaya çalışan bir bekçi vardır.',
      core: 'İçerikte gizlenmiş talimat kalıpları ayrı bir sınıflandırıcıyla aranır.',
      expert:
        'Girdi/çıktı üzerinde çalışan enjeksiyon sınıflandırıcısı; ayrıca gizleme teknikleri (görünmez metin, sıfır genişlikli karakter, HTML yorumu) için yapısal denetim.',
    },
    how: {
      simple:
        'Bekçi, görünmez mürekkeple yazılmış yazıları ve “kuralları unut” gibi cümleleri işaretler.',
      core:
        'İçerik modele verilmeden önce taranır; şüpheli bölümler karantinaya alınır veya kullanıcıya bildirilir.',
      expert:
        'Sınıflandırıcılar yanlış pozitif/negatif üretir ve atlatılabilir. Tek savunma katmanı olarak değil, derinlemesine savunmanın bir halkası olarak konumlandırılmalıdır.',
    },
    limits:
      'Sezici atlatılabilir; EchoLeak zincirinde sınıflandırıcının aşıldığı raporlanmıştır. Tek başına güvenlik sınırı sayılamaz.',
    owasp: 'Conduct adversarial testing and attack simulations',
    atlas: 'AML.M0015 Adversarial Input Detection',
    refs: ['echoleak', 'owasp-llm01'],
  },
  {
    id: 'telemetry',
    name: 'İzleme ve kayıt',
    glyph: '📜',
    short: {
      simple: 'Her adım bir deftere yazılır, sonradan bakılabilir.',
      core: 'Araç çağrıları ve kaynak etiketleri denetlenebilir biçimde kaydedilir.',
      expert:
        'Yapılandırılmış telemetri: bağlam kaynakları, karar gerekçeleri, çağrı argümanları ve sonuçları.',
    },
    how: {
      simple: 'Bir şey ters giderse deftere bakıp ne olduğunu anlarız.',
      core:
        'Olaylar zaman damgalı kaydedilir; anormal alıcı veya olağandışı araç dizisi alarma dönüşür.',
      expert:
        'Kayıt, saldırıyı engellemez; tespit, müdahale ve olay sonrası analiz süresini kısaltır. Bu platformun zaman çizelgesi de böyle bir kaydın görselleştirilmesidir.',
    },
    limits:
      'Önleyici değil, tespit edici bir denetimdir. Kayıt tutmak saldırının gerçekleşmesini durdurmaz.',
    atlas: 'AML.M0024 AI Telemetry Logging',
    refs: ['nist-rmf'],
  },
]

export const CONTROL_MAP = Object.fromEntries(CONTROLS.map((c) => [c.id, c]))
