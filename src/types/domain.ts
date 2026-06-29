/**
 * Shared domain types for Tango.
 * Mirror the DB migration columns exactly (supabase/migrations/20260529000000_init.sql).
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** FSRS card state — mirrors the `state` column in `user_card_progress`. */
export type FsrsState = 'New' | 'Learning' | 'Review' | 'Relearning'

/** Review rating — mirrors the `rating` column in `review_logs`. */
export type Rating = 'Again' | 'Hard' | 'Good' | 'Easy'

// ---------------------------------------------------------------------------
// DB-mirrored types
// ---------------------------------------------------------------------------

/** Mirrors the `cards` table. */
export interface Card {
  id: string
  character: string
  romaji: string
  type: 'hiragana' | 'katakana' | 'kanji'
  group_name: string
  genki_order: number
  example_word?: string | null
  example_word_romaji?: string | null
  /** PT-BR memory hooks (≈2 per base card), primary first. Derived cards inherit the base's. */
  mnemonics_pt?: string[] | null
  /**
   * Parallel to mnemonics_pt — the exact word/substring to highlight in each entry.
   * An empty string means no highlight for that entry. Null = column absent (old rows).
   */
  mnemonic_keyword?: string[] | null
  derives_from?: string | null
  diacritic?: 'dakuten' | 'handakuten' | null
}

/** Mirrors the `user_card_progress` table (full FSRS state per user per card). */
export interface CardProgress {
  id: string
  user_id: string
  card_id: string
  /** ISO-8601 timestamp — next scheduled review date. */
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: FsrsState
  /** ISO-8601 timestamp or null if the card has never been reviewed. */
  last_review: string | null
}

/** Mirrors the `review_logs` table. Append-only review history. */
export interface ReviewLog {
  id: string
  user_id: string
  card_id: string
  rating: Rating
  /** ISO-8601 timestamp. */
  reviewed_at: string
  was_correct: boolean
}

// ---------------------------------------------------------------------------
// UI-only types (not persisted)
// ---------------------------------------------------------------------------

/**
 * Visual mastery state shown in the progress map.
 * Distinct from FsrsState — this is a UI-level abstraction.
 */
export type MasteryState = 'Unseen' | 'Learning' | 'Review' | 'Mastered'

/** Study session mode selected by the user on the home screen. */
export type SessionMode = 'learn' | 'review-recent' | 'review-all' | 'infinite-review'

/** Writing script a card belongs to — also used to filter Infinite Review. */
export type ScriptType = Card['type']
