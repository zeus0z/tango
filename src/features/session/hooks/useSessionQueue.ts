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
import type { SessionMode, Card } from '@/types'
import type { TeachingItem } from '../utils/buildSession'
import {
  buildLearnTeachingQueue,
  buildLearnQueue,
  buildReviewRecentQueue,
  buildReviewAllQueue,
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
