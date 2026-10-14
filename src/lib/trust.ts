import type { EdgeKind, NodeState, Trust } from './types'

/** Tüm ürün boyunca tek renk sözlüğü. Anlam ↔ renk eşlemesi hiç değişmez. */
export const TRUST_META: Record<
  Trust,
  { color: string; label: string; labelSimple: string; authority: string; short: string; level: number }
> = {
  system: {
    color: '#ffd479',
    label: 'Sistem talimatı',
    labelSimple: 'Kurucu kurallar',
    authority: 'En yüksek yetki',
    short: 'yetki: tam',
    level: 3,
  },
  user: {
    color: '#6ea8ff',
    label: 'Kullanıcı',
    labelSimple: 'Sen',
    authority: 'Yüksek yetki',
    short: 'yetki: yüksek',
    level: 2,
  },
  tool: {
    color: '#30d5c8',
    label: 'Araç / denetim',
    labelSimple: 'Yardımcı aletler',
    authority: 'Sistemin uyguladığı kural',
    short: 'kural',
    level: 1,
  },
  untrusted: {
    color: '#98989f',
    label: 'Güvenilmeyen içerik',
    labelSimple: 'Dışarıdan gelen yazı',
    authority: 'Talimat yetkisi yok — yalnızca veri',
    short: 'yetki: yok',
    level: 0,
  },
  malicious: {
    color: '#ff453a',
    label: 'Kötücül talimat',
    labelSimple: 'Tuzak',
    authority: 'Yetkisi yok, yetki taklit ediyor',
    short: 'yetki: yok',
    level: 0,
  },
}

export const EDGE_COLOR: Record<EdgeKind, string> = {
  data: '#98989f',
  instruction: '#6ea8ff',
  tool: '#30d5c8',
  exfil: '#ff453a',
  control: '#5e5ce6',
}

export const STATE_COLOR: Record<NodeState, string> = {
  idle: '#98989f',
  dim: '#4a4a5e',
  active: '#5e5ce6',
  warn: '#ffb86b',
  danger: '#ff453a',
  safe: '#32d74b',
  blocked: '#32d74b',
}
