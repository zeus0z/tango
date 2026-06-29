/**
 * persistReview.ts — Persists a card review result to Supabase.
 *
 * Writes/upserts user_card_progress (full FSRS state) and appends a review_logs row.
 * Never partial updates — always persist the complete FSRS card state.
 */

import { createEmptyCard, State } from 'ts-fsrs'
import { supabase } from '@/lib/supabase'
import { scheduleNext } from '@/lib/fsrs'
import type { Card as FsrsCard } from '@/lib/fsrs'
import type { UIRating } from '@/lib/fsrs'
import type { CardProgress, FsrsState } from '@/types'

// ---------------------------------------------------------------------------
// Map FsrsState string → ts-fsrs State enum number
// ---------------------------------------------------------------------------
const fsrsStateMap: Record<FsrsState, State> = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
}

// ---------------------------------------------------------------------------
// Fetch existing FSRS card state from user_card_progress, or return null
// ---------------------------------------------------------------------------
export async function fetchCardProgress(
  userId: string,
  cardId: string,
): Promise<CardProgress | null> {
  const { data, error } = await supabase
    .from('user_card_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle()

  if (error) throw error
  return data as CardProgress | null
}

// ---------------------------------------------------------------------------
// Convert DB CardProgress row → ts-fsrs Card
// ---------------------------------------------------------------------------
export function dbProgressToFsrsCard(progress: CardProgress): FsrsCard {
  const emptyCard = createEmptyCard()
  return {
    ...emptyCard,
    due: new Date(progress.due),
    stability: progress.stability,
    difficulty: progress.difficulty,
    elapsed_days: progress.elapsed_days,
    scheduled_days: progress.scheduled_days,
    reps: progress.reps,
    lapses: progress.lapses,
    state: fsrsStateMap[progress.state] ?? State.New,
    last_review: progress.last_review ? new Date(progress.last_review) : new Date(0),
  }
}

// ---------------------------------------------------------------------------
// Map ts-fsrs State enum (number) → DB FsrsState string
// ---------------------------------------------------------------------------
function stateToString(state: State): FsrsState {
  switch (state) {
    case State.New:
      return 'New'
    case State.Learning:
      return 'Learning'
    case State.Review:
      return 'Review'
    case State.Relearning:
      return 'Relearning'
    default:
      return 'New'
  }
}

// ---------------------------------------------------------------------------
// persistReview
// Given a user, card, rating and optional existing progress:
// 1. Run FSRS scheduling
// 2. Upsert user_card_progress
// 3. Insert review_logs row
// ---------------------------------------------------------------------------
export async function persistReview(
  userId: string,
  cardId: string,
  uiRating: UIRating,
  existingProgress: CardProgress | null,
): Promise<void> {
  // Build the current FSRS card state
  const fsrsCard: FsrsCard = existingProgress
    ? dbProgressToFsrsCard(existingProgress)
    : createEmptyCard()

  const now = new Date()
  const nextCard = scheduleNext(fsrsCard, uiRating, now)

  const wasCorrect = uiRating !== 'Again'

  // Upsert full FSRS state — all fields, no partial updates
  const { error: upsertError } = await supabase.from('user_card_progress').upsert(
    {
      user_id: userId,
      card_id: cardId,
      due: nextCard.due.toISOString(),
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      elapsed_days: nextCard.elapsed_days,
      scheduled_days: nextCard.scheduled_days,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
      state: stateToString(nextCard.state),
      last_review: now.toISOString(),
    },
    { onConflict: 'user_id,card_id' },
  )

  if (upsertError) throw upsertError

  // Append review log
  const { error: logError } = await supabase.from('review_logs').insert({
    user_id: userId,
    card_id: cardId,
    rating: uiRating,
    reviewed_at: now.toISOString(),
    was_correct: wasCorrect,
  })

  if (logError) throw logError
}
