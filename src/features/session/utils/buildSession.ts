/**
 * buildSession.ts — Session queue building logic.
 *
 * Implements Learn / Review Recent / Review All modes exactly per
 * docs/DATABASE.md "Session Building Logic". Queries Supabase directly.
 */

import { supabase } from '@/lib/supabase'
import type { Card, ScriptType } from '@/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of new BASE character introductions per Learn session. */
export const NEW_CARDS_PER_SESSION = 5

// ---------------------------------------------------------------------------
// Teaching loop types
// ---------------------------------------------------------------------------

/**
 * A single item in the structured teaching plan for Learn mode.
 *
 * - introduce: Full-screen intro for a single base character.
 * - introduce-pair: Compound-lesson screen for a base + its dakuten/handakuten variant.
 * - drill: A card drill (TypeA = symbol→sound, TypeB = sound→symbol).
 */
export type TeachingItem =
  | { kind: 'introduce'; card: Card }
  | { kind: 'introduce-pair'; card: Card; derivedCard: Card }
  | { kind: 'drill'; card: Card; cardType: 'A' | 'B' }

// ---------------------------------------------------------------------------
// Learn Teaching Mode (PER-23)
// Builds a structured teaching plan:
//   For each new base character (up to NEW_CARDS_PER_SESSION):
//     1. introduce (or introduce-pair if derived exists and not yet seen)
//     2. drill new chars as TypeA
//     3. drill new chars as TypeB
//     4. drill ALL previously taught chars (TypeA + TypeB) cumulatively
//   Finally: weave in FSRS-due cards from prior sessions
// ---------------------------------------------------------------------------

