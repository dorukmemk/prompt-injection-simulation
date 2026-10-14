import { create } from 'zustand'
import type { AppId, ProfileId, VariantId } from '../lib/types'
import { PROFILE_MAP, PROFILES } from '../lib/profiles'
import { SCENARIO_MAP } from '../lib/scenarios'

export type Phase = 'intro' | 'os'
/** 'pending': uygulama “Düşünüyor…” gösterir, kamera henüz dalmamıştır. */
export type SimPhase = 'closed' | 'pending' | 'diving' | 'running' | 'surfacing'
export type SimMode = 'cinematic' | 'interactive'

/** Masaüstünde açılabilen pencereler: senaryo uygulamaları + sistem araçları */
export type WinId = AppId | 'library' | 'settings' | 'academy'

export interface WindowState {
  app: WinId
  z: number
  minimized: boolean
  /** Masaüstündeki konum (yüzde) */
  x: number
  y: number
}

export interface RunState {
  scenarioId: string
  variantId: VariantId
  mode: SimMode
  phase: SimPhase
  playing: boolean
  speed: number
  beat: number
  /** Aktif beat içindeki ilerleme 0..1 */
  progress: number
  /** Etkileşimli modda verilen cevaplar: beatId -> optionId */
  answers: Record<string, string>
  /** Simülasyon tamamlandı mı (yanıt gösterilebilir) */
  finished: boolean
  /** Uygulamada yazılan istem (serbest giriş için) */
  prompt: string
}

interface AppState {
  phase: Phase
  profileId: ProfileId | null
  windows: WindowState[]
  topZ: number
  run: RunState | null
  /** Tamamlanan senaryo+varyant kombinasyonları */
  completed: string[]
  /** Okundu işaretlenen eğitim modülleri */
  readModules: string[]
  reducedMotion: boolean
  highContrast: boolean
  showGlossary: boolean
  spotlight: boolean

  setProfile: (id: ProfileId) => void
  enterOS: () => void
  resetAll: () => void

  openApp: (app: WinId) => void
  closeApp: (app: WinId) => void
  focusApp: (app: WinId) => void
  minimizeApp: (app: WinId) => void
  moveApp: (app: WinId, x: number, y: number) => void

  startRun: (scenarioId: string, variantId: VariantId, mode: SimMode, prompt?: string) => void
  /** Uygulamayı açar, pencere yerleşsin diye bir kare bekler, sonra simülasyonu başlatır. */
  launchScenario: (scenarioId: string, variantId: VariantId, mode?: SimMode) => void
  setSimPhase: (p: SimPhase) => void
  setPlaying: (v: boolean) => void
  togglePlay: () => void
  setSpeed: (v: number) => void
  seekBeat: (i: number) => void
  stepBeat: (d: number) => void
  tick: (dtMs: number) => void
  answer: (beatId: string, optionId: string) => void
  switchVariant: (v: VariantId) => void
  setMode: (m: SimMode) => void
  endRun: () => void
  closeRun: () => void

  markModuleRead: (id: string) => void
  toggleReducedMotion: () => void
  toggleHighContrast: () => void
  setGlossary: (v: boolean) => void
  setSpotlight: (v: boolean) => void
}

const STORAGE_KEY = 'gorunmez-katman:v1'

function persisted(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const d = JSON.parse(raw)
    return {
      profileId: PROFILES.some((p) => p.id === d.profileId) ? d.profileId : null,
      completed: Array.isArray(d.completed) ? d.completed : [],
      readModules: Array.isArray(d.readModules) ? d.readModules : [],
      reducedMotion: !!d.reducedMotion,
      highContrast: !!d.highContrast,
    }
  } catch {
    return {}
  }
}

function save(s: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profileId: s.profileId,
        completed: s.completed,
        readModules: s.readModules,
        reducedMotion: s.reducedMotion,
        highContrast: s.highContrast,
      }),
    )
  } catch {
    /* depolama kullanılamıyorsa sessizce devam et */
  }
}

function beatsOf(run: RunState | null) {
  if (!run) return []
  const sc = SCENARIO_MAP[run.scenarioId]
  if (!sc) return []
  return sc.variants[run.variantId].beats
}

