import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Standalone Vitest config for the unit / integration layer.
 *
 * Deliberately does NOT load the PWA or react-compiler plugins from
 * `vite.config.ts` — tests run in jsdom and don't need a service worker or the
 * compiler babel pass. Vitest (src/**) and Playwright (tests/e2e) never overlap.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/lib/fsrs.ts',
        'src/features/**/services/**',
        'src/features/home/hooks/**',
        'src/features/home/components/DailyGoalTracker.tsx',
      ],
    },
  },
})
