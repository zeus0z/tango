import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ResultsByTable } from '@/test/supabase-mock'

const hoisted = vi.hoisted(() => ({ results: {} as ResultsByTable }))

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabase-mock')
  return { supabase: createSupabaseMock(hoisted.results) }
})

import { fetchStudyHistory, fetchWeakCards } from './progress.service'

beforeEach(() => {
  for (const key of Object.keys(hoisted.results)) delete hoisted.results[key]
})

const cardMeta = (character: string, romaji: string) => ({
  character,
  romaji,
  group_name: 'Hiragana — Vowels',
  genki_order: 1,
})

/** Build review_logs rows for a card: one per boolean in `outcomes`. */
const logs = (card_id: string, character: string, outcomes: boolean[]) =>
  outcomes.map((was_correct) => ({
    card_id,
    was_correct,
    cards: cardMeta(character, character),
  }))

describe('fetchStudyHistory', () => {
  it('aggregates reviews into per-UTC-day counts, sorted ascending', async () => {
    hoisted.results.review_logs = {
      data: [
        { reviewed_at: '2026-06-03T10:00:00Z' },
        { reviewed_at: '2026-06-01T05:00:00Z' },
        { reviewed_at: '2026-06-01T20:00:00Z' },
      ],
      error: null,
    }

    const history = await fetchStudyHistory('user-1')

    expect(history).toEqual([
      { date: '2026-06-01', count: 2 },
      { date: '2026-06-03', count: 1 },
    ])
  })

  it('throws when Supabase returns an error', async () => {
    hoisted.results.review_logs = { data: null, error: { message: 'fail' } }
    await expect(fetchStudyHistory('user-1')).rejects.toThrow('fail')
  })
})

describe('fetchWeakCards', () => {
  beforeEach(() => {
    // c1: 1/3 correct (0.33), c2: 2/4 (0.5), c3: 1/2 (below default minReviews=3).
    hoisted.results.review_logs = {
      data: [
        ...logs('c1', 'あ', [true, false, false]),
        ...logs('c2', 'い', [true, true, false, false]),
        ...logs('c3', 'う', [true, false]),
      ],
      error: null,
    }
    hoisted.results.user_card_progress = {
      data: [
        { card_id: 'c1', state: 'Review', stability: 10 },
        { card_id: 'c2', state: 'Learning', stability: 2 },
      ],
      error: null,
    }
  })

  it('filters below minReviews, computes accuracy, sorts ascending, joins state', async () => {
    const weak = await fetchWeakCards('user-1')

    // c3 dropped (only 2 reviews); c1 before c2 (lower accuracy first).
    expect(weak.map((w) => w.character)).toEqual(['あ', 'い'])
    expect(weak[0]).toMatchObject({
      card_id: 'c1',
      correct: 1,
      total: 3,
      accuracy: 1 / 3,
      state: 'Review',
      stability: 10,
    })
    expect(weak[1]).toMatchObject({ card_id: 'c2', accuracy: 0.5, state: 'Learning' })
  })

  it('respects the limit argument', async () => {
    const weak = await fetchWeakCards('user-1', 3, 1)
    expect(weak).toHaveLength(1)
    expect(weak[0].character).toBe('あ')
  })

  it('returns null state for a weak card with no progress row', async () => {
    hoisted.results.user_card_progress = { data: [], error: null }
    const weak = await fetchWeakCards('user-1')
    expect(weak[0].state).toBeNull()
    expect(weak[0].stability).toBe(0)
  })
})
