import type { Page, Route } from '@playwright/test'

/**
 * Intercepts all Supabase network so authed pages render deterministically
 * without a live backend.
 *
 * - `**\/auth/v1/**` → benign empty responses (token refresh, user, logout).
 * - `**\/rest/v1/<table>*` → JSON fixtures keyed by table name; any table not
 *   listed defaults to `[]`.
 *
 * The default rows below cover what the protected pages read today:
 *   - home.service.ts: `review_logs` (learned-today count), `user_card_progress`
 *     with the embedded `cards(character)` join shape.
 *   - progress.service.ts: `user_card_progress` (+ card metadata), `review_logs`.
 *
 * Pass `overrides` to replace a table's rows for a specific test.
 */

export type TableRows = Record<string, unknown[]>

const card = (character: string, romaji: string, genki_order: number) => ({
  character,
  romaji,
  group_name: 'Hiragana — Vowels',
  genki_order,
})

/** A handful of progress rows so the alphabet map / progress list show content. */
const DEFAULT_PROGRESS = [
  { id: 'p1', card_id: 'c1', state: 'Review', stability: 12.3, due: '2026-06-10T00:00:00Z', reps: 5, lapses: 0, last_review: '2026-06-04T00:00:00Z', cards: card('あ', 'a', 1) },
  { id: 'p2', card_id: 'c2', state: 'Review', stability: 8.1, due: '2026-06-08T00:00:00Z', reps: 4, lapses: 1, last_review: '2026-06-04T00:00:00Z', cards: card('い', 'i', 2) },
  { id: 'p3', card_id: 'c3', state: 'Learning', stability: 1.2, due: '2026-06-05T00:00:00Z', reps: 1, lapses: 0, last_review: '2026-06-05T00:00:00Z', cards: card('う', 'u', 3) },
  { id: 'p4', card_id: 'c4', state: 'New', stability: 0, due: '2026-06-05T00:00:00Z', reps: 0, lapses: 0, last_review: null, cards: card('え', 'e', 4) },
]

/** Review logs dated "today" so the home screen shows a non-zero learned count. */
const DEFAULT_REVIEW_LOGS = [
  { card_id: 'c1', was_correct: true, reviewed_at: new Date().toISOString(), cards: card('あ', 'a', 1) },
  { card_id: 'c2', was_correct: true, reviewed_at: new Date().toISOString(), cards: card('い', 'i', 2) },
  { card_id: 'c3', was_correct: false, reviewed_at: new Date().toISOString(), cards: card('う', 'u', 3) },
]

const DEFAULT_TABLES: TableRows = {
  user_card_progress: DEFAULT_PROGRESS,
  review_logs: DEFAULT_REVIEW_LOGS,
  cards: [card('あ', 'a', 1), card('い', 'i', 2), card('う', 'u', 3), card('え', 'e', 4)],
}

/** Extract the table name from a Supabase REST URL: `/rest/v1/<table>?...`. */
function tableFromUrl(url: string): string | null {
  const match = url.match(/\/rest\/v1\/([^/?]+)/)
  return match ? match[1] : null
}

export async function mockSupabase(page: Page, overrides: TableRows = {}): Promise<void> {
  const tables = { ...DEFAULT_TABLES, ...overrides }

  // Auth endpoints — never hit the real GoTrue server.
  await page.route('**/auth/v1/**', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  )

  // REST (PostgREST) — return fixture rows per table, `[]` for anything unknown.
  await page.route('**/rest/v1/**', (route: Route) => {
    const name = tableFromUrl(route.request().url())
    const rows = (name && tables[name]) || []
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(rows),
    })
  })
}
