import { test, expect } from '@playwright/test'

/**
 * Proves <ProtectedRoute> actually guards: with no seeded session,
 * `supabase.auth.getSession()` resolves null and the route redirects to `/`.
 * (This is the behaviour the auth fixture's seeded session unlocks elsewhere.)
 */

test.describe('auth guard', () => {
  for (const path of ['/home', '/session', '/progress']) {
    test(`unauthenticated ${path} redirects to landing`, async ({ page }) => {
      await page.goto(path)
      await page.waitForURL('**/')
      expect(new URL(page.url()).pathname).toBe('/')
      await expect(page.getByRole('heading', { name: /Learn Japanese/i })).toBeVisible()
    })
  }
})
