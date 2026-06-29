import { test, expect } from '@playwright/test'

/**
 * Public routes — reachable with no session. No Supabase mock needed: the
 * landing page is static and the login page only calls Supabase on submit.
 */

test.describe('public routes', () => {
  test('landing page renders hero + CTAs', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Learn Japanese/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Get started/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Log in/i })).toBeVisible()
  })

  test('login page renders Google sign-in', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: /Welcome to Tango/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
  })
})
