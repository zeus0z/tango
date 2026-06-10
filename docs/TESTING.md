# TESTING.md — Automated tests & screenshots

Tango has two test layers:

| Layer | Tool | Runs in | Use for |
|---|---|---|---|
| **Unit / integration** | Vitest + React Testing Library | jsdom (no browser) | Pure logic (FSRS scheduling), service transforms, prop-driven components. Fast — gates every PR. |
| **End-to-end** | Playwright | Real Chromium | Whole-app user flows + screenshots of every screen. |

Rule of thumb: many cheap Vitest tests for logic; a few Playwright tests for flows.

---

# Unit & integration (Vitest + RTL)

## Commands

| Command | What it does |
|---|---|
| `pnpm test` | Run all unit/integration tests once (used in CI) |
| `pnpm test:watch` | Re-run on change |
| `pnpm test:coverage` | Run with a V8 coverage report (`coverage/`, gitignored) |

Tests are **co-located** next to source as `*.test.ts(x)` and run in **jsdom** via
`vitest.config.ts` (standalone — it skips the PWA/react-compiler plugins). The build
ignores them: `tsconfig.app.json` excludes `*.test.*` + `src/test`, so `pnpm build`
stays clean.

## What's covered

- **FSRS scheduling** — `src/lib/fsrs.test.ts` pins `scheduleNext` state transitions
  and due-date ordering. The scheduler uses `enable_fuzz: true`, so tests assert on
  **state / direction**, never exact intervals.
- **Mastery mapping** — `useHomeData.test.ts` covers `fsrsStateToMastery` (incl. the
  ≥21-day "Mastered" threshold).
- **Service transforms** — `home.service.test.ts` + `progress.service.test.ts` assert
  dedup, the `cards`-join normalization, per-day aggregation, and weak-card
  accuracy/filter/sort. They mock only the Supabase boundary.
- **Component** — `DailyGoalTracker.test.tsx` is the canonical RTL example.

## Mocking Supabase in service tests

Services chain PostgREST builders and `await` the result. `src/test/supabase-mock.ts`
exposes `createSupabaseMock(resultsByTable)`: `from(table)` returns a chainable,
*thenable* builder that resolves the `{ data, error }` configured for that table.
Wire it per-file with `vi.hoisted` + `vi.mock('@/lib/supabase', …)` and mutate the
fixtures in `beforeEach` (see the service test files for the pattern).

`src/test/setup.ts` registers `@testing-library/jest-dom` matchers and cleans up RTL
renders after each test.

> Deferred: `buildSession.ts` calls the same table multiple times per function, which
> the table-keyed mock can't disambiguate — needs a call-sequence mock or a small
> refactor. Not covered yet.

---

# End-to-end (Playwright)

Playwright drives a real browser and captures screenshots of every screen without
manually running the app.

## Commands

| Command | What it does |
|---|---|
| `pnpm test:e2e` | Run all specs headless across both projects |
| `pnpm test:e2e:ui` | Open the Playwright UI runner (watch/debug) |
| `pnpm screenshots` | Capture every route × viewport into `screenshots/` |
| `pnpm exec playwright show-report` | Open the last HTML report |

Playwright auto-starts the dev server (`webServer` in `playwright.config.ts`) on a
dedicated port (**5179**), so you don't need `pnpm dev` running. First-time setup:
`pnpm exec playwright install chromium`.

## Where things land

| Output | Path | Tracked? |
|---|---|---|
| HTML test report | `playwright-report/` | gitignored |
| Failure screenshots / traces / videos | `test-results/` | gitignored |
| Intentional screenshots | `screenshots/<route>-<project>.png` | gitignored |

To commit screenshots into the repo (e.g. for design review), drop `/screenshots`
from `.gitignore`.

## Targets (projects)

Two Chromium projects, matching the mobile-first PWA:
- `mobile-chromium` — Pixel 5 viewport
- `desktop-chromium` — Desktop Chrome viewport

## Auth is mocked — no backend, no secrets

Only `/` and `/login` are public; `/home`, `/session`, `/progress` are behind
`<ProtectedRoute>` (reads the Supabase session). Tests **never** touch a real
Supabase project:

1. The webServer boots the app with a **dummy** Supabase URL
   (`https://test.supabase.co`, project ref `test`) — see `playwright.config.ts`.
2. `tests/e2e/fixtures/auth.ts` seeds a fake session into
   `localStorage['sb-test-auth-token']` (the key `supabase-js` derives from that
   ref) with a far-future `expires_at`, so `getSession()` returns it with **no
   network call** and the route guard renders.
3. `tests/e2e/fixtures/supabase-mock.ts` intercepts `**/rest/v1/**` and
   `**/auth/v1/**`, returning JSON fixtures per table (`user_card_progress`,
   `review_logs`, …) so pages render deterministic data.

### Writing an authenticated test

```ts
import { test, expect } from './fixtures/auth'

test('home renders', async ({ authedPage }) => {
  await authedPage.goto('/home')
  await expect(authedPage.getByText('tester@tango.app')).toBeVisible()
})
```

Use the plain `page` (from `@playwright/test`) for public/unauthenticated cases.
Override mock data per-describe with `test.use({ mockTables: { review_logs: [] } })`.

## Files

```
playwright.config.ts          # projects, webServer (dummy env), reporters
tests/e2e/
  fixtures/auth.ts            # FAKE_SESSION, seedSession, authedPage fixture
  fixtures/supabase-mock.ts   # mockSupabase() — REST/auth interception + fixtures
  public.spec.ts             # landing + login (no auth)
  auth-guard.spec.ts         # protected routes redirect when unauthenticated
  home.spec.ts               # authed /home with mocked data
  screenshots.spec.ts        # @screenshot — capture every route × viewport
```

## CI

Not wired in yet (local-only by choice). To add later: a job that runs
`pnpm exec playwright install --with-deps chromium` + `pnpm test:e2e` and uploads
`playwright-report/` as an artifact. The mock-auth approach means **no Supabase
secrets are needed** in CI.