export async function buildLearnTeachingQueue(userId: string): Promise<TeachingItem[]> {
  const now = new Date().toISOString()

  // ------------------------------------------------------------------
  // 1. Get all progress rows for this user (to determine seen/unseen + reps)
  // ------------------------------------------------------------------
  const { data: allProgress, error: progressError } = await supabase
    .from('user_card_progress')
    .select('card_id, reps')
    .eq('user_id', userId)

  if (progressError) throw progressError

  // Map of cardId → reps (reps > 0 means "introduced")
  const progressMap = new Map<string, number>(
    (allProgress ?? []).map((r) => [r.card_id as string, r.reps as number]),
  )

  const seenCardIds = new Set(progressMap.keys())

  // ------------------------------------------------------------------
  // 2. Fetch next N unseen BASE characters (derives_from IS NULL) by genki_order
  // ------------------------------------------------------------------
  let baseQuery = supabase
    .from('cards')
    .select('*')
    .is('derives_from', null)
    .order('genki_order', { ascending: true })
    .limit(NEW_CARDS_PER_SESSION)

  if (seenCardIds.size > 0) {
    baseQuery = baseQuery.not('id', 'in', `(${[...seenCardIds].join(',')})`)
  }

  const { data: newBases, error: basesError } = await baseQuery
  if (basesError) throw basesError

  const newBaseCards = (newBases ?? []) as Card[]

  // ------------------------------------------------------------------
  // 3. Fetch derived variants for the new base chars
  //    (cards where derives_from = base.character)
  // ------------------------------------------------------------------
  const baseCharacters = newBaseCards.map((c) => c.character)
  let derivedCards: Card[] = []
  if (baseCharacters.length > 0) {
    const { data: derived, error: derivedError } = await supabase
      .from('cards')
      .select('*')
      .in('derives_from', baseCharacters)
    if (derivedError) throw derivedError
    derivedCards = (derived ?? []) as Card[]
  }

  // Map: base character → first derived card (there may be multiple, we pick the first by genki_order)
  const derivedByBase = new Map<string, Card>()
  for (const d of derivedCards.sort((a, b) => a.genki_order - b.genki_order)) {
    if (d.derives_from && !derivedByBase.has(d.derives_from)) {
      derivedByBase.set(d.derives_from, d)
    }
  }

  // ------------------------------------------------------------------
  // 4. Fetch FSRS-due cards from PREVIOUSLY taught material (not the new ones)
  // ------------------------------------------------------------------
  const { data: dueProgress, error: dueError } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .lte('due', now)

  if (dueError) throw dueError

  const dueCardIds = (dueProgress ?? []).map((r) => r.card_id as string)
  const newBaseIds = new Set(newBaseCards.map((c) => c.id))
  const newDerivedIds = new Set(derivedCards.map((c) => c.id))

  // Due cards that are not in the newly introduced batch
  const duePriorCardIds = dueCardIds.filter(
    (id) => !newBaseIds.has(id) && !newDerivedIds.has(id),
  )

  let dueCards: Card[] = []
  if (duePriorCardIds.length > 0) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .in('id', duePriorCardIds)
    if (error) throw error
    dueCards = (data ?? []) as Card[]
  }

  // ------------------------------------------------------------------
  // 5. Build the structured teaching plan
  // ------------------------------------------------------------------
  const plan: TeachingItem[] = []

  // Track which cards have been introduced so far this session
  // (for the cumulative drill pass)
  const taughtThisSession: Card[] = []

  for (const base of newBaseCards) {
    const derived = derivedByBase.get(base.character)

    // -- Determine if this is a re-visit pair (both already introduced before)
    const baseIntroduced = (progressMap.get(base.id) ?? 0) > 0
    const derivedIntroduced = derived ? (progressMap.get(derived.id) ?? 0) > 0 : true
    const skipCompound = baseIntroduced && derivedIntroduced

    // Step 1 + 2: Introduce
    if (derived && !skipCompound) {
      plan.push({ kind: 'introduce-pair', card: base, derivedCard: derived })
    } else {
      plan.push({ kind: 'introduce', card: base })
    }

    // Step 3: Drill new chars as TypeA
    plan.push({ kind: 'drill', card: base, cardType: 'A' })
    if (derived) {
      plan.push({ kind: 'drill', card: derived, cardType: 'A' })
    }

    // Step 4: Drill new chars as TypeB
    plan.push({ kind: 'drill', card: base, cardType: 'B' })
    if (derived) {
      plan.push({ kind: 'drill', card: derived, cardType: 'B' })
    }

    // Add this base (and derived if present) to taught-this-session list
    taughtThisSession.push(base)
    if (derived) taughtThisSession.push(derived)

    // Step 5: Cumulative drill of ALL previously taught chars
    // Only run if there are previous chars (i.e. not the very first base)
    const previouslyTaught = taughtThisSession.slice(
      0,
      taughtThisSession.length - (derived ? 2 : 1),
    )
    for (const prev of previouslyTaught) {
      plan.push({ kind: 'drill', card: prev, cardType: 'A' })
      plan.push({ kind: 'drill', card: prev, cardType: 'B' })
    }
  }

  // ------------------------------------------------------------------
  // 6. Final block: FSRS-due cards from prior sessions
  // ------------------------------------------------------------------
  for (const dueCard of dueCards) {
    plan.push({ kind: 'drill', card: dueCard, cardType: 'B' })
  }

  return plan
}

