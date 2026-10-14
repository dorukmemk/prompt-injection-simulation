import type { Doc, DocBlock } from './types'

/** Kullanıcının gerçekten gördüğü düz metin. */
export function docVisibleText(doc: Doc): string {
  return doc.blocks
    .filter((b) => b.type !== 'hidden' && b.type !== 'rule')
    .map((b) => {
      if (b.type === 'contact') return b.items.join(' · ')
      if (b.type === 'image') return b.alt
      const parts = [
        'text' in b ? b.text : '',
        'meta' in b && b.meta ? b.meta : '',
        'note' in b && b.note ? b.note : '',
        'price' in b && b.price ? b.price : '',
        'features' in b && b.features ? b.features.join(' · ') : '',
      ]
      return parts.filter(Boolean).join(' · ')
    })
    .join('\n')
    .trim()
}

/** Yalnızca modele görünen, gizlenmiş bloklar. */
export function docHiddenText(doc: Doc): string {
  return doc.blocks
    .filter((b): b is Extract<DocBlock, { type: 'hidden' }> => b.type === 'hidden')
    .map((b) => b.text)
    .join('\n\n')
    .trim()
}

export function docHiddenBlocks(doc: Doc) {
  return doc.blocks.filter(
    (b): b is Extract<DocBlock, { type: 'hidden' }> => b.type === 'hidden',
  )
}

export function hasHidden(doc: Doc): boolean {
  return docHiddenBlocks(doc).length > 0
}
