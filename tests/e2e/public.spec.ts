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

  test('login page renders auth tabs + email form', async ({ page }) => {
    await page.goto('/login')

    // Tab toggle + heading ("Sign up" is unique; the signin-tab submit button
    // also reads "Sign in", so assert the card heading instead of that tab).
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()

    // Email + password form
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
  })
})
