import { AnimatePresence } from 'motion/react'
import { useApp, type WindowState } from '@/store/useApp'
import { Wallpaper } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { Dock } from './Dock'
import { DesktopIcons } from './DesktopIcons'
import { CommandPalette } from './CommandPalette'
import { MailWindow } from '@/components/apps/MailWindow'
import { BrowserWindow } from '@/components/apps/BrowserWindow'
import { AgentWindow } from '@/components/apps/AgentWindow'
import { ChatWindow } from '@/components/apps/ChatWindow'
import { LibraryWindow } from '@/components/apps/LibraryWindow'
import { AcademyWindow } from '@/components/apps/AcademyWindow'
import { SettingsWindow } from '@/components/apps/SettingsWindow'

function WindowFor({ win }: { win: WindowState }) {
  switch (win.app) {
    case 'mail':
      return <MailWindow win={win} />
    case 'browser':
      return <BrowserWindow win={win} />
    case 'agent':
      return <AgentWindow win={win} />
    case 'chat':
      return <ChatWindow win={win} />
    case 'academy':
      return <AcademyWindow win={win} />
    case 'library':
      return <LibraryWindow win={win} />
    case 'settings':
      return <SettingsWindow win={win} />
    default:
      return null
  }
}

/** Masaüstü markası — duvar kâğıdına işlenmiş topluluk imzası. */
function Brand() {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid place-items-center select-none"
      aria-hidden
    >
      <span className="text-[clamp(48px,8vw,128px)] leading-none font-bold tracking-[0.06em] opacity-[0.12]">
        GTÜCYBER
      </span>
    </div>
  )
}

export function Desktop() {
  const windows = useApp((s) => s.windows)
  const reduced = useApp((s) => s.reducedMotion)

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Wallpaper dimmed={reduced} />
      <MenuBar />
      <main className="relative min-h-0 flex-1">
        <Brand />
        <DesktopIcons />
        <AnimatePresence>
          {windows.map((w) => (
            <WindowFor key={w.app} win={w} />
          ))}
        </AnimatePresence>
      </main>
      <Dock />
      <CommandPalette />
    </div>
  )
}
