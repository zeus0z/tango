/**
 * fsrs.ts — SRS scheduler setup (ts-fsrs v5)
 *
 * Single source of truth for the FSRS algorithm configuration.
 * Never import `fsrs` / `generatorParameters` anywhere else in the app —
 * use the exports from this module instead.
 */

import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  type Card,
  type Grade,
} from 'ts-fsrs'

// ---------------------------------------------------------------------------
// Singleton scheduler — one instance, one config location.
// ---------------------------------------------------------------------------
const f = fsrs(generatorParameters({ enable_fuzz: true }))

// ---------------------------------------------------------------------------
// UI rating label → ts-fsrs Rating enum
// ---------------------------------------------------------------------------
type UIRating = 'Again' | 'Hard' | 'Good' | 'Easy'

const ratingMap: Record<UIRating, Grade> = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
}

// ---------------------------------------------------------------------------
// scheduleNext
// Given the current FSRS card state and a UI rating, returns the next card
// state ready to be persisted to `user_card_progress`.
// ---------------------------------------------------------------------------
function scheduleNext(card: Card, uiRating: UIRating, now: Date = new Date()): Card {
  const grade: Grade = ratingMap[uiRating]
  // f.repeat returns an IPreview (extends RecordLog) keyed by Grade.
  // Each entry is { card: Card, log: ReviewLog }.
  const scheduling = f.repeat(card, now)
  return scheduling[grade].card
}

// ---------------------------------------------------------------------------
// Re-export what the rest of the app needs
// ---------------------------------------------------------------------------
export { createEmptyCard, ratingMap, scheduleNext }
export type { UIRating, Card, Grade }
