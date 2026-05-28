import { useEffect } from 'react'
import { Laptop, Moon, Palette, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeProvider'
import {
  getThemeMetaColor,
  THEME_PRESETS,
  THEME_PRESET_LABELS,
  type ThemeMode,
  type ThemePreset,
} from '@/lib/theme'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ThemeSwitchProps = {
  compact?: boolean
}

export function ThemeSwitch({ compact = false }: ThemeSwitchProps) {
  const { resolvedTheme, setTheme, setThemePreset, theme, themePreset } =
    useTheme()

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        getThemeMetaColor(resolvedTheme, themePreset)
      )
    }
  }, [resolvedTheme, themePreset])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={compact ? 'size-9 rounded-full p-0' : 'scale-95 gap-2 rounded-full px-3'}
        >
          <Palette className='size-4 text-primary' />
          {!compact ? (
            <>
              <span className='hidden lg:inline'>{THEME_PRESET_LABELS[themePreset]}</span>
              <span className='hidden text-[10px] uppercase text-muted-foreground sm:inline'>
                {theme === 'system' ? 'sys' : theme}
              </span>
            </>
          ) : null}
          <span className='sr-only'>Select theme preset and color mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64 min-w-64'>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as ThemeMode)}
        >
          <DropdownMenuRadioItem value='light'>
            <Sun className='size-4' />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='dark'>
            <Moon className='size-4' />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='system'>
            <Laptop className='size-4' />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme Preset</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={themePreset}
          onValueChange={(value) => setThemePreset(value as ThemePreset)}
        >
          {THEME_PRESETS.map((preset) => (
            <DropdownMenuRadioItem key={preset} value={preset}>
              <span
                className='size-3 rounded-full border border-border'
                style={{
                  backgroundColor: getThemeMetaColor(resolvedTheme, preset),
                }}
              />
              {THEME_PRESET_LABELS[preset]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
