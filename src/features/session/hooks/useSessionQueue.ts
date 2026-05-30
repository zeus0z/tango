/**
 * useSessionQueue.ts — TanStack Query hook to build the session card queue.
 *
 * Queries Supabase via buildSession utils based on the chosen session mode.
 * Returns an ordered Card[] ready to drive the session UI.
 */

import { useQuery } from '@tanstack/react-query'
import type { SessionMode, Card } from '@/types'
import {
  buildLearnQueue,
  buildReviewRecentQueue,
  buildReviewAllQueue,
} from '../utils/buildSession'

interface UseSessionQueueOptions {
  userId: string
  mode: SessionMode
  enabled?: boolean
}

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
    staleTime: 0, // always fresh for a new session
  })
}
