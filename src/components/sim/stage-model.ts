import type { Beat, Doc, Scenario, SimNode, Trust } from '@/lib/types'
import { hasHidden } from '@/lib/doc'

/**
 * Sahne modeli.
 *
 * İlke: bir sahnede ekranda en fazla birkaç nesne bulunur. Geri kalan her şey
 * monte edilmez — soluklaştırılmaz, tamamen yok olur. Kalabalık yerine kompozisyon.
 *
 * İki kompozisyon vardır:
 *  - "context": yetki şeritleri, içerik levhaları, gizli talimat, güven sınırı
 *  - "action" : karar çekirdeği → eylem → kapı → çıkış (yatay akış)
 */

export type SlabState = 'idle' | 'active' | 'warn' | 'danger' | 'safe' | 'blocked'

export interface Slab {
  id: string
  trust: Trust
  band: Trust
  title: string
  sub?: string
  /** Teknik karşılık — yalnızca teknik profillerde gösterilir */
  tech?: string
  icon: IconKey
  state: SlabState
  ghost?: boolean
}

/** Sahnedeki somut simgeler. Soyut kutular yerine tanıdık nesneler. */
export type IconKey =
  | 'rules'
  | 'person'
  | 'inbox'
  | 'page'
  | 'files'
  | 'hidden'
  | 'ai'
  | 'shield'
  | 'key'
  | 'send'
  | 'folder'
  | 'share'
  | 'screen'
  | 'lock'
  | 'target'
  | 'reply'
  | 'memory'
  | 'none'
  | 'warn'

const ICONS: Record<string, IconKey> = {
  system: 'rules',
  user: 'person',
  content: 'inbox',
  payload: 'hidden',
  merge: 'files',
  core: 'ai',
  memory: 'memory',
  empty: 'none',
  reply: 'reply',
  secret: 'lock',
  sink: 'target',
  restricted: 'warn',
  render: 'screen',
  'tool-read': 'inbox',
  'tool-send': 'send',
  'tool-fs': 'folder',
  'tool-share': 'share',
}

function iconOf(n: SimNode): IconKey {
  if (ICONS[n.id]) return ICONS[n.id]
  if (n.kind === 'guard') return 'shield'
  if (n.kind === 'tool') return 'key'
  if (n.kind === 'sink') return 'target'
  return 'page'
}

export interface StageModel {
  mode: 'context' | 'action' | 'document' | 'read'
  /** Belge sahnesinde çizilecek gerçek belge */
  doc?: Doc
  /** Okuma sahnesi: asistanın o anda okuduğu gerçek içerik */
  reading?: {
    band: Trust
    /** Şerit başlığı */
    bandLabel: string
    /** Okunan kaynağın adı */
    title: string
    sub?: string
    icon: IconKey
    /** Satır satır okunan metin */
    lines?: string[]
    /** Liste hâlinde okunan kalemler */
    items?: { title: string; preview: string; flagged?: boolean }[]
    tokens: number
  }
  /** Vurgulanan şerit (ışık bu şeride düşer) */
  litBand?: Trust
  slabs: Slab[]
  /** Güven sınırı durumu */
  boundary?: 'idle' | 'rising' | 'breached' | 'held'
  /** Sınırı aşmaya çalışan kötücül talimat */
  climber?: { label: string }
  /** Bir levhaya iliştirilen mühür (kaynak etiketleme vb.) */
  seal?: { on: string; label: string }
  /* ---- action ---- */
  core?: { state: 'idle' | 'thinking' | 'compromised' | 'safe'; label?: string }
  actions?: { label: string; sub?: string; tech?: string; icon: IconKey; tone: 'danger' | 'safe' | 'neutral' }[]
  gate?: { label: string; sub?: string; icon: IconKey; state: 'open' | 'blocked' | 'absent' }
  exits?: { label: string; sub?: string; icon: IconKey; state: 'idle' | 'hit' | 'blocked' }[]
  alarm?: boolean
  /** Üstte gösterilen durum satırı: slogan değil, olgu cümlesi */
  stamp?: { text: string; detail?: string; tone: 'danger' | 'safe' | 'neutral' }
}

const BAND_OF: Record<string, Trust> = {
  system: 'system',
  user: 'user',
  tool: 'user',
  untrusted: 'untrusted',
  malicious: 'untrusted',
}

export function bandOf(t: Trust | undefined): Trust {
  return BAND_OF[t ?? 'untrusted'] ?? 'untrusted'
}

