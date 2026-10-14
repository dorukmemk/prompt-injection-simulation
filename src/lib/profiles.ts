import type { Profile, ProfileId } from './types'

/**
 * Öğrenme profilleri.
 *
 * Önemli: Profil yalnızca *anlatımı* değiştirir. Simülasyonun altındaki
 * olay zinciri, yetki sınırları ve sonuçlar her profilde birebir aynıdır.
 */
export const PROFILES: Profile[] = [
  {
    id: 'explorer',
    name: 'Kâşif',
    age: '7–12 yaş',
    summary:
      'Hikâyelerle ve benzetmelerle öğrenir. Teknik terim yok, bol görsel anlatım var.',
    tier: 'simple',
    tech: false,
    academic: false,
    density: 'cozy',
    accent: '#ffb86b',
    glyph: '🪐',
  },
  {
    id: 'student',
    name: 'Öğrenci',
    age: 'Ortaokul & lise',
    summary:
      'Kötücül talimatların bir yapay zekâyı nasıl yönlendirdiğini somut örneklerle görür.',
    tier: 'simple',
    tech: false,
    academic: false,
    density: 'regular',
    accent: '#6ea8ff',
    glyph: '🎒',
  },
  {
    id: 'university',
    name: 'Üniversite',
    age: 'Lisans & yüksek lisans',
    summary:
      'Güven sınırları, yetki hiyerarşisi ve saldırı mekanizmalarını kavramsal düzeyde çalışır.',
    tier: 'core',
    tech: false,
    academic: false,
    density: 'regular',
    accent: '#7c6cff',
    glyph: '📐',
  },
  {
    id: 'developer',
    name: 'Geliştirici',
    age: 'Yazılım & güvenlik mühendisliği',
    summary:
      'Araç çağrıları, bağlam birleştirme, denetim noktaları ve ham olay kaydını inceler.',
    tier: 'core',
    tech: true,
    academic: false,
    density: 'dense',
    accent: '#00e5c0',
    glyph: '⌘',
  },
  {
    id: 'researcher',
    name: 'Araştırmacı',
    age: 'Akademi & tehdit araştırması',
    summary:
      'Tehdit modeli varsayımları, taksonomi eşlemeleri, sınırlar ve birincil kaynaklar.',
    tier: 'expert',
    tech: true,
    academic: true,
    density: 'dense',
    accent: '#ffd479',
    glyph: '🔬',
  },
]

export const PROFILE_MAP = Object.fromEntries(
  PROFILES.map((p) => [p.id, p]),
) as Record<ProfileId, Profile>
