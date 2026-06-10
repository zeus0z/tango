/**
 * Test util: a minimal mock of the Supabase JS client for service-layer tests.
 *
 * The real services chain PostgREST builder methods and `await` the result:
 *   await supabase.from('review_logs').select('card_id').eq(...).gte(...)
 *
 * This mock makes `from(table)` return a builder where every chain method
 * returns `this`, and the builder is *thenable* — awaiting it resolves the
 * `{ data, error }` configured for that table. Select/filter arguments are
 * ignored; fixtures just need to match the row shape the code reads.
 *
 * Usage:
 *   vi.mock('@/lib/supabase', () => ({
 *     supabase: createSupabaseMock({
 *       review_logs: { data: [...], error: null },
 *       user_card_progress: { data: [...], error: null },
 *     }),
 *   }))
 */
import { vi } from 'vitest'

export interface QueryResult {
  data: unknown
  error: { message: string } | null
}

export type ResultsByTable = Record<string, QueryResult>

/** Chain methods used across the services — all return the builder itself. */
const CHAIN_METHODS = [
  'select', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
  'in', 'is', 'not', 'match', 'order', 'limit',
] as const

function createBuilder(result: QueryResult): Record<string, unknown> {
  const builder: Record<string, unknown> = {}
  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn(() => builder)
  }
  // Thenable: `await builder` resolves the configured { data, error }.
  builder.then = (resolve: (value: QueryResult) => unknown) => resolve(result)
  return builder
}

export function createSupabaseMock(resultsByTable: ResultsByTable) {
  return {
    from: vi.fn((table: string) =>
      createBuilder(resultsByTable[table] ?? { data: [], error: null }),
    ),
  }
}
