/**
 * Japanese font options for the Tango app.
 *
 * Fonts are self-hosted via @fontsource (SIL OFL licensed) using the
 * `japanese-400.css` subset which covers the full Japanese glyph set
 * and uses font-display: swap.
 *
 * The default font (Noto Sans JP) is loaded eagerly in main.tsx.
 * All other fonts are lazy-loaded on first selection via `loadFont()`.
 *
 * All font WOFF2 files end up in the Vite build output and are therefore
 * included in the PWA precache via the existing woff2 glob pattern.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FONT_STORAGE_KEY = 'tango-ja-font'
export const DEFAULT_FONT_ID = 'noto-sans'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FontOption {
  /** Stable identifier stored in localStorage and Zustand. */
  id: string
  /** Label shown in the font picker (pt-BR). */
  label: string
  /** CSS font-family value applied to --font-ja. */
  fontFamily: string
}

// ---------------------------------------------------------------------------
// Available fonts (order = display order in picker)
// ---------------------------------------------------------------------------

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'noto-sans',
    label: 'Padrão',
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
  },
  {
    id: 'klee-one',
    label: 'Livro didático',
    fontFamily: '"Klee One", cursive',
  },
  {
    id: 'noto-serif',
    label: 'Serifado',
    fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
  },
  {
    id: 'm-plus-rounded',
    label: 'Arredondado',
    fontFamily: '"M PLUS Rounded 1c", sans-serif',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set the --font-ja CSS custom property on <html> so all [lang="ja"]
 * elements immediately re-render with the chosen font-family.
 * No React re-render is needed — the CSS cascade handles it.
 */
export function applyFont(fontFamily: string): void {
  document.documentElement.style.setProperty('--font-ja', fontFamily)
}

/**
 * Lazy-import the @font-face CSS for the given font id.
 *
 * Noto Sans JP is loaded eagerly in main.tsx (it's the default), so this
 * is a no-op for 'noto-sans'. All others are dynamic imports so they don't
 * inflate the initial JS bundle — Vite still bundles their WOFF2 files and
 * the PWA service worker precaches them.
 */
export async function loadFont(fontId: string): Promise<void> {
  switch (fontId) {
    case 'noto-sans':
      // Eagerly imported in main.tsx — nothing to do here.
      break
    case 'klee-one':
      await import('@fontsource/klee-one/japanese-400.css')
      break
    case 'noto-serif':
      await import('@fontsource/noto-serif-jp/japanese-400.css')
      break
    case 'm-plus-rounded':
      await import('@fontsource/m-plus-rounded-1c/japanese-400.css')
      break
    default:
      break
  }
}

/**
 * Return the saved font id from localStorage, or the default.
 * Safe to call during module initialisation (before React mounts).
 */
export function getPersistedFontId(): string {
  try {
    return localStorage.getItem(FONT_STORAGE_KEY) ?? DEFAULT_FONT_ID
  } catch {
    return DEFAULT_FONT_ID
  }
}

/**
 * Persist the chosen font id and apply the font-family CSS variable.
 * Call this from the store's setFontId action or directly from a handler.
 */
export function persistAndApply(fontId: string): void {
  const option = FONT_OPTIONS.find((f) => f.id === fontId)
  if (!option) return
  try {
    localStorage.setItem(FONT_STORAGE_KEY, fontId)
  } catch {
    // localStorage unavailable — still apply in-memory
  }
  applyFont(option.fontFamily)
}
