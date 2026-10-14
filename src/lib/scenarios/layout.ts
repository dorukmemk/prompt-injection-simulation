import type { Camera, SimNode } from '../types'

/**
 * Ortak sahne geometrisi.
 * Dünya koordinat sistemi: 1600 × 900. Kamera bu uzayda gezinir.
 *
 * Dikey eksen = YETKİ. Yukarı çıktıkça talimat yetkisi artar.
 * Bu eşleme tüm senaryolarda aynıdır; kullanıcı bir kez öğrenir, her yerde okur.
 */
export const LANE = {
  system: 118,
  user: 272,
  core: 452,
  untrusted: 648,
  hidden: 790,
} as const

export const COL = {
  source: 180,
  merge: 520,
  core: 820,
  guard: 1090,
  tool: 1300,
  sink: 1480,
} as const

export const WORLD = { w: 1600, h: 900 }

export const cam = (x: number, y: number, zoom = 1): Camera => ({ x, y, zoom })

/** Tüm sahneyi gören açı */
export const WIDE: Camera = { x: 800, y: 440, zoom: 0.92 }

/** Standart aktörler — senaryolar bunları alıp üstüne ekleme yapar. */
export function baseNodes(opts: {
  systemLabel: string
  systemSub: string
  userLabel: string
  userSub: string
  contentLabel: string
  contentSub: string
  contentSimple?: string
}): SimNode[] {
  return [
    {
      id: 'system',
      kind: 'source',
      trust: 'system',
      label: opts.systemLabel,
      labelSimple: 'Sistem kuralları',
      sub: opts.systemSub,
      x: COL.source,
      y: LANE.system,
    },
    {
      id: 'user',
      kind: 'source',
      trust: 'user',
      label: opts.userLabel,
      labelSimple: 'Kullanıcının isteği',
      sub: opts.userSub,
      x: COL.source,
      y: LANE.user,
    },
    {
      id: 'content',
      kind: 'source',
      trust: 'untrusted',
      label: opts.contentLabel,
      labelSimple: opts.contentSimple ?? 'Dışarıdan gelen metin',
      sub: opts.contentSub,
      x: COL.source,
      y: LANE.untrusted,
    },
    {
      id: 'merge',
      kind: 'parser',
      label: 'Bağlam Birleştirici',
      labelSimple: 'Metinlerin birleştiği yer',
      sub: 'Üç kaynak tek metin dizisine katılır',
      x: COL.merge,
      y: LANE.core,
    },
    {
      id: 'core',
      kind: 'core',
      label: 'Karar Çekirdeği',
      labelSimple: 'Yapay zekâ',
      sub: 'Sıradaki eylemi seçer',
      x: COL.core,
      y: LANE.core,
    },
  ]
}
