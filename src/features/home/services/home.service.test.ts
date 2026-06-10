import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ResultsByTable } from '@/test/supabase-mock'

// Mutable per-test fixtures, shared with the mocked supabase client.
const hoisted = vi.hoisted(() => ({ results: {} as ResultsByTable }))

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabase-mock')
  return { supabase: createSupabaseMock(hoisted.results) }
})

import { fetchTodayLearnedCount, fetchCharacterProgress } from './home.service'

beforeEach(() => {
  for (const key of Object.keys(hoisted.results)) delete hoisted.results[key]
})

describe('fetchTodayLearnedCount', () => {
  it('dedupes by card_id so a card reviewed twice counts once', async () => {
    hoisted.results.review_logs = {
      data: [{ card_id: 'c1' }, { card_id: 'c1' }, { card_id: 'c2' }],
      error: null,
    }
    expect(await fetchTodayLearnedCount('user-1')).toBe(2)
  })

  it('returns 0 when there are no reviews today', async () => {
    hoisted.results.review_logs = { data: [], error: null }
    expect(await fetchTodayLearnedCount('user-1')).toBe(0)
  })

  it('throws when Supabase returns an error', async () => {
    hoisted.results.review_logs = { data: null, error: { message: 'boom' } }
    await expect(fetchTodayLearnedCount('user-1')).rejects.toThrow('boom')
  })
})

describe('fetchCharacterProgress', () => {
  it('normalizes the cards join (object, single-element array) and skips null', async () => {
    hoisted.results.user_card_progress = {
      data: [
        { stability: 30, state: 'Review', cards: { character: 'あ' } },
        { stability: 5, state: 'Learning', cards: [{ character: 'い' }] },
        { stability: 0, state: 'New', cards: null },
      ],
      error: null,
    }

    const rows = await fetchCharacterProgress('user-1')

    expect(rows).toEqual([
      { character: 'あ', state: 'Review', stability: 30 },
      { character: 'い', state: 'Learning', stability: 5 },
    ])
  })

  it('throws when Supabase returns an error', async () => {
    hoisted.results.user_card_progress = { data: null, error: { message: 'nope' } }
    await expect(fetchCharacterProgress('user-1')).rejects.toThrow('nope')
  })
})
