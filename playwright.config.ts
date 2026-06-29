import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for Tango.
 *
 * Auth is mocked, not real: the dev server boots with a *dummy* Supabase URL
 * (`https://test.supabase.co`, project ref `test`) so the fixtures in
 * `tests/e2e/fixtures/` can seed a fake session under the matching
 * `sb-test-auth-token` localStorage key and stub all Supabase network. No
 * secrets or live DB required — see docs/TESTING.md.
 *
 * A dedicated port (5179) is used so a real `pnpm dev` on 5173 (which would
 * carry the *real* Supabase ref and break the mock) is never reused.
 */

const PORT = 5179
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `pnpm dev --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
})
