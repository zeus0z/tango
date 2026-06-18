import { describe, it, expect, vi } from 'vitest'

// Importing './useHomeData' transitively pulls in home.service -> lib/supabase,
// which calls createClient() at module load. Mock it so this file doesn't need
// VITE_SUPABASE_URL to be set (e.g. in CI, where there's no .env.local).
vi.mock('@/lib/supabase', async () => {
  const { createSupabaseMock } = await import('@/test/supabase-mock')
  return { supabase: createSupabaseMock({}) }
})

import { fsrsStateToMastery } from './useHomeData'

/**
 * Pure mapping from FSRS state (+ stability) to the UI mastery colour bucket.
 * The ≥21-day stability threshold is the only non-obvious branch.
 */
describe('fsrsStateToMastery', () => {
  it('maps New → Unseen', () => {
    expect(fsrsStateToMastery('New', 0)).toBe('Unseen')
  })

  it('maps Learning and Relearning → Learning', () => {
    expect(fsrsStateToMastery('Learning', 1.5)).toBe('Learning')
    expect(fsrsStateToMastery('Relearning', 3)).toBe('Learning')
  })

  it('maps Review below the threshold → Review', () => {
    expect(fsrsStateToMastery('Review', 20.999)).toBe('Review')
  })

  it('maps Review at/above 21-day stability → Mastered', () => {
    expect(fsrsStateToMastery('Review', 21)).toBe('Mastered')
    expect(fsrsStateToMastery('Review', 100)).toBe('Mastered')
  })
})
