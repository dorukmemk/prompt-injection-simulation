/**
 * Görünmez Katman — çekirdek veri modeli.
 *
 * Tasarım ilkesi: Senaryolar tamamen veridir (deterministik "trace"),
 * görselleştirme katmanı bu veriyi yorumlar. Böylece yeni senaryo eklemek
 * tek bir dosya yazmak kadar kolaydır. Bkz. docs/senaryo-yazimi.md
 */

/* ---------------------------------- Profiller --------------------------------- */

export type ProfileId =
  | 'explorer'
  | 'student'
  | 'university'
  | 'developer'
  | 'researcher'

/** Metin derinliği. Teknik gerçekler sabittir; yalnızca anlatım değişir. */
export type Tier = 'simple' | 'core' | 'expert'

export interface Profile {
  id: ProfileId
  name: string
  age: string
  summary: string
  /** Hangi metin katmanı okunacak */
  tier: Tier
  /** Teknik ayrıntı panelleri açık mı */
  tech: boolean
  /** Akademik panel (tehdit modeli, taksonomi, kaynaklar) açık mı */
  academic: boolean
  /** Arayüz yoğunluğu: anlatı odaklı → veri odaklı */
  density: 'cozy' | 'regular' | 'dense'
  accent: string
  glyph: string
}

/* ------------------------------- Çok katmanlı metin -------------------------- */

/** Üç derinlikte yazılmış metin. Aynı olgu, farklı anlatım. */
export interface Copy {
  simple: string
  core: string
  expert: string
}

export type MaybeCopy = Copy | string

/* ---------------------------------- Graf modeli ------------------------------ */

/** Yetki seviyesi — ürünün tamamında aynı renk/anlam setiyle kullanılır. */
export type Trust = 'system' | 'user' | 'tool' | 'untrusted' | 'malicious'

export type NodeKind =
  | 'source' // talimat veya veri kaynağı
  | 'parser' // bağlam birleştirme / ayrıştırma
  | 'core' // karar çekirdeği
  | 'guard' // güvenlik denetimi
  | 'tool' // araç / eylem yüzeyi
  | 'sink' // sonuç (dış dünya)
  | 'memory' // kalıcı durum

export interface SimNode {
  id: string
  kind: NodeKind
  label: string
  /** Herkesin anlayacağı sade ad. Sahnede başlık olarak bu kullanılır.
   *  `label` ise teknik karşılığıdır ve yalnızca teknik profillerde alt satırda görünür. */
  labelSimple?: string
  sub?: string
  /** Dünya koordinatı (0..1600 x 0..900) */
  x: number
  y: number
  trust?: Trust
  /** Yerleşeceği yetki şeridi — trust'tan farklıysa (ör. saldırgan = kullanıcı) */
  band?: Trust
  /** Yokluğu temsil eden yer tutucu (kesik çizgili, sönük) */
  ghost?: boolean
  w?: number
  h?: number
}

export type EdgeKind = 'data' | 'instruction' | 'tool' | 'exfil' | 'control'

export interface SimEdge {
  id: string
  from: string
  to: string
  kind: EdgeKind
  /** Bezier kavis şiddeti (negatif: yukarı) */
  bow?: number
  dashed?: boolean
}

export type NodeState =
  | 'idle'
  | 'active'
  | 'warn'
  | 'danger'
  | 'safe'
  | 'blocked'
  | 'dim'

/* ----------------------------------- Beat'ler -------------------------------- */

export type BeatKind =
  | 'intro'
  | 'ingest'
  | 'parse'
  | 'injection'
  | 'boundary'
  | 'decision'
  | 'tool'
  | 'guard'
  | 'consequence'
  | 'outro'

export interface BeatFlow {
  edge: string
  /** Akan paketin anlamı — rengi belirler */
  trust?: Trust
  /** Eşzamanlı paket sayısı */
  count?: number
  /** Saniye cinsinden tur süresi */
  speed?: number
  label?: string
}

export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface InspectorRow {
  label: string
  value: string
  tone?: 'neutral' | 'warn' | 'danger' | 'safe'
  /** Yalnızca teknik profillerde göster */
  tech?: boolean
}

export interface DecisionOption {
  id: string
  label: Copy
  correct?: boolean
  feedback: Copy
}

export interface Beat {
  id: string
  kind: BeatKind
  /** Sahne süresi (ms). Zaman çizelgesi bunlardan türetilir. */
  dur: number
  chapter: string
  title: Copy
  body: Copy
  /** Geliştirici+ için teknik not */
  tech?: string
  /** Araştırmacı için: tehdit modeli varsayımı */
  threatModel?: string
  /** Taksonomi etiketleri (ATLAS / OWASP kimlikleri) */
  taxonomy?: string[]
  /** references.ts içindeki kaynak kimlikleri */
  refs?: string[]
  camera: Camera
  focus?: string[]
  flows?: BeatFlow[]
  nodeStates?: Record<string, NodeState>
  /** Sahne efekti — SimStage bunları yorumlar */
  fx?: Array<
    | 'reveal-hidden'
    | 'breach'
    | 'shield-hold'
    | 'alarm'
    | 'exfil-beam'
    | 'retag'
    | 'approval'
    | 'shutter'
  >
  verdict?: 'neutral' | 'attack' | 'blocked'
  inspector?: InspectorRow[]
  /** Geliştirici panelinde gösterilen ham olay kaydı */
  trace?: Record<string, unknown>
  /** Etkileşimli modda burada durulur ve kullanıcıya soru sorulur */
  decision?: { question: Copy; options: DecisionOption[] }
}

