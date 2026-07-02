/**
 * Color theme options for the Tango app.
 *
 * Each theme is a full set of CSS custom-property overrides matching the
 * shadcn/Tailwind token system defined in src/index.css. Applying a theme
 * writes every token onto document.documentElement.style — no React
 * re-render is needed, the CSS cascade handles it (same technique as
 * src/lib/fonts.ts#applyFont, just fanned out over ~20 properties).
 *
 * Persisted to localStorage only (not Supabase) — matches the precedent
 * already shipped by the font picker (PER-40). See docs/CODE_PRACTICES.md.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const THEME_STORAGE_KEY = 'tango-theme'
export const DEFAULT_THEME_ID = 'default'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeId = 'default' | 'midnight' | 'sakura' | 'torii'

/** Every CSS custom property a theme must supply — see src/index.css :root. */
export type ThemeTokenKey =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'card-bg'
  | 'card-bg-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'danger'
  | 'danger-foreground'
  | 'success'
  | 'success-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'

export interface ThemeOption {
  /** Stable identifier stored in localStorage and Zustand. */
  id: ThemeId
  /** Label shown in the theme picker (pt-BR). */
  label: string
  /**
   * Raw hex colors (source palette, dominance/visual order) rendered as a
   * cheap 2x2 swatch cluster in the picker — a thumbnail of the palette's
   * identity, not a literal dump of the applied CSS tokens.
   */
  swatch: [string, string, string, string]
  /** CSS custom-property overrides. Bare key names, no leading "--". */
  tokens: Record<ThemeTokenKey, string>
}

// ---------------------------------------------------------------------------
// Shared constants — feedback colors stay identical across every theme so
// correct/wrong SRS signals remain universally recognizable regardless of
// which theme is active.
// ---------------------------------------------------------------------------

const FEEDBACK_TOKENS = {
  destructive: '0 72% 51%',
  'destructive-foreground': '0 0% 100%',
  danger: '0 72% 51%',
  'danger-foreground': '0 0% 100%',
  success: '142 71% 45%',
  'success-foreground': '0 0% 100%',
} as const

