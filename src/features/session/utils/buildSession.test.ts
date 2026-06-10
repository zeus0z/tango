import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ResultsByTable } from '@/test/supabase-mock'

const hoisted = vi.hoisted(() => ({ results: {} as ResultsByTable }))

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabase-mock')
  return { supabase: createSupabaseMock(hoisted.results) }
})

import { buildInfiniteReviewQueue, fetchLearntScriptCounts } from './buildSession'

beforeEach(() => {
  for (const key of Object.keys(hoisted.results)) delete hoisted.results[key]
})

describe('buildInfiniteReviewQueue', () => {
  it('returns the learnt cards for the chosen script', async () => {
    hoisted.results.user_card_progress = {
      data: [{ card_id: 'c1' }, { card_id: 'c2' }],
      error: null,
    }
    hoisted.results.cards = {
      data: [
        { id: 'c1', character: 'あ', romaji: 'a', type: 'hiragana' },
        { id: 'c2', character: 'い', romaji: 'i', type: 'hiragana' },
      ],
      error: null,
    }

    const queue = await buildInfiniteReviewQueue('user-1', 'hiragana')

    expect(queue.map((c) => c.id)).toEqual(['c1', 'c2'])
  })

  it('returns [] when the user has no learnt cards (no progress rows)', async () => {
    hoisted.results.user_card_progress = { data: [], error: null }
    // cards intentionally left undefined — must short-circuit before querying it.

    const queue = await buildInfiniteReviewQueue('user-1', 'hiragana')

    expect(queue).toEqual([])
  })

  it('throws when the progress query errors', async () => {
    hoisted.results.user_card_progress = { data: null, error: { message: 'boom' } }
    await expect(buildInfiniteReviewQueue('user-1', 'hiragana')).rejects.toThrow('boom')
  })

  it('throws when the cards query errors', async () => {
    hoisted.results.user_card_progress = { data: [{ card_id: 'c1' }], error: null }
    hoisted.results.cards = { data: null, error: { message: 'cards-fail' } }
    await expect(buildInfiniteReviewQueue('user-1', 'hiragana')).rejects.toThrow(
      'cards-fail',
    )
  })
})

describe('fetchLearntScriptCounts', () => {
  it('tallies learnt cards per script', async () => {
    hoisted.results.user_card_progress = {
      data: [{ card_id: 'c1' }, { card_id: 'c2' }, { card_id: 'c3' }],
      error: null,
    }
    hoisted.results.cards = {
      data: [
        { type: 'hiragana' },
        { type: 'hiragana' },
        { type: 'katakana' },
      ],
      error: null,
    }

    const counts = await fetchLearntScriptCounts('user-1')

    expect(counts).toEqual({ hiragana: 2, katakana: 1, kanji: 0 })
  })

  it('returns all-zero counts when nothing is learnt', async () => {
    hoisted.results.user_card_progress = { data: [], error: null }

    const counts = await fetchLearntScriptCounts('user-1')

    expect(counts).toEqual({ hiragana: 0, katakana: 0, kanji: 0 })
  })

  it('throws when the progress query errors', async () => {
    hoisted.results.user_card_progress = { data: null, error: { message: 'nope' } }
    await expect(fetchLearntScriptCounts('user-1')).rejects.toThrow('nope')
  })
})
