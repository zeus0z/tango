/**
 * useSessionQueue.ts — TanStack Query hooks to build the session card queue.
 *
 * Two hooks:
 *  - useSessionQueueQuery: returns a flat Card[] for review-recent / review-all.
 *  - useTeachingPlanQuery: returns TeachingItem[] for the learn mode teaching loop.
 *
 * Queries Supabase via buildSession utils based on the chosen session mode.
 */

import { useQuery } from '@tanstack/react-query'
import type { SessionMode, ScriptType, Card } from '@/types'
import type { TeachingItem } from '../utils/buildSession'
import {
  buildLearnTeachingQueue,
  buildLearnQueue,
  buildReviewRecentQueue,
  buildReviewAllQueue,
  buildInfiniteReviewQueue,
  fetchLearntScriptCounts,
} from '../utils/buildSession'

interface UseSessionQueueOptions {
  userId: string
  mode: SessionMode
  enabled?: boolean
}

/** Returns flat Card[] — used for review-recent / review-all modes. */
export function useSessionQueueQuery({ userId, mode, enabled = true }: UseSessionQueueOptions) {
  return useQuery<Card[], Error>({
    queryKey: ['session', 'queue', userId, mode],
    queryFn: () => {
      switch (mode) {
        case 'learn':
          return buildLearnQueue(userId)
        case 'review-recent':
          return buildReviewRecentQueue(userId)
        case 'review-all':
          return buildReviewAllQueue(userId)
        default:
          // 'infinite-review' has its own hook (useInfiniteReviewQueue).
          throw new Error(`useSessionQueueQuery does not handle mode: ${mode}`)
      }
    },
    enabled: enabled && !!userId,
    staleTime: 0,
  })
}

interface UseTeachingPlanOptions {
  userId: string
  enabled?: boolean
}

/** Returns TeachingItem[] — used for learn mode's curriculum teaching loop. */
export function useTeachingPlanQuery({ userId, enabled = true }: UseTeachingPlanOptions) {
  return useQuery<TeachingItem[], Error>({
    queryKey: ['session', 'teaching-plan', userId],
    queryFn: () => buildLearnTeachingQueue(userId),
    enabled: enabled && !!userId,
    staleTime: 0,
  })
}

interface UseInfiniteReviewOptions {
  userId: string
  script: ScriptType
  enabled?: boolean
}

/** Returns all learnt Card[] of a script — used for the Infinite Review mode. */
export function useInfiniteReviewQueue({
  userId,
  script,
  enabled = true,
}: UseInfiniteReviewOptions) {
  return useQuery<Card[], Error>({
    queryKey: ['session', 'infinite', userId, script],
    queryFn: () => buildInfiniteReviewQueue(userId, script),
    enabled: enabled && !!userId,
    staleTime: 0,
  })
}

/** Per-script learnt counts — used by the Infinite Review setup screen. */
export function useLearntScriptCounts(userId: string, enabled = true) {
  return useQuery<Record<ScriptType, number>, Error>({
    queryKey: ['session', 'learnt-counts', userId],
    queryFn: () => fetchLearntScriptCounts(userId),
    enabled: enabled && !!userId,
    staleTime: 30_000,
  })
}
