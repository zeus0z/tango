/**
 * TanStack Query hooks for the progress screen.
 *
 * useProgressMap   — derives Record<character, MasteryState> + full detail map
 * useStudyHistory  — per-day review counts (last 12 weeks)
 * useWeakCards     — lowest-accuracy cards (min 3 reviews)
 *
 * Query key namespacing:
 *   ['progress', 'map', userId]
 *   ['progress', 'history', userId]
 *   ['progress', 'weak-cards', userId]
 */

import { useQuery } from '@tanstack/react-query'
import { fetchProgressData, fetchStudyHistory, fetchWeakCards } from '../services/progress.service'
import { fsrsStateToMastery } from '@/features/home'
import type { MasteryState } from '@/types'
import type { ProgressRow, DayCount, WeakCardRow } from '../services/progress.service'

// ---------------------------------------------------------------------------
// useProgressMap
// ---------------------------------------------------------------------------

export interface ProgressDetailMap {
  /** character → MasteryState for the alphabet grid */
  mastery: Record<string, MasteryState>
  /** character → full ProgressRow (only characters with a progress record) */
  detail: Record<string, ProgressRow>
}

export function useProgressMap(userId: string | undefined) {
  const { data: rows, isLoading, error } = useQuery({
    queryKey: ['progress', 'map', userId],
    queryFn: () => fetchProgressData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  })

  if (!rows) {
    return {
      data: undefined as ProgressDetailMap | undefined,
      isLoading,
      error: error as Error | null,
    }
  }

  const mastery: Record<string, MasteryState> = {}
  const detail: Record<string, ProgressRow> = {}

  for (const row of rows) {
    mastery[row.character] = fsrsStateToMastery(row.state, row.stability)
    detail[row.character] = row
  }

  return {
    data: { mastery, detail } satisfies ProgressDetailMap,
    isLoading: false,
    error: null,
  }
}

// ---------------------------------------------------------------------------
// useStudyHistory
// ---------------------------------------------------------------------------

export function useStudyHistory(userId: string | undefined) {
  return useQuery<DayCount[], Error>({
    queryKey: ['progress', 'history', userId],
    queryFn: () => fetchStudyHistory(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}

// ---------------------------------------------------------------------------
// useWeakCards
// ---------------------------------------------------------------------------

export function useWeakCards(userId: string | undefined) {
  return useQuery<WeakCardRow[], Error>({
    queryKey: ['progress', 'weak-cards', userId],
    queryFn: () => fetchWeakCards(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}
