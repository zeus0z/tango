/**
 * buildSession.ts — Session queue building logic.
 *
 * Implements Learn / Review All modes exactly per
 * docs/DATABASE.md "Session Building Logic". Queries Supabase directly.
 */

import { supabase } from '@/lib/supabase'
import type { Card, ScriptType } from '@/types'

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
// Group analysis (curriculum groups, per docs/DATABASE.md "Session Building Logic")
//
// The atomic "learn together / reset together" unit is `cards.group_name`,
// not a fixed count — group sizes vary (vowel/k/s/t/n/h/m-groups = 5,
// y-group = 3, w-group = 2, standalone ん = 1, dakuten/handakuten groups = 5).
// A group is:
//   - 'complete'  — every base card in it has a user_card_progress row
//   - 'partial'   — some but not all of its base cards have a row (abandoned
//                   mid-way through a previous Learn session)
//   - 'untouched' — none of its base cards have a row yet
// ---------------------------------------------------------------------------

type GroupStatus = 'untouched' | 'partial' | 'complete'

interface GroupCheck {
  /** group_name of the first non-complete group by genki_order, or null if every group is done. */
  targetGroup: string | null
  status: GroupStatus
  /**
   * Only populated when status === 'partial': card_ids to wipe — the group's
   * already-seen base cards, plus any already-seen derived/dakuten cards that
   * were introduced alongside them (a derived card's own group_name never
   * becomes a "target group" on its own, since derived cards are excluded
   * from the base-character query and only ever get taught via the
   * introduce-pair step attached to their base).
   */
  affectedCardIds: string[]
  /** cardId → reps, reused by buildLearnTeachingQueue to avoid re-querying. */
  progressMap: Map<string, number>
  /** Full card list, reused by buildLearnTeachingQueue to avoid a second `cards` round-trip. */
  allCards: Card[]
}

/**
 * Fetches all cards + this user's progress once, then walks curriculum
 * groups in genki_order order to find the first one that isn't complete.
 */
async function findTargetGroup(userId: string): Promise<GroupCheck> {
  const { data: allCardsData, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .order('genki_order', { ascending: true })
  if (cardsError) throw cardsError

  const allCards = (allCardsData ?? []) as Card[]

  const { data: allProgress, error: progressError } = await supabase
    .from('user_card_progress')
    .select('card_id, reps')
    .eq('user_id', userId)
  if (progressError) throw progressError

  const progressMap = new Map<string, number>(
    (allProgress ?? []).map((r) => [r.card_id as string, r.reps as number]),
  )
  const seenIds = new Set(progressMap.keys())

  // Group base cards (derives_from IS NULL) by group_name, preserving the
  // order in which each group_name first appears by genki_order.
  const orderedGroupNames: string[] = []
  const basesByGroup = new Map<string, typeof allCards>()
  for (const c of allCards) {
    if (c.derives_from) continue
    if (!basesByGroup.has(c.group_name)) {
      basesByGroup.set(c.group_name, [])
      orderedGroupNames.push(c.group_name)
    }
    basesByGroup.get(c.group_name)!.push(c)
  }

  for (const groupName of orderedGroupNames) {
    const bases = basesByGroup.get(groupName)!
    const seenCount = bases.filter((b) => seenIds.has(b.id)).length
    if (seenCount === bases.length) continue // fully learned — check the next group

    if (seenCount === 0) {
      return { targetGroup: groupName, status: 'untouched', affectedCardIds: [], progressMap, allCards }
    }

    // Partial: sweep the group's seen bases + any seen derived cards taught alongside them.
    const baseCharSet = new Set(bases.map((b) => b.character))
    const affectedCardIds = [
      ...bases.filter((b) => seenIds.has(b.id)).map((b) => b.id),
      ...allCards
        .filter((c) => c.derives_from && baseCharSet.has(c.derives_from) && seenIds.has(c.id))
        .map((c) => c.id),
    ]
    return { targetGroup: groupName, status: 'partial', affectedCardIds, progressMap, allCards }
  }

  return { targetGroup: null, status: 'complete', affectedCardIds: [], progressMap, allCards }
}

/**
 * If the next group to teach was left partially learned by a previous
 * session, wipe its progress (+ review history) so it's taught from scratch
 * as a whole. No-op if the group is untouched or already complete.
 *
 * Must be run as a one-shot step *before* buildLearnTeachingQueue, gated to
 * component mount rather than embedded in a TanStack Query queryFn — see
 * docs/DATABASE.md "Session Building Logic" for why (a window-focus refetch
 * mid-session would otherwise misread "in progress" as "abandoned").
 */
export async function resetAbandonedGroupIfAny(userId: string): Promise<void> {
  const check = await findTargetGroup(userId)
  if (check.status !== 'partial' || check.affectedCardIds.length === 0) return

  const [progressResult, logsResult] = await Promise.all([
    supabase
      .from('user_card_progress')
      .delete()
      .eq('user_id', userId)
      .in('card_id', check.affectedCardIds),
    supabase
      .from('review_logs')
      .delete()
      .eq('user_id', userId)
      .in('card_id', check.affectedCardIds),
  ])

  if (progressResult.error) throw progressResult.error
  if (logsResult.error) throw logsResult.error
}

// ---------------------------------------------------------------------------
// Learn Teaching Mode (PER-23)
// Builds a structured teaching plan for exactly one curriculum group_name:
//     1. introduce (or introduce-pair if derived exists and not yet seen)
//     2. drill new chars as TypeA
//     3. drill new chars as TypeB
//     4. drill ALL previously taught chars (TypeA + TypeB) cumulatively
// New-character teaching only — FSRS-due reviews surface via Review All instead.
// Callers should run resetAbandonedGroupIfAny(userId) first (see above).
// ---------------------------------------------------------------------------

export async function buildLearnTeachingQueue(userId: string): Promise<TeachingItem[]> {
  // ------------------------------------------------------------------
  // 1. Find which curriculum group to teach this session. Reuses the same
  //    cards + progress fetch for steps 2-3 below (see findTargetGroup) —
  //    the mock/live query already returned every card, so there's no need
  //    to re-query 'cards' with a different filter.
  // ------------------------------------------------------------------
  const { targetGroup, progressMap, allCards } = await findTargetGroup(userId)
  if (!targetGroup) return [] // every group already fully learned

  // ------------------------------------------------------------------
  // 2. This group's BASE characters (derives_from IS NULL), by genki_order
  // ------------------------------------------------------------------
  const newBaseCards = allCards
    .filter((c) => c.group_name === targetGroup && !c.derives_from)
    .sort((a, b) => a.genki_order - b.genki_order)

  // ------------------------------------------------------------------
  // 3. Derived variants for these base chars (cards where derives_from = base.character)
  // ------------------------------------------------------------------
  const baseCharSet = new Set(newBaseCards.map((c) => c.character))
  const derivedCards = allCards.filter((c) => c.derives_from && baseCharSet.has(c.derives_from))

  // Map: base character → first derived card (there may be multiple, we pick the first by genki_order)
  const derivedByBase = new Map<string, Card>()
  for (const d of derivedCards.sort((a, b) => a.genki_order - b.genki_order)) {
    if (d.derives_from && !derivedByBase.has(d.derives_from)) {
      derivedByBase.set(d.derives_from, d)
    }
  }

  // ------------------------------------------------------------------
  // 4. Build the structured teaching plan
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

  return plan
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
