import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/toaster'
import { queryClient } from '@/lib/queryClient'
import App from '@/App'
import './index.css'

// ── Japanese fonts ────────────────────────────────────────────────────────
// Noto Sans JP is the default; load it eagerly so the baseline is always
// available. Non-default fonts are lazy-loaded in loadFont() (fonts.ts) on
// first selection. All WOFF2 files land in the Vite build output and are
// therefore included in the PWA service-worker precache.
import '@fontsource/noto-sans-jp/japanese-400.css'
import { loadFont, getPersistedFontId, DEFAULT_FONT_ID } from '@/lib/fonts'

// If the user previously chose a non-default font, register its @font-face
// now so the browser can start fetching the WOFF2 while React mounts.
// The CSS variable is already applied by the inline script in index.html —
// this call just ensures the font-face is registered for that variable to
// resolve correctly.
const _persistedFontId = getPersistedFontId()
if (_persistedFontId !== DEFAULT_FONT_ID) {
  void loadFont(_persistedFontId)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
