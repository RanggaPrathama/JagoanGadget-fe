import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Laptop,
  Moon,
  Palette,
  Sun,
} from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'
import { useTheme } from '@/context/ThemeProvider'
import { THEME_PRESETS, THEME_PRESET_LABELS } from '@/lib/theme'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMe } from '@/hooks/useMe'
import { buildSidebarDataFromMe } from '@/utils/access-control'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme, setThemePreset, theme, themePreset } = useTheme()
  const { open, setOpen } = useSearch()
  const { data } = useMe()
  const sidebarData = data ? buildSidebarDataFromMe(data) : null

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {(sidebarData?.navGroups ?? []).map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {/* A group with its own route (e.g. Dashboard, User) is itself a
                  clickable destination, not just a heading. */}
              {group.url ? (
                <CommandItem
                  key={`${group.url}-group`}
                  value={group.title}
                  onSelect={() => {
                    runCommand(() => navigate({ to: group.url as string }))
                  }}
                >
                  <div className='flex size-4 items-center justify-center'>
                    <ArrowRight className='size-2 text-muted-foreground/80' />
                  </div>
                  {group.title}
                </CommandItem>
              ) : null}
              {group.children.map((navItem, i) => (
                <CommandItem
                  key={`${navItem.url}-${i}`}
                  value={navItem.title}
                  onSelect={() => {
                    runCommand(() => navigate({ to: navItem.url }))
                  }}
                >
                  <div className='flex size-4 items-center justify-center'>
                    <ArrowRight className='size-2 text-muted-foreground/80' />
                  </div>
                  {navItem.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem
              data-checked={theme === 'light'}
              onSelect={() => runCommand(() => setTheme('light'))}
            >
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem
              data-checked={theme === 'dark'}
              onSelect={() => runCommand(() => setTheme('dark'))}
            >
              <Moon className='scale-90' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem
              data-checked={theme === 'system'}
              onSelect={() => runCommand(() => setTheme('system'))}
            >
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='Theme Preset'>
            {THEME_PRESETS.map((preset) => (
              <CommandItem
                key={preset}
                data-checked={themePreset === preset}
                onSelect={() => runCommand(() => setThemePreset(preset))}
              >
                <Palette />
                <span>{THEME_PRESET_LABELS[preset]}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