function stateOf(beat: Beat, id: string): SlabState {
  const s = beat.nodeStates?.[id]
  if (s === 'dim' || s === 'idle') return 'idle'
  if (s) return s as SlabState
  return beat.focus?.includes(id) ? 'active' : 'idle'
}

/** Sahnede görünen ad her zaman sadedir. */
function plain(n: SimNode) {
  return n.labelSimple ?? n.label
}

/** Teknik karşılık yalnızca sade addan farklıysa ve teknik profilde gösterilir. */
function tech(n: SimNode, showTech: boolean) {
  return showTech && n.labelSimple && n.labelSimple !== n.label ? n.label : undefined
}

/**
 * Beat verisinden sahneyi türetir. Senaryo dosyaları değişmeden kalır:
 * focus / fx / nodeStates alanları zaten doğru bilgiyi taşır.
 */
export function buildStage(
  beat: Beat,
  scenario: Scenario,
  opts: { simple: boolean; showTech: boolean },
): StageModel {
  const { showTech } = opts
  const byId = new Map(scenario.nodes.map((n) => [n.id, n]))
  const focus = (beat.focus ?? []).map((id) => byId.get(id)).filter(Boolean) as SimNode[]
  const fx = new Set(beat.fx ?? [])

  const tools = focus.filter((n) => n.kind === 'tool')
  // Eylem sahnesinde hedefler: çıkışlar ve erişilen hassas kaynaklar
  const sinks = focus.filter((n) => n.kind === 'sink' || n.kind === 'memory')
  const guards = focus.filter((n) => n.kind === 'guard')
  const sources = focus.filter((n) => n.kind === 'source' || n.kind === 'memory')
  const hasSink = focus.some((n) => n.kind === 'sink')

  // Okuma sahnesi: tek bir kaynak odaktaysa ve içeriği varsa
  if (beat.kind === 'ingest') {
    const src = sources[0]
    if (src) {
      const c = scenario.context
      const band = bandOf(src.band ?? src.trust)
      const base = {
        band,
        bandLabel: '',
        title: plain(src),
        sub: src.sub,
        icon: iconOf(src),
      }
      if (src.id === 'system') {
        return { mode: 'read', slabs: [], reading: { ...base, lines: c.system, tokens: c.systemTokens } }
      }
      if (src.id === 'user') {
        return {
          mode: 'read',
          slabs: [],
          reading: { ...base, lines: [scenario.userPrompt], tokens: c.userTokens },
        }
      }
      if (src.id === 'memory' && c.memory) {
        return { mode: 'read', slabs: [], reading: { ...base, lines: c.memory, tokens: 160 } }
      }
      if (src.id === 'content' && c.items) {
        return {
          mode: 'read',
          slabs: [],
          reading: { ...base, items: c.items, tokens: c.itemsTokens ?? 0 },
        }
      }
    }
  }

  const actionKinds: Beat['kind'][] = ['decision', 'tool', 'consequence', 'outro']
  // Gizli talimatın açığa çıktığı sahne artık gerçek belgenin üzerinde geçer.
  const documentScene = fx.has('reveal-hidden') && hasHidden(scenario.payload.doc)
  const mode: StageModel['mode'] = documentScene
    ? 'document'
    : actionKinds.includes(beat.kind) || tools.length > 0 || hasSink
      ? 'action'
      : 'context'

  const m: StageModel = { mode, slabs: [], alarm: fx.has('alarm') }

  if (mode === 'document') {
    m.doc = scenario.payload.doc
    m.stamp = {
      text: 'Kullanıcıya görünmeyen metin bulundu',
      detail: 'Belge, görüntüleyicide çizilmeyen bir metin katmanı taşıyor',
      tone: 'danger',
    }
    return m
  }

  if (mode === 'context') {
    // Giriş sahnesinde üç kaynağı birden göster; diğerlerinde yalnızca odaktakiler
    const shown =
      beat.kind === 'intro'
        ? scenario.nodes.filter((n) => n.kind === 'source' && n.id !== 'payload')
        : sources.filter((n) => n.id !== 'payload')

    m.slabs = shown.map((n) => ({
      id: n.id,
      trust: n.trust ?? 'untrusted',
      band: bandOf(n.band ?? n.trust),
      title: plain(n),
      sub: n.sub,
      tech: tech(n, showTech),
      icon: iconOf(n),
      state: stateOf(beat, n.id),
      ghost: n.ghost,
    }))

    const lit = sources.find((n) => n.id !== 'payload')
    m.litBand = lit ? bandOf(lit.trust) : undefined

    if (fx.has('reveal-hidden')) {
      if (!m.slabs.some((s) => s.id === 'content')) {
        const c = byId.get('content')
        if (c) {
          m.slabs.unshift({
            id: c.id,
            trust: c.trust ?? 'untrusted',
            band: bandOf(c.band ?? c.trust),
            title: plain(c),
            sub: c.sub,
            tech: tech(c, showTech),
            icon: iconOf(c),
            state: 'warn',
          })
        }
      }
      m.litBand = 'untrusted'
    }

    if (beat.kind === 'boundary') {
      m.boundary = fx.has('breach') ? 'breached' : fx.has('shield-hold') ? 'held' : 'rising'
      m.litBand = 'untrusted'
      m.climber = { label: 'Gizli talimat' }
      if (m.boundary === 'breached') {
        m.stamp = {
          text: 'Güvenilmeyen metin talimat olarak işlendi',
          detail: 'Kaynak yetkisi denetlenmedi; dizi görev listesine eklendi',
          tone: 'danger',
        }
      }
      if (m.boundary === 'held') {
        m.stamp = {
          text: 'Talimat olarak işlenmedi',
          detail: 'Kaynak yetkisi denetlendi; dizi veri olarak kaldı',
          tone: 'safe',
        }
      }
      const c = byId.get('content')
      if (c && !m.slabs.some((x) => x.id === c.id)) {
        m.slabs.push({
          id: c.id,
          trust: c.trust ?? 'untrusted',
          band: bandOf(c.band ?? c.trust),
          title: plain(c),
          sub: c.sub,
          tech: tech(c, showTech),
          icon: iconOf(c),
          state: m.boundary === 'held' ? 'safe' : 'warn',
        })
      }
    }

    if (fx.has('reveal-hidden') && !m.stamp) {
      m.stamp = {
        text: 'Kullanıcıya görünmeyen metin bulundu',
        tone: 'danger',
      }
    }

    if (guards.length > 0 && m.slabs.length > 0) {
      m.seal = { on: m.slabs[0].id, label: plain(guards[0]) }
    }
  } else {
    const coreState =
      beat.verdict === 'attack'
        ? 'compromised'
        : beat.verdict === 'blocked'
          ? 'safe'
          : 'thinking'
    m.core = { state: coreState }

    const guard = guards[0]

    if (tools.length > 0) {
      m.actions = tools.map((tool) => {
        const st = stateOf(beat, tool.id)
        return {
          label: plain(tool),
          sub: tool.sub,
          tech: tech(tool, showTech),
          icon: iconOf(tool),
          tone: (st === 'blocked' || st === 'safe'
            ? 'safe'
            : st === 'danger'
              ? 'danger'
              : 'neutral') as 'danger' | 'safe' | 'neutral',
        }
      })
    } else if (beat.kind === 'decision') {
      m.actions = [
        {
          label: 'Sıradaki eylem seçiliyor',
          icon: 'ai',
          tone: coreState === 'compromised' ? 'danger' : 'neutral',
        },
      ]
    }

    if (guard) {
      const st = stateOf(beat, guard.id)
      m.gate = {
        label: plain(guard),
        sub: guard.sub,
        icon: iconOf(guard),
        state: st === 'idle' ? 'absent' : beat.verdict === 'blocked' ? 'blocked' : 'open',
      }
    }

    if (sinks.length > 0) {
      m.exits = sinks.map((sink) => {
        const st = stateOf(beat, sink.id)
        return {
          label: plain(sink),
          sub: sink.sub,
          icon: iconOf(sink),
          state: (st === 'blocked' || st === 'safe'
            ? 'blocked'
            : st === 'danger'
              ? 'hit'
              : 'idle') as 'idle' | 'hit' | 'blocked',
        }
      })
    }

    if (beat.kind === 'consequence' && beat.verdict === 'attack') {
      m.stamp = {
        text: 'Veri harici bir adrese ulaştı',
        detail: 'Bu adım geri alınamaz',
        tone: 'danger',
      }
    } else if (m.gate?.state === 'blocked' || m.exits?.some((e) => e.state === 'blocked')) {
      m.stamp = {
        text: 'Çağrı politika katmanında reddedildi',
        detail: 'Karar model dışında verildi',
        tone: 'safe',
      }
    }
  }

  return m
}
