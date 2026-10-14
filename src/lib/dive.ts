/**
 * “Düşünüyor…” göstergesinin ekrandaki konumu.
 * Kameranın tam olarak oraya dalabilmesi için pencere ile simülasyon
 * arasında paylaşılan tek durum budur.
 */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

let origin: Rect | null = null

export function setDiveOrigin(r: Rect) {
  origin = r
}

export function getDiveOrigin(): Rect {
  return (
    origin ?? {
      x: window.innerWidth / 2 - 30,
      y: window.innerHeight / 2 - 30,
      w: 60,
      h: 60,
    }
  )
}
