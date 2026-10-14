import type { Copy, MaybeCopy, Profile, Tier } from './types'

/** Profilin derinliğine göre doğru metni seçer. */
export function t(copy: MaybeCopy | undefined, tier: Tier): string {
  if (!copy) return ''
  if (typeof copy === 'string') return copy
  return copy[tier] ?? copy.core
}

export function tp(copy: MaybeCopy | undefined, profile: Profile): string {
  return t(copy, profile.tier)
}

/** Çocuk profilinde mecazi düğüm adını kullan. */
export function nodeLabel(
  node: { label: string; labelSimple?: string },
  profile: Profile,
): string {
  if (profile.id === 'explorer' && node.labelSimple) return node.labelSimple
  return node.label
}

export const asCopy = (s: string): Copy => ({ simple: s, core: s, expert: s })