// ---------------------------------------------------------------------------
// Available themes (order = display order in picker)
// ---------------------------------------------------------------------------

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    // "Original", not "Padrão" — the font picker's default option is also
    // labeled "Padrão", and both pickers live on the same Account page.
    label: 'Original',
    // Sourced from https://colorhunt.co/palette/1b4ef53874ff5996fff4ceff —
    // its accent hue (~228°) is nearly identical to the app's shipped
    // --primary, so this theme reuses the current :root values verbatim
    // rather than re-deriving them, avoiding any regression risk on the
    // one theme every existing user already sees.
    swatch: ['#F4CEFF', '#5996FF', '#3874FF', '#1B4EF5'],
    tokens: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      card: '0 0% 98%',
      'card-foreground': '222 47% 11%',
      'card-bg': '0 0% 98%',
      'card-bg-foreground': '220 9% 10%',
      popover: '0 0% 100%',
      'popover-foreground': '222 47% 11%',
      primary: '230 70% 50%',
      'primary-foreground': '0 0% 100%',
      secondary: '220 9% 90%',
      'secondary-foreground': '222 47% 11%',
      accent: '220 9% 95%',
      'accent-foreground': '222 47% 11%',
      muted: '220 9% 90%',
      'muted-foreground': '220 9% 46%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '230 70% 50%',
      'chart-1': '230 70% 50%',
      'chart-2': '142 71% 45%',
      'chart-3': '38 92% 50%',
      'chart-4': '200 80% 50%',
      'chart-5': '0 72% 51%',
      ...FEEDBACK_TOKENS,
    },
  },
  {
    id: 'midnight',
    label: 'Meia-noite',
    // https://colorhunt.co/palette/222831393e4600adb5eeeeee
    swatch: ['#EEEEEE', '#00ADB5', '#393E46', '#222831'],
    tokens: {
      background: '0 0% 97%',
      foreground: '216 18% 16%',
      card: '0 0% 93%',
      'card-foreground': '216 18% 16%',
      'card-bg': '0 0% 93%',
      'card-bg-foreground': '216 18% 16%',
      popover: '0 0% 97%',
      'popover-foreground': '216 18% 16%',
      primary: '183 100% 35%',
      'primary-foreground': '0 0% 100%',
      secondary: '216 10% 90%',
      'secondary-foreground': '216 18% 16%',
      accent: '183 60% 94%',
      'accent-foreground': '183 100% 20%',
      muted: '0 0% 90%',
      'muted-foreground': '216 10% 40%',
      border: '0 0% 85%',
      input: '0 0% 85%',
      ring: '183 100% 35%',
      'chart-1': '183 100% 35%',
      'chart-2': '216 18% 16%',
      'chart-3': '217 10% 25%',
      'chart-4': '0 0% 93%',
      'chart-5': '0 0% 85%',
      ...FEEDBACK_TOKENS,
    },
  },
  {
    id: 'sakura',
    label: 'Sakura',
    // https://colorhunt.co/palette/ffc7c7ffe2e2f6f6f68785a2 — background
    // remapped to the near-white member (#F6F6F6) rather than the palette's
    // literal "most dominant" color (#8785A2, a mid-tone muted purple),
    // keeping this theme reading as a light UI like the other three.
    swatch: ['#F6F6F6', '#FFE2E2', '#FFC7C7', '#8785A2'],
    tokens: {
      background: '0 0% 97%',
      foreground: '244 15% 20%',
      card: '0 45% 96%',
      'card-foreground': '244 15% 20%',
      'card-bg': '0 45% 96%',
      'card-bg-foreground': '244 15% 20%',
      popover: '0 0% 97%',
      'popover-foreground': '244 15% 20%',
      primary: '244 20% 42%',
      'primary-foreground': '0 0% 100%',
      secondary: '0 20% 94%',
      'secondary-foreground': '244 15% 20%',
      accent: '0 100% 92%',
      'accent-foreground': '0 55% 35%',
      muted: '0 0% 93%',
      'muted-foreground': '244 10% 45%',
      border: '0 30% 90%',
      input: '0 30% 90%',
      ring: '244 20% 42%',
      'chart-1': '244 20% 42%',
      'chart-2': '244 15% 20%',
      'chart-3': '0 100% 89%',
      'chart-4': '0 100% 94%',
      'chart-5': '0 0% 93%',
      ...FEEDBACK_TOKENS,
    },
  },
  {
    id: 'torii',
    label: 'Torii',
    // https://colorhunt.co/palette/000000cb2957ddddddeeeeee — red + black
    // reads as the classic torii-gate color pairing, a fitting name for a
    // Japanese-learning app (kept untranslated, like "Sakura").
    swatch: ['#EEEEEE', '#DDDDDD', '#CB2957', '#000000'],
    tokens: {
      background: '0 0% 97%',
      foreground: '0 0% 9%',
      card: '0 0% 93%',
      'card-foreground': '0 0% 9%',
      'card-bg': '0 0% 93%',
      'card-bg-foreground': '0 0% 9%',
      popover: '0 0% 97%',
      'popover-foreground': '0 0% 9%',
      primary: '343 66% 48%',
      'primary-foreground': '0 0% 100%',
      secondary: '0 0% 87%',
      'secondary-foreground': '0 0% 9%',
      accent: '343 60% 95%',
      'accent-foreground': '343 66% 30%',
      muted: '0 0% 90%',
      'muted-foreground': '0 0% 40%',
      border: '0 0% 85%',
      input: '0 0% 85%',
      ring: '343 66% 48%',
      'chart-1': '343 66% 48%',
      'chart-2': '0 0% 9%',
      'chart-3': '0 0% 87%',
      'chart-4': '0 0% 93%',
      'chart-5': '0 0% 90%',
      ...FEEDBACK_TOKENS,
    },
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set every theme token as a CSS custom property on <html>. No React
 * re-render is needed — the CSS cascade handles it, same as applyFont().
 */
export function applyTheme(tokens: Record<ThemeTokenKey, string>): void {
  const root = document.documentElement.style
  for (const [key, value] of Object.entries(tokens)) {
    root.setProperty(`--${key}`, value)
  }
}

/**
 * Return the saved theme id from localStorage, or the default.
 * Safe to call during module initialisation (before React mounts).
 */
export function getPersistedThemeId(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return THEME_OPTIONS.some((t) => t.id === stored) ? (stored as ThemeId) : DEFAULT_THEME_ID
  } catch {
    return DEFAULT_THEME_ID
  }
}

/**
 * Persist the chosen theme id and apply its tokens.
 * Call this from the store's setThemeId action or directly from a handler.
 */
export function persistAndApplyTheme(themeId: ThemeId): void {
  const option = THEME_OPTIONS.find((t) => t.id === themeId)
  if (!option) return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  } catch {
    // localStorage unavailable — still apply in-memory
  }
  applyTheme(option.tokens)
}
