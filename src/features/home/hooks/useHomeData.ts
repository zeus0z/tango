/**
 * TanStack Query hooks for the home screen.
 *
 * useTodayLearnedCount    — query key ['home', 'learned-today', userId]
 * useCharacterMasteryMap  — query key ['home', 'mastery-map', userId]
 *                           Returns Record<character, MasteryState>
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTodayLearnedCount, fetchCharacterProgress } from '../services/home.service'
import type { MasteryState, FsrsState } from '@/types'

// ---------------------------------------------------------------------------
// FsrsState → MasteryState mapping
// ---------------------------------------------------------------------------

/**
 * Maps FSRS `state` + `stability` to the UI MasteryState for colour-coding.
 *
 *  'New'        → 'Unseen'   (card exists but never reviewed)
 *  'Learning'   → 'Learning' (actively being introduced)
 *  'Relearning' → 'Learning' (lapsed, being re-introduced)
 *  'Review'     → 'Review'   (graduated)
 *  'Review' + stability ≥ 21 days → 'Mastered'
 *
 * Cards with no progress row at all are treated as 'Unseen' by the caller.
 */
const MASTERY_STABILITY_THRESHOLD = 21 // ≥21-day stability → Mastered

export function fsrsStateToMastery(state: FsrsState, stability: number): MasteryState {
  switch (state) {
    case 'New':
      return 'Unseen'
    case 'Learning':
    case 'Relearning':
      return 'Learning'
    case 'Review':
      return stability >= MASTERY_STABILITY_THRESHOLD ? 'Mastered' : 'Review'
    default:
      return 'Unseen'
  }
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Count of unique cards with a correct answer today (UTC day). */
export function useTodayLearnedCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['home', 'learned-today', userId],
    queryFn: () => fetchTodayLearnedCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 min
  })
}

/**
 * Derives Record<character, MasteryState> from user_card_progress joined with cards.
 * Characters absent from the DB default to 'Unseen'.
 */
export function useCharacterMasteryMap(userId: string | undefined): {
  data: Record<string, MasteryState> | undefined
  isLoading: boolean
  error: Error | null
} {
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ['home', 'mastery-map', userId],
    queryFn: () => fetchCharacterProgress(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  })

  const map = useMemo(() => {
    if (!rows) return undefined
    const result: Record<string, MasteryState> = {}
    for (const row of rows) {
      result[row.character] = fsrsStateToMastery(row.state, row.stability)
    }
    return result
  }, [rows])

  if (!map) return { data: undefined, isLoading, error: error as Error | null }

  return { data: map, isLoading: false, error: null }
}