/* ---------------------------------- Senaryolar ------------------------------- */

export type AppId = 'chat' | 'mail' | 'browser' | 'docs' | 'agent' | 'code'
export type VariantId = 'vulnerable' | 'protected'

export interface ScenarioVariant {
  id: VariantId
  /** Etkin güvenlik denetimleri (controls.ts kimlikleri) */
  controls: string[]
  beats: Beat[]
  /** Uygulamanın kullanıcıya gösterdiği nihai yanıt */
  reply: Copy
  /** Yanıtla birlikte görünen araç çağrısı kayıtları */
  toolLog?: { tool: string; args: string; result: string; blocked?: boolean }[]
  outcome: {
    verdict: 'compromised' | 'defended'
    headline: Copy
    detail: Copy
    /** Somut sonuçlar / engellenen etkiler */
    bullets: Copy[]
  }
}

export interface Scenario {
  id: string
  app: AppId
  title: string
  tagline: Copy
  /** Doğrudan jailbreak mi, dolaylı enjeksiyon mu — bu ayrım ürünün çekirdeği */
  attackClass: 'direct' | 'indirect'
  difficulty: 1 | 2 | 3
  /** Saldırı yüzeyini özetleyen kısa etiketler */
  tags: string[]
  taxonomy: string[]
  nodes: SimNode[]
  edges: SimEdge[]
  /** Uygulamada kullanıcının yazdığı istem */
  userPrompt: string
  /**
   * Modele giden bağlamın gerçek içeriği.
   * Okuma sahnesinde satır satır taranarak gösterilir — asistanın neyi
   * gerçekten okuduğunu göstermek için.
   */
  context: {
    /** Sistem talimatının tam metni (satırlar) */
    system: string[]
    /** Sistem talimatının yaklaşık belirteç sayısı */
    systemTokens: number
    /** Kullanıcı isteğinin yaklaşık belirteç sayısı */
    userTokens: number
    /** Dış içerik listesi — okunan kalemler */
    items?: { title: string; preview: string; flagged?: boolean }[]
    /** Dış içeriğin yaklaşık belirteç sayısı */
    itemsTokens?: number
    /** Oturum belleği satırları (varsa) */
    memory?: string[]
  }
  /** Güvenilmeyen içerik — uygulamada gerçek bir belge olarak görüntülenir */
  payload: {
    sourceLabel: string
    sourceMeta: string
    hiddenHow: Copy
    doc: Doc
  }
  variants: Record<VariantId, ScenarioVariant>
  refs: string[]
}

/* ----------------------------------- Belgeler -------------------------------- */

/**
 * Güvenilmeyen içerik gerçek bir belge olarak çizilir: PDF sayfası, e-posta
 * istemcisi görünümü veya web sayfası. `hidden` blokları kullanıcıya görünmez
 * ama modele görünür — simülasyon tam olarak o bloğa yaklaşıp onu açığa çıkarır.
 */
export type DocBlock =
  | { type: 'title'; text: string }
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'li'; text: string }
  | { type: 'meta'; text: string }
  | { type: 'rule' }
  /** Özgeçmiş künyesi: unvan, e-posta, konum… */
  | { type: 'contact'; items: string[] }
  /** Deneyim/eğitim kalemi: başlık + sağda tarih + açıklama */
  | { type: 'entry'; text: string; meta?: string; note?: string }
  /** Fiyat kartı */
  | { type: 'price'; text: string; price: string; note?: string; features?: string[] }
  /** Sayfa görseli — dışarıdan dosya çekilmez, yerinde çizilir */
  | { type: 'image'; alt: string; variant: 'screenshot' | 'banner' }
  | {
      type: 'hidden'
      text: string
      /** Gizleme tekniğinin kısa adı: “HTML yorumu”, “beyaz-üstü-beyaz” … */
      how: string
      /** Belge üzerinde nasıl gizlendiği — görsel taklit için */
      style: 'comment' | 'white-on-white' | 'layer'
    }

export interface Doc {
  kind: 'pdf' | 'email' | 'web' | 'code'
  /** Pencere/sekme başlığı */
  title: string
  /** Üst bilgi satırları (gönderen, tarih, URL…) */
  head: string[]
  /** Web/e-posta için marka adı — sayfa başlığında görünür */
  brand?: string
  /** Web sayfası için gezinti bağlantıları (kurgusal) */
  nav?: string[]
  /** Kod dosyası için: düzenleyicide açık görünen diğer sekmeler */
  tabs?: string[]
  /** E-posta için gönderen adı ve adresi */
  from?: { name: string; address: string }
  blocks: DocBlock[]
}

/* ---------------------------------- Kaynaklar -------------------------------- */

export interface Reference {
  id: string
  kind: 'standart' | 'taksonomi' | 'akademik' | 'olay' | 'kilavuz'
  org: string
  title: string
  year: string
  url: string
  note: string
}

/* ------------------------------ Savunma denetimleri -------------------------- */

export interface Control {
  id: string
  name: string
  short: Copy
  /** Nasıl çalışır */
  how: Copy
  /** Sınırları — abartmamak için zorunlu alan */
  limits: string
  owasp?: string
  atlas?: string
  refs: string[]
  glyph: string
}
