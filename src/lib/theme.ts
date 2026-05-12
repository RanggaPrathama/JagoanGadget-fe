export const THEME_MODES = ['light', 'dark', 'system'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export type ResolvedTheme = Exclude<ThemeMode, 'system'>

export const THEME_PRESETS = [
  'default',
  'whatsapp',
  'claude',
  'neobrutalism',
  'astro-vista',
  'light-green',
] as const
export type ThemePreset = (typeof THEME_PRESETS)[number]

export const DEFAULT_THEME_MODE: ThemeMode = 'system'
export const DEFAULT_THEME_PRESET: ThemePreset = 'default'

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
  default: 'Default',
  whatsapp: 'WhatsApp',
  claude: 'Claude',
  neobrutalism: 'Neobrutalism',
  'astro-vista': 'Astro Vista',
  'light-green': 'Light Green'
}

export const THEME_PRESET_DOM_VALUES: Record<ThemePreset, string> = {
  default: 'default',
  whatsapp: 'whatsapp',
  claude: 'claude',
  neobrutalism: 'neobrutualism',
  'astro-vista': 'astro-vista',
  'light-green': 'light-green'
}

export const THEME_PRESET_META_COLORS: Record<
  ThemePreset,
  Record<ResolvedTheme, string>
> = {
  default: {
    light: '#ffffff',
    dark: '#020817',
  },
  whatsapp: {
    light: '#eef7f1',
    dark: '#0b141a',
  },
  claude: {
    light: '#f7f3eb',
    dark: '#1b1714',
  },
  neobrutalism: {
    light: '#fff8e7',
    dark: '#111111',
  },
  'astro-vista': {
    light: '#f0f4ff',
    dark: '#0a1a2b',
  },
  'light-green': {
    light: '#f0fff4',
    dark: '#0a1a0b',
  }
}

export function isThemeMode(value?: string): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode)
}

export function isThemePreset(value?: string): value is ThemePreset {
  return THEME_PRESETS.includes(value as ThemePreset)
}

export function getThemeMetaColor(
  resolvedTheme: ResolvedTheme,
  preset: ThemePreset
) {
  return THEME_PRESET_META_COLORS[preset][resolvedTheme]
}
