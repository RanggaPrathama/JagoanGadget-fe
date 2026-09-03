import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { getThemeMetaColor } from '@/lib/theme'

/**
 * Syncs the <meta name="theme-color"> tag with the current theme.
 * Use once in a layout shell — not in individual theme components.
 */
export function useThemeMetaColor() {
  const { resolvedTheme, themePreset } = useTheme()

  useEffect(() => {
    const meta = document.querySelector("meta[name='theme-color']")
    if (meta) {
      meta.setAttribute('content', getThemeMetaColor(resolvedTheme, themePreset))
    }
  }, [resolvedTheme, themePreset])
}
