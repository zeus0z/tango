import { test, expect } from './fixtures/auth'

/**
 * Verifies that every route shows the branded error card (RouteErrorPage) when
 * a component throws during render — not React Router's default error UI.
 *
 * Strategy: intercept the Vite dev-server request for ProgressPage's source
 * module and return a valid ES module that exports a throwing component.
 * Because the import *succeeds* (returns a valid module), lazyWithRetry's
 * .catch() never fires. React renders the throwing component, React Router
 * catches the render error via the route's errorElement, and RouteErrorPage
 * appears. This exercises the errorElement wiring on child routes (PER-32).
 */
test.describe('error boundary', () => {
  test('route component error shows branded error card', async ({ authedPage }) => {
    // Intercept Vite's dev-server response for the ProgressPage source module.
    // Returns a valid ESM default export that throws during React render, so the
    // import resolves but the component errors — triggering the route errorElement.
    await authedPage.route('**/src/pages/ProgressPage.tsx*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/javascript',
        body: 'export default function ProgressPage() { throw new Error("Simulated route error") }',
      })
    })

    await authedPage.goto('/progress')

    // The branded RouteErrorPage card (not React Router's default) should render.
    await expect(
      authedPage.getByRole('heading', { name: /something went wrong/i }),
    ).toBeVisible({ timeout: 8000 })
    await expect(authedPage.getByRole('button', { name: /reload/i })).toBeVisible()
  })
})
