/**
 * Progress screen data service.
 *
 * Reads Supabase directly (no Axios). Mirrors the idioms established in
 * src/features/home/services/home.service.ts.
 *
 * Exports:
 *   fetchProgressData     — user_card_progress joined with cards (full detail)
 *   fetchStudyHistory     — per-day review counts from review_logs
 *   fetchWeakCards        — cards with lowest accuracy (correct / total, min 3 reviews)
 */

import { supabase } from '@/lib/supabase'
import type { FsrsState } from '@/types'

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface ProgressRow {
  character: string
  romaji: string
  group_name: string
  genki_order: number
  card_id: string
  state: FsrsState
  stability: number
  due: string
  reps: number
  lapses: number
  last_review: string | null
}

export interface DayCount {
  /** ISO date string YYYY-MM-DD (UTC). */
  date: string
  count: number
}

export interface WeakCardRow {
  card_id: string
  character: string
  romaji: string
  group_name: string
  genki_order: number
  correct: number
  total: number
  accuracy: number
  /** Current FSRS state — may be undefined if the user has no progress row yet. */
  state: FsrsState | null
  stability: number
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/**
 * Full character progress joined with card metadata.
 * Returns one row per card the user has a progress record for.
 */
export async function fetchProgressData(userId: string): Promise<ProgressRow[]> {
  const { data, error } = await supabase
    .from('user_card_progress')
    .select(
      'id, card_id, state, stability, due, reps, lapses, last_review, cards(character, romaji, group_name, genki_order)',
    )
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as Array<{
    id: string
    card_id: string
    state: string
    stability: number
    due: string
    reps: number
    lapses: number
    last_review: string | null
    cards: { character: string; romaji: string; group_name: string; genki_order: number } | { character: string; romaji: string; group_name: string; genki_order: number }[] | null
  }>

  const result: ProgressRow[] = []
  for (const row of rows) {
    if (!row.cards) continue
    const card = Array.isArray(row.cards) ? row.cards[0] : row.cards
    if (!card) continue
    result.push({
      character: card.character,
      romaji: card.romaji,
      group_name: card.group_name,
      genki_order: card.genki_order,
      card_id: row.card_id,
      state: row.state as FsrsState,
      stability: row.stability,
      due: row.due,
      reps: row.reps,
      lapses: row.lapses,
      last_review: row.last_review,
    })
  }
  return result
}

/**
 * Per-day review counts for the last N days (default 84 = 12 weeks).
 * Derived from review_logs.reviewed_at (UTC calendar day grouping).
 */
export async function fetchStudyHistory(
  userId: string,
  days = 84,
): Promise<DayCount[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  since.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('review_logs')
    .select('reviewed_at')
    .eq('user_id', userId)
    .gte('reviewed_at', since.toISOString())
    .order('reviewed_at', { ascending: true })

  if (error) throw new Error(error.message)

  // Aggregate into per-day counts (UTC date)
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as Array<{ reviewed_at: string }>) {
    const d = row.reviewed_at.slice(0, 10) // "YYYY-MM-DD"
    counts[d] = (counts[d] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}

/**
 * Cards with the lowest accuracy rate.
 * Only includes cards with >= minReviews total reviews.
 * Returns up to `limit` rows sorted by accuracy ascending.
 */
export async function fetchWeakCards(
  userId: string,
  minReviews = 3,
  limit = 10,
): Promise<WeakCardRow[]> {
  // Fetch all review_logs for this user with card character info
  const { data: logs, error: logsErr } = await supabase
    .from('review_logs')
    .select('card_id, was_correct, cards(character, romaji, group_name, genki_order)')
    .eq('user_id', userId)

  if (logsErr) throw new Error(logsErr.message)

  // Fetch progress rows for state/stability
  const { data: progressData, error: progressErr } = await supabase
    .from('user_card_progress')
    .select('card_id, state, stability')
    .eq('user_id', userId)

  if (progressErr) throw new Error(progressErr.message)

  const progressByCardId = new Map<string, { state: FsrsState; stability: number }>()
  for (const p of (progressData ?? []) as Array<{ card_id: string; state: string; stability: number }>) {
    progressByCardId.set(p.card_id, { state: p.state as FsrsState, stability: p.stability })
  }

  // Aggregate per card
  const cardMap = new Map<
    string,
    {
      correct: number
      total: number
      character: string
      romaji: string
      group_name: string
      genki_order: number
    }
  >()

  const typedLogs = (logs ?? []) as unknown as Array<{
    card_id: string
    was_correct: boolean
    cards: { character: string; romaji: string; group_name: string; genki_order: number } | { character: string; romaji: string; group_name: string; genki_order: number }[] | null
  }>

  for (const log of typedLogs) {
    if (!log.cards) continue
    const card = Array.isArray(log.cards) ? log.cards[0] : log.cards
    if (!card) continue

    const existing = cardMap.get(log.card_id)
    if (existing) {
      existing.total++
      if (log.was_correct) existing.correct++
    } else {
      cardMap.set(log.card_id, {
        correct: log.was_correct ? 1 : 0,
        total: 1,
        character: card.character,
        romaji: card.romaji,
        group_name: card.group_name,
        genki_order: card.genki_order,
      })
    }
  }

  const result: WeakCardRow[] = []
  for (const [card_id, agg] of cardMap.entries()) {
    if (agg.total < minReviews) continue
    const progress = progressByCardId.get(card_id)
    result.push({
      card_id,
      character: agg.character,
      romaji: agg.romaji,
      group_name: agg.group_name,
      genki_order: agg.genki_order,
      correct: agg.correct,
      total: agg.total,
      accuracy: agg.correct / agg.total,
      state: progress?.state ?? null,
      stability: progress?.stability ?? 0,
    })
  }

  return result
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
}
