import { test as base, type Page } from '@playwright/test'
import { mockSupabase, type TableRows } from './supabase-mock'

/**
 * Fake Supabase session seeded into localStorage so `<ProtectedRoute>` and
 * `useAuth()` resolve an authenticated user without a backend.
 *
 * `supabase-js` reads the session from `sb-<project-ref>-auth-token`, where the
 * ref is the subdomain of `VITE_SUPABASE_URL`. The Playwright webServer boots
 * the app with `https://test.supabase.co`, so the ref — and therefore the key —
 * is `test`. `getSession()` returns this without any network call because
 * `expires_at` is far in the future.
 */
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export const FAKE_SESSION = {
  access_token: 'fake-access-token',
  token_type: 'bearer',
  expires_in: ONE_YEAR_SECONDS,
  expires_at: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
  refresh_token: 'fake-refresh-token',
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'tester@tango.app',
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    identities: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
}

const STORAGE_KEY = 'sb-test-auth-token'

/** Seed the fake session before any app script runs on the page. */
export async function seedSession(page: Page): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value)
    },
    [STORAGE_KEY, JSON.stringify(FAKE_SESSION)] as const,
  )
}

/**
 * Extended test exposing an `authedPage`: a page that already has the fake
 * session seeded and all Supabase network stubbed with default fixtures.
 * Use the plain `page` for public/unauthenticated scenarios.
 */
export const test = base.extend<{ authedPage: Page; mockTables: TableRows }>({
  // Per-test override hook: `test.use({ mockTables: { review_logs: [] } })`.
  mockTables: [{}, { option: true }],

  authedPage: async ({ page, mockTables }, use) => {
    await seedSession(page)
    await mockSupabase(page, mockTables)
    await use(page)
  },
})

export { expect } from '@playwright/test'
