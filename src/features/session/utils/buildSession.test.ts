import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ResultsByTable } from '@/test/supabase-mock'

const hoisted = vi.hoisted(() => ({ results: {} as ResultsByTable }))

vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabase-mock')
  return { supabase: createSupabaseMock(hoisted.results) }
})

import { supabase } from '@/lib/supabase'
import {
  buildInfiniteReviewQueue,
  buildLearnTeachingQueue,
  fetchLearntScriptCounts,
  resetAbandonedGroupIfAny,
} from './buildSession'

beforeEach(() => {
  for (const key of Object.keys(hoisted.results)) delete hoisted.results[key]
  vi.mocked(supabase.from).mockClear()
})

// ---------------------------------------------------------------------------
// Shared curriculum fixture: vowel-group (complete), k-group (target),
// g-group (dakuten of k-group, coupled via derives_from), s-group (next
// group — must never bleed into a k-group session).
// ---------------------------------------------------------------------------
const cardFixture = (
  id: string,
  character: string,
  group_name: string,
  genki_order: number,
  derives_from: string | null = null,
) => ({ id, character, romaji: character, type: 'hiragana', group_name, genki_order, derives_from })

const allCards = [
  cardFixture('v-a', 'あ', 'vowel', 1),
  cardFixture('v-i', 'い', 'vowel', 2),
  cardFixture('v-u', 'う', 'vowel', 3),
  cardFixture('v-e', 'え', 'vowel', 4),
  cardFixture('v-o', 'お', 'vowel', 5),
  cardFixture('k-ka', 'か', 'k-group', 6),
  cardFixture('k-ki', 'き', 'k-group', 7),
  cardFixture('k-ku', 'く', 'k-group', 8),
  cardFixture('k-ke', 'け', 'k-group', 9),
  cardFixture('k-ko', 'こ', 'k-group', 10),
  cardFixture('s-sa', 'さ', 's-group', 11),
  cardFixture('s-shi', 'し', 's-group', 12),
  cardFixture('g-ga', 'が', 'g-group', 47, 'か'),
  cardFixture('g-gi', 'ぎ', 'g-group', 48, 'き'),
]

const vowelSeen = allCards.filter((c) => c.group_name === 'vowel').map((c) => ({ card_id: c.id, reps: 3 }))

describe('resetAbandonedGroupIfAny', () => {
  it('does nothing when the target group is untouched (no delete attempted)', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    hoisted.results.user_card_progress = { data: vowelSeen, error: null } // k-group: 0 seen

    await resetAbandonedGroupIfAny('user-1')

    const tables = vi.mocked(supabase.from).mock.calls.map((c) => c[0])
    expect(tables).toEqual(['cards', 'user_card_progress'])
  })

  it('does nothing when every group is already complete', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    hoisted.results.user_card_progress = {
      data: allCards.map((c) => ({ card_id: c.id, reps: 3 })),
      error: null,
    }

    await resetAbandonedGroupIfAny('user-1')

    const tables = vi.mocked(supabase.from).mock.calls.map((c) => c[0])
    expect(tables).toEqual(['cards', 'user_card_progress'])
  })

  it('wipes a partially-learned group, including its coupled dakuten pair', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    // k-group: か/き seen (く/け/こ not) — abandoned partway.
    // が (dakuten of か) was introduced-paired alongside it and is also seen.
    hoisted.results.user_card_progress = {
      data: [...vowelSeen, { card_id: 'k-ka', reps: 1 }, { card_id: 'k-ki', reps: 1 }, { card_id: 'g-ga', reps: 1 }],
      error: null,
    }

    await resetAbandonedGroupIfAny('user-1')

    const fromMock = vi.mocked(supabase.from).mock
    const tables = fromMock.calls.map((c) => c[0])
    expect(tables).toEqual(['cards', 'user_card_progress', 'user_card_progress', 'review_logs'])

    const progressDeleteBuilder = fromMock.results[2].value as { in: ReturnType<typeof vi.fn> }
    const logsDeleteBuilder = fromMock.results[3].value as { in: ReturnType<typeof vi.fn> }
    expect(progressDeleteBuilder.in.mock.calls[0][1]).toEqual(
      expect.arrayContaining(['k-ka', 'k-ki', 'g-ga']),
    )
    expect(logsDeleteBuilder.in.mock.calls[0][1]).toEqual(
      expect.arrayContaining(['k-ka', 'k-ki', 'g-ga']),
    )
  })

  it('propagates a delete error', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    hoisted.results.user_card_progress = {
      data: [...vowelSeen, { card_id: 'k-ka', reps: 1 }],
      error: null,
    }
    hoisted.results.review_logs = { data: null, error: { message: 'delete-failed' } }

    await expect(resetAbandonedGroupIfAny('user-1')).rejects.toThrow('delete-failed')
  })
})

describe('buildLearnTeachingQueue', () => {
  it('teaches the first incomplete group and never spills into the next group', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    hoisted.results.user_card_progress = { data: vowelSeen, error: null } // k-group untouched

    const plan = await buildLearnTeachingQueue('user-1')

    const charactersTaught = new Set(
      plan.flatMap((item) =>
        item.kind === 'introduce-pair'
          ? [item.card.character, item.derivedCard.character]
          : [item.card.character],
      ),
    )
    expect(charactersTaught).toEqual(new Set(['か', 'き', 'く', 'け', 'こ', 'が', 'ぎ']))
    expect(charactersTaught.has('さ')).toBe(false)
  })

  it('returns an empty plan once every group is complete', async () => {
    hoisted.results.cards = { data: allCards, error: null }
    hoisted.results.user_card_progress = {
      data: allCards.map((c) => ({ card_id: c.id, reps: 3 })),
      error: null,
    }

    const plan = await buildLearnTeachingQueue('user-1')

    expect(plan).toEqual([])
  })
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
