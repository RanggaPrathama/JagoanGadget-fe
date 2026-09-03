export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export type ResolvedTheme = Exclude<ThemeMode, "system">;

export const THEME_PRESETS = [
  "default",
  "slate-blue",
  "light-green",
  "graphite-pulse",
  "navy-gold",
  "claude",
  "astro-vista",
  "vercel",
] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

export const DEFAULT_THEME_MODE: ThemeMode = "system";
export const DEFAULT_THEME_PRESET: ThemePreset = "default";

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
  default: "Default",
  vercel: "Vercel",
  claude: "Claude",
  "astro-vista": "Astro Vista",
  "light-green": "Light Green",
  "graphite-pulse": "Graphite Pulse",
  "navy-gold": "Navy Gold",
  "slate-blue": "Slate Blue",
};

export const THEME_PRESET_DOM_VALUES: Record<ThemePreset, string> = {
  default: "default",
  claude: "claude",
  vercel: "vercel",
  "astro-vista": "astro-vista",
  "light-green": "light-green",
  "graphite-pulse": "graphite-pulse",
  "navy-gold": "navy-gold",
  "slate-blue": "slate-blue",
};

export const THEME_PRESET_META_COLORS: Record<
  ThemePreset,
  Record<ResolvedTheme, string>
> = {
  default: {
    light: "#ffffff",
    dark: "#020817",
  },
  vercel: {
    light: "#ffffff",
    dark: "#000000",
  },
  claude: {
    light: "#f7f3eb",
    dark: "#1b1714",
  },

  "astro-vista": {
    light: "#f0f4ff",
    dark: "#0a1a2b",
  },
  "light-green": {
    light: "#f0fff4",
    dark: "#0a1a0b",
  },
  "graphite-pulse": {
    light: "#f5f5f5",
    dark: "#1a1a1a",
  },
  "navy-gold": {
    light: "#f5f5f5",
    dark: "#0a1a2b",
  },
  "slate-blue": {
    light: "#f5f5f5",
    dark: "#0a1a2b",
  },
};

export function isThemeMode(value?: string): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

export function isThemePreset(value?: string): value is ThemePreset {
  return THEME_PRESETS.includes(value as ThemePreset);
}

export const THEME_PRESET_PRIMARY_COLORS: Record<ThemePreset, string> = {
  default: "oklch(0.5771 0.2226 293.44)",
  vercel: "oklch(0 0 0)",
  claude: "oklch(0.6171 0.1375 39.0427)",
  "astro-vista": "oklch(0.642 0.1691 38.5815)",
  "light-green": "oklch(0.8871 0.2122 128.5041)",
  "graphite-pulse": "oklch(0.6893 0.1857 175.19)",
  "navy-gold": "oklch(0.7859 0.1342 83.7)",
  "slate-blue": "oklch(0.5465 0.2213 260.03)",
};

export function getThemeMetaColor(
  resolvedTheme: ResolvedTheme,
  preset: ThemePreset,
) {
  return THEME_PRESET_META_COLORS[preset][resolvedTheme];
}