export const useApp = create<AppState>((set, get) => ({
  phase: 'intro',
  profileId: null,
  windows: [],
  topZ: 10,
  run: null,
  completed: [],
  readModules: [],
  reducedMotion: false,
  highContrast: false,
  showGlossary: false,
  spotlight: false,
  ...persisted(),

  setProfile: (id) => {
    set({ profileId: id })
    save(get())
  },
  enterOS: () => set({ phase: 'os' }),
  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* yoksay */
    }
    set({
      phase: 'intro',
      profileId: null,
      windows: [],
      run: null,
      completed: [],
      readModules: [],
      showGlossary: false,
      spotlight: false,
    })
  },

  openApp: (app) =>
    set((s) => {
      const z = s.topZ + 1
      const existing = s.windows.find((w) => w.app === app)
      if (existing) {
        return {
          topZ: z,
          windows: s.windows.map((w) => (w.app === app ? { ...w, z, minimized: false } : w)),
          spotlight: false,
        }
      }
      const n = s.windows.length
      return {
        topZ: z,
        windows: [
          ...s.windows,
          { app, z, minimized: false, x: 8 + ((n * 4) % 16), y: 8 + ((n * 5) % 14) },
        ],
        spotlight: false,
      }
    }),
  closeApp: (app) => set((s) => ({ windows: s.windows.filter((w) => w.app !== app) })),
  focusApp: (app) =>
    set((s) => {
      const z = s.topZ + 1
      return {
        topZ: z,
        windows: s.windows.map((w) => (w.app === app ? { ...w, z, minimized: false } : w)),
      }
    }),
  minimizeApp: (app) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.app === app ? { ...w, minimized: true } : w)),
    })),
  moveApp: (app, x, y) =>
    set((s) => ({ windows: s.windows.map((w) => (w.app === app ? { ...w, x, y } : w)) })),

  startRun: (scenarioId, variantId, mode, prompt) => {
    // Önce uygulamada “Düşünüyor…” görünür; kamera ancak ondan sonra dalar.
    window.setTimeout(() => {
      const r = get().run
      if (r && r.scenarioId === scenarioId && r.phase === 'pending') get().setSimPhase('diving')
    }, 1700)
    set({
      run: {
        scenarioId,
        variantId,
        mode,
        phase: 'pending',
        playing: mode === 'cinematic',
        speed: 1,
        beat: 0,
        progress: 0,
        answers: {},
        finished: false,
        prompt: prompt ?? SCENARIO_MAP[scenarioId]?.userPrompt ?? '',
      },
    })
  },

  launchScenario: (scenarioId, variantId, mode = 'cinematic') => {
    const sc = SCENARIO_MAP[scenarioId]
    if (!sc) return
    get().openApp(sc.app)
    window.setTimeout(() => get().startRun(scenarioId, variantId, mode), 420)
  },

  setSimPhase: (p) => set((s) => (s.run ? { run: { ...s.run, phase: p } } : {})),
  setPlaying: (v) => set((s) => (s.run ? { run: { ...s.run, playing: v } } : {})),
  togglePlay: () => set((s) => (s.run ? { run: { ...s.run, playing: !s.run.playing } } : {})),
  setSpeed: (v) => set((s) => (s.run ? { run: { ...s.run, speed: v } } : {})),

  seekBeat: (i) =>
    set((s) => {
      if (!s.run) return {}
      const beats = beatsOf(s.run)
      const beat = Math.max(0, Math.min(beats.length - 1, i))
      return { run: { ...s.run, beat, progress: 0 } }
    }),
  stepBeat: (d) => get().seekBeat((get().run?.beat ?? 0) + d),

  tick: (dtMs) => {
    const s = get()
    const run = s.run
    if (!run || !run.playing || run.phase !== 'running') return
    const beats = beatsOf(run)
    const current = beats[run.beat]
    if (!current) return

    // Etkileşimli modda cevaplanmamış karar noktasında bekle
    if (
      run.mode === 'interactive' &&
      current.decision &&
      !run.answers[current.id] &&
      run.progress >= 0.55
    ) {
      set({ run: { ...run, progress: 0.55, playing: false } })
      return
    }

    const next = run.progress + (dtMs * run.speed) / current.dur
    if (next < 1) {
      set({ run: { ...run, progress: next } })
      return
    }
    if (run.beat >= beats.length - 1) {
      set({ run: { ...run, progress: 1, playing: false, phase: 'surfacing' } })
      return
    }
    set({ run: { ...run, beat: run.beat + 1, progress: 0 } })
  },

  answer: (beatId, optionId) =>
    set((s) =>
      s.run
        ? { run: { ...s.run, answers: { ...s.run.answers, [beatId]: optionId } } }
        : {},
    ),

  switchVariant: (v) =>
    set((s) =>
      s.run
        ? {
            run: {
              ...s.run,
              variantId: v,
              beat: 0,
              progress: 0,
              answers: {},
              finished: false,
              phase: 'running',
              playing: s.run.mode === 'cinematic',
            },
          }
        : {},
    ),

  setMode: (m) =>
    set((s) => (s.run ? { run: { ...s.run, mode: m, playing: m === 'cinematic' } } : {})),

  endRun: () => {
    const s = get()
    if (!s.run) return
    const key = `${s.run.scenarioId}:${s.run.variantId}`
    const completed = s.completed.includes(key) ? s.completed : [...s.completed, key]
    set({ run: { ...s.run, phase: 'closed', finished: true, playing: false }, completed })
    save(get())
  },

  closeRun: () => set({ run: null }),

  markModuleRead: (id) => {
    set((s) => ({
      readModules: s.readModules.includes(id) ? s.readModules : [...s.readModules, id],
    }))
    save(get())
  },

  toggleReducedMotion: () => {
    set((s) => ({ reducedMotion: !s.reducedMotion }))
    save(get())
  },
  toggleHighContrast: () => {
    set((s) => ({ highContrast: !s.highContrast }))
    save(get())
  },
  setGlossary: (v) => set({ showGlossary: v }),
  setSpotlight: (v) => set({ spotlight: v }),
}))

/** Aktif profil — profil seçilmemişse “üniversite” varsayılanı kullanılır. */
export function useProfile() {
  const id = useApp((s) => s.profileId)
  return PROFILE_MAP[id ?? 'university']
}

export function useScenario() {
  const run = useApp((s) => s.run)
  return run ? SCENARIO_MAP[run.scenarioId] : null
}

export function useVariant() {
  const run = useApp((s) => s.run)
  const sc = useScenario()
  return run && sc ? sc.variants[run.variantId] : null
}

export function useBeats() {
  const v = useVariant()
  return v?.beats ?? []
}

export function useBeat() {
  const run = useApp((s) => s.run)
  const beats = useBeats()
  return run ? beats[run.beat] : undefined
}
