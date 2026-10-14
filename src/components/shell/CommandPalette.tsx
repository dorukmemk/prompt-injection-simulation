import { useEffect } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { APPS } from '@/lib/apps'
import { SCENARIOS } from '@/lib/scenarios'
import { useApp } from '@/store/useApp'

export function CommandPalette() {
  const open = useApp((s) => s.spotlight)
  const setOpen = useApp((s) => s.setSpotlight)
  const openApp = useApp((s) => s.openApp)
  const launch = useApp((s) => s.launchScenario)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Ara" description="Uygulama veya senaryo">
      <Command>
        <CommandInput placeholder="Ara…" />
        <CommandList>
        <CommandEmpty>Sonuç yok.</CommandEmpty>
        <CommandGroup heading="Senaryolar">
          {SCENARIOS.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.title} ${s.tags.join(' ')}`}
              onSelect={() => {
                launch(s.id, 'vulnerable')
                setOpen(false)
              }}
            >
              {s.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Uygulamalar">
          {APPS.filter((a) => a.dock).map((a) => (
            <CommandItem
              key={a.id}
              value={a.name}
              onSelect={() => {
                openApp(a.id)
                setOpen(false)
              }}
            >
              <a.icon className="size-4" />
              {a.name}
            </CommandItem>
          ))}
        </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
