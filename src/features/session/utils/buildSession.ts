/**
 * buildSession.ts — Session queue building logic.
 *
 * Implements Learn / Review Recent / Review All modes exactly per
 * docs/DATABASE.md "Session Building Logic". Queries Supabase directly.
 */

import { supabase } from '@/lib/supabase'
import type { Card } from '@/types'

// ---------------------------------------------------------------------------
// Learn Mode
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