// ---------------------------------------------------------------------------
// Learn Mode (legacy — kept for reference; learn mode now uses buildLearnTeachingQueue)
// 1. Fetch next 5 unseen cards (ordered by genki_order)
// 2. Fetch all due cards (due <= now)
// 3. Merge: new cards first, then due reviews
// ---------------------------------------------------------------------------
export async function buildLearnQueue(userId: string): Promise<Card[]> {
  const now = new Date().toISOString()

  // Subquery: get card IDs that already have progress rows for this user
  const { data: progressRows, error: progressError } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)

  if (progressError) throw progressError

  const seenCardIds = (progressRows ?? []).map((r) => r.card_id as string)

  // Fetch next 5 unseen cards ordered by genki_order
  let unseenQuery = supabase
    .from('cards')
    .select('*')
    .order('genki_order', { ascending: true })
    .limit(5)

  if (seenCardIds.length > 0) {
    unseenQuery = unseenQuery.not('id', 'in', `(${seenCardIds.join(',')})`)
  }

  const { data: unseenCards, error: unseenError } = await unseenQuery
  if (unseenError) throw unseenError

  // Fetch all due cards
  const { data: dueProgress, error: dueError } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .lte('due', now)

  if (dueError) throw dueError

  const dueCardIds = (dueProgress ?? []).map((r) => r.card_id as string)

  let dueCards: Card[] = []
  if (dueCardIds.length > 0) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .in('id', dueCardIds)
    if (error) throw error
    dueCards = (data ?? []) as Card[]
  }

  // Merge: new cards first, then due reviews (no duplicates)
  const newCardIds = new Set((unseenCards ?? []).map((c) => c.id as string))
  const dedupedDue = dueCards.filter((c) => !newCardIds.has(c.id))

  return [...(unseenCards ?? []), ...dedupedDue] as Card[]
}

// ---------------------------------------------------------------------------
// Review Recent Mode
// due <= now AND last_review >= now - 7 days
// ---------------------------------------------------------------------------
export async function buildReviewRecentQueue(userId: string): Promise<Card[]> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: progressRows, error } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .lte('due', now.toISOString())
    .gte('last_review', sevenDaysAgo)

  if (error) throw error

  const cardIds = (progressRows ?? []).map((r) => r.card_id as string)
  if (cardIds.length === 0) return []

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('id', cardIds)

  if (cardsError) throw cardsError
  return (cards ?? []) as Card[]
}

// ---------------------------------------------------------------------------
// Review All Mode
// All due <= now
// ---------------------------------------------------------------------------
export async function buildReviewAllQueue(userId: string): Promise<Card[]> {
  const now = new Date().toISOString()

  const { data: progressRows, error } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .lte('due', now)

  if (error) throw error

  const cardIds = (progressRows ?? []).map((r) => r.card_id as string)
  if (cardIds.length === 0) return []

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('id', cardIds)

  if (cardsError) throw cardsError
  return (cards ?? []) as Card[]
}

// ---------------------------------------------------------------------------
// Infinite Review Mode (PER-26)
// All LEARNT cards (reps > 0) of one script, regardless of due date.
// Pure practice — callers must NOT persist FSRS state for these cards.
// ---------------------------------------------------------------------------
export async function buildInfiniteReviewQueue(
  userId: string,
  script: ScriptType,
): Promise<Card[]> {
  // Learnt = has a progress row with at least one repetition.
  const { data: progressRows, error } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .gt('reps', 0)

  if (error) throw error

  const cardIds = (progressRows ?? []).map((r) => r.card_id as string)
  if (cardIds.length === 0) return []

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('id', cardIds)
    .eq('type', script)
    .order('genki_order', { ascending: true })

  if (cardsError) throw cardsError
  return (cards ?? []) as Card[]
}

/**
 * Count learnt cards (reps > 0) per script for the Infinite Review setup screen.
 * Drives which script options are enabled.
 */
export async function fetchLearntScriptCounts(
  userId: string,
): Promise<Record<ScriptType, number>> {
  const counts: Record<ScriptType, number> = {
    hiragana: 0,
    katakana: 0,
    kanji: 0,
  }

  const { data: progressRows, error } = await supabase
    .from('user_card_progress')
    .select('card_id')
    .eq('user_id', userId)
    .gt('reps', 0)

  if (error) throw error

  const cardIds = (progressRows ?? []).map((r) => r.card_id as string)
  if (cardIds.length === 0) return counts

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('type')
    .in('id', cardIds)

  if (cardsError) throw cardsError

  for (const card of cards ?? []) {
    const type = (card as { type: ScriptType }).type
    if (type in counts) counts[type] += 1
  }

  return counts
}
