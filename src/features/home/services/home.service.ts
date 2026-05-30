/**
 * Home screen data service — reads Supabase directly (no Axios, per spec).
 *
 * Two queries power the home screen:
 *  1. `fetchTodayLearnedCount` — counts unique cards introduced today
 *     (review_logs WHERE was_correct = true AND reviewed_at >= today UTC midnight).
 *  2. `fetchCharacterProgress` — joins user_card_progress + cards to produce
 *     a list of { character, state, stability } tuples for the progress map.
 *
 * "Learned today" definition: at least one correct review (was_correct = true)
 * in review_logs for today's UTC calendar day. We deduplicate by card_id so
 * each character counts once regardless of how many times it was reviewed.
 */

import { supabase } from '@/lib/supabase'
import type { FsrsState } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an ISO-8601 string for UTC midnight of the current calendar day. */
function todayUtcMidnight(): string {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString()
}

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface CharacterProgressRow {
  character: string
  state: FsrsState
  stability: number
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/**
 * Count of distinct cards where the user saw a correct answer today (UTC day).
 * "Learned today" = ≥1 correct review in review_logs for today.
 */
export async function fetchTodayLearnedCount(userId: string): Promise<number> {
  const since = todayUtcMidnight()

  const { data, error } = await supabase
    .from('review_logs')
    .select('card_id')
    .eq('user_id', userId)
    .eq('was_correct', true)
    .gte('reviewed_at', since)

  if (error) throw new Error(error.message)

  // Deduplicate: each card counts once even if reviewed multiple times today
  const unique = new Set((data ?? []).map((r: { card_id: string }) => r.card_id))
  return unique.size
}

/**
 * Fetch user_card_progress joined with cards to get character + mastery state.
 * Returns rows only for cards the user has encountered (state ≠ 'New' is fine
 * here — even 'New' rows are included so the map can show grey cells).
 *
 * Characters with NO progress row are not returned — the caller defaults them
 * to 'Unseen' when building the mastery map.
 */
export async function fetchCharacterProgress(
  userId: string,
): Promise<CharacterProgressRow[]> {
  const { data, error } = await supabase
    .from('user_card_progress')
    .select('stability, state, cards(character)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  // Supabase infers the foreign-key join as an array type even for many-to-one
  // relations. We cast to unknown first to avoid fighting the generated types.
  const rows = (data ?? []) as unknown as Array<{
    stability: number
    state: string
    cards: { character: string } | { character: string }[] | null
  }>

  const result: CharacterProgressRow[] = []
  for (const row of rows) {
    if (!row.cards) continue
    // Normalise: could be object (1:1) or single-element array (Supabase quirk)
    const cardObj = Array.isArray(row.cards) ? row.cards[0] : row.cards
    if (!cardObj) continue
    result.push({
      character: cardObj.character,
      state: row.state as FsrsState,
      stability: row.stability,
    })
  }
  return result
}
