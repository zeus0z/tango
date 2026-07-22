/**
 * useSessionQueue.ts — TanStack Query hooks to build the session card queue.
 *
 * Hooks:
 *  - useSessionQueueQuery: returns a flat Card[] for review-all.
 *  - useTeachingPlanQuery: returns TeachingItem[] for the learn mode teaching loop.
 *  - useResetAbandonedGroup: one-shot pre-check that resets a partially-learned
 *    curriculum group before the teaching plan is built.
 *
 * Queries Supabase via buildSession utils based on the chosen session mode.
 */

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { SessionMode, ScriptType, Card } from '@/types'
import type { TeachingItem } from '../utils/buildSession'
import {
  buildLearnTeachingQueue,
  buildReviewAllQueue,
  buildInfiniteReviewQueue,
  fetchLearntScriptCounts,
  resetAbandonedGroupIfAny,
} from '../utils/buildSession'

/**
 * Runs resetAbandonedGroupIfAny exactly once per userId, gated to mount —
 * deliberately NOT a TanStack Query with staleTime/refetchOnWindowFocus
 * tuning, so a background refocus refetch can never re-trigger it mid-session
 * and misread "in progress" as "abandoned". Returns true once the check has
 * settled (success or failure) and it's safe to build the teaching plan.
 */
export function useResetAbandonedGroup(userId: string, enabled: boolean): boolean {
  const [checked, setChecked] = useState(false)
  const ranForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !userId) return
    if (ranForUserId.current === userId) return
    ranForUserId.current = userId

    resetAbandonedGroupIfAny(userId)
      .catch((err) => {
        console.error('resetAbandonedGroupIfAny failed', err)
      })
      .finally(() => setChecked(true))
  }, [userId, enabled])

  return enabled ? checked : false
}

interface UseSessionQueueOptions {
  userId: string
  mode: SessionMode
  enabled?: boolean
}

/** Returns flat Card[] — used for review-all mode. */
export function useSessionQueueQuery({ userId, mode, enabled = true }: UseSessionQueueOptions) {
  return useQuery<Card[], Error>({
    queryKey: ['session', 'queue', userId, mode],
    queryFn: () => {
      switch (mode) {
        case 'review-all':
          return buildReviewAllQueue(userId)
        default:
          // 'learn' and 'infinite-review' each have their own dedicated hook.
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
