import { test, expect } from './fixtures/auth'

/**
 * Authenticated /home — the seeded session unlocks the route and the Supabase
 * mock supplies the learned-today count + progress map data.
 */

test.describe('home (authenticated)', () => {
  test('renders the signed-in hub with mocked data', async ({ authedPage }) => {
    await authedPage.goto('/home')

    // Did NOT bounce back to the landing page.
    expect(new URL(authedPage.url()).pathname).toBe('/home')

    // User identity comes from the fake session.
    await expect(authedPage.getByText('tester@tango.app')).toBeVisible()

    // Core sections render.
    await expect(
      authedPage.getByRole('heading', { name: /Hiragana progress/i }),
    ).toBeVisible()
  })
})

test.describe('home with empty review log', () => {
  // Per-describe override of the mock fixtures.
  test.use({ mockTables: { review_logs: [] } })

  test('still renders the hub when nothing learned today', async ({ authedPage }) => {
    await authedPage.goto('/home')
    expect(new URL(authedPage.url()).pathname).toBe('/home')
    await expect(authedPage.getByText('tester@tango.app')).toBeVisible()
  })
})
