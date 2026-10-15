import { useEffect, useState } from 'react'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { PROFILES } from '@/lib/profiles'
import { APP_MAP } from '@/lib/apps'
import { useApp, useProfile } from '@/store/useApp'
import type { ProfileId } from '@/lib/types'

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 20_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="text-[12.5px] tabular-nums">
      {now.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
      {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

export function MenuBar() {
  const profile = useProfile()
  const setProfile = useApp((s) => s.setProfile)
  const openApp = useApp((s) => s.openApp)
  const closeApp = useApp((s) => s.closeApp)
  const windows = useApp((s) => s.windows)
  const reduced = useApp((s) => s.reducedMotion)
  const contrast = useApp((s) => s.highContrast)
  const toggleReduced = useApp((s) => s.toggleReducedMotion)
  const toggleContrast = useApp((s) => s.toggleHighContrast)
  const resetAll = useApp((s) => s.resetAll)
  const setPalette = useApp((s) => s.setSpotlight)

  const front = [...windows].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0]
  const frontName = front ? APP_MAP[front.app].name : 'Finder'

  return (
    <div className="material-thin relative z-50 flex h-7 shrink-0 items-center justify-between border-b border-white/10 px-2">
      <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-0.5 text-[13px] leading-none">◉</MenubarTrigger>
          <MenubarContent align="start">
            <MenubarItem onClick={() => openApp('settings')}>
              Ayarlar<MenubarShortcut>⌘,</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => openApp('cases')}>Vakalar</MenubarItem>
            <MenubarItem onClick={() => openApp('library')}>Kaynaklar</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={resetAll}>Oturumu kapat</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-0.5 text-[13px] font-semibold">
            {frontName}
          </MenubarTrigger>
          <MenubarContent align="start">
            <MenubarItem disabled={!front} onClick={() => front && closeApp(front.app)}>
              Kapat<MenubarShortcut>⌘W</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-0.5 text-[13px]">Git</MenubarTrigger>
          <MenubarContent align="start">
            {Object.values(APP_MAP)
              .filter((a) => a.dock)
              .map((a) => (
                <MenubarItem key={a.id} onClick={() => openApp(a.id)}>
                  {a.name}
                </MenubarItem>
              ))}
            <MenubarSeparator />
            <MenubarItem onClick={() => setPalette(true)}>
              Ara<MenubarShortcut>⌘K</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-0.5 text-[13px]">Görünüm</MenubarTrigger>
          <MenubarContent align="start">
            <MenubarCheckboxItem checked={reduced} onCheckedChange={toggleReduced}>
              Hareketi azalt
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={contrast} onCheckedChange={toggleContrast}>
              Yüksek kontrast
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="px-2 py-0.5 text-[13px]">Profil</MenubarTrigger>
          <MenubarContent align="start">
            <MenubarRadioGroup
              value={profile.id}
              onValueChange={(v) => setProfile(v as ProfileId)}
            >
              {PROFILES.map((p) => (
                <MenubarRadioItem key={p.id} value={p.id}>
                  {p.name}
                </MenubarRadioItem>
              ))}
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="flex items-center gap-3 pr-1">
        <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
          GTÜCYBER
        </span>
        <span className="text-[12.5px] text-muted-foreground">{profile.glyph}</span>
        <Clock />
      </div>
    </div>
  )
}
