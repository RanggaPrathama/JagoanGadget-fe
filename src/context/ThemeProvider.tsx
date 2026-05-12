import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PRESET,
  isThemeMode,
  isThemePreset,
  THEME_PRESET_DOM_VALUES,
  type ResolvedTheme,
  type ThemeMode,
  type ThemePreset,
} from '@/lib/theme'

const THEME_COOKIE_NAME = 'vite-ui-theme'
const THEME_PRESET_COOKIE_NAME = 'vite-ui-theme-preset'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  defaultThemePreset?: ThemePreset
  storageKey?: string
  presetStorageKey?: string
}

type ThemeProviderState = {
  defaultTheme: ThemeMode
  defaultThemePreset: ThemePreset
  resolvedTheme: ResolvedTheme
  theme: ThemeMode
  themePreset: ThemePreset
  setTheme: (theme: ThemeMode) => void
  setThemePreset: (preset: ThemePreset) => void
  resetTheme: () => void
  resetThemePreset: () => void
}

const initialState: ThemeProviderState = {
  defaultTheme: DEFAULT_THEME_MODE,
  defaultThemePreset: DEFAULT_THEME_PRESET,
  resolvedTheme: 'light',
  theme: DEFAULT_THEME_MODE,
  themePreset: DEFAULT_THEME_PRESET,
  setTheme: () => null,
  setThemePreset: () => null,
  resetTheme: () => null,
  resetThemePreset: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME_MODE,
  defaultThemePreset = DEFAULT_THEME_PRESET,
  storageKey = THEME_COOKIE_NAME,
  presetStorageKey = THEME_PRESET_COOKIE_NAME,
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<ThemeMode>(() => {
    const storedTheme = getCookie(storageKey)
    return isThemeMode(storedTheme) ? storedTheme : defaultTheme
  })
  const [themePreset, _setThemePreset] = useState<ThemePreset>(() => {
    const storedPreset = getCookie(presetStorageKey)
    return isThemePreset(storedPreset) ? storedPreset : defaultThemePreset
  })

  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light'

    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return theme
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove('light', 'dark')
      root.classList.add(currentResolvedTheme)
      root.dataset.theme = THEME_PRESET_DOM_VALUES[themePreset]
      root.style.colorScheme = currentResolvedTheme
    }

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        applyTheme(systemTheme)
      }
    }

    applyTheme(resolvedTheme)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme, themePreset])

  const setTheme = (theme: ThemeMode) => {
    setCookie(storageKey, theme, THEME_COOKIE_MAX_AGE)
    _setTheme(theme)
  }

  const setThemePreset = (preset: ThemePreset) => {
    setCookie(presetStorageKey, preset, THEME_COOKIE_MAX_AGE)
    _setThemePreset(preset)
  }

  const resetTheme = () => {
    removeCookie(storageKey)
    _setTheme(defaultTheme)
  }

  const resetThemePreset = () => {
    removeCookie(presetStorageKey)
    _setThemePreset(defaultThemePreset)
  }

  const contextValue = {
    defaultTheme,
    defaultThemePreset,
    resolvedTheme,
    resetTheme,
    resetThemePreset,
    theme,
    themePreset,
    setTheme,
    setThemePreset,
  }

  return (
    <ThemeContext value={contextValue}>{children}</ThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
