/**
 * SessionPage — /session
 *
 * Entry point for the study session. Reads sessionMode from React Router
 * location state (set by /home's SessionModeSelector), builds the card queue
 * via TanStack Query, then hands off to SessionCardView.
 *
 * Mode handoff contract: React Router location state — one-shot, request-scoped.
 * Defaults to 'learn' on a cold visit (e.g. refresh / direct URL).
 *
 * Learn mode uses the curriculum teaching plan (TeachingItem[]).
 * Review modes use the flat card queue (Card[]).
 */

import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAppStore } from '@/lib/store'
import type { SessionMode, ScriptType } from '@/types'
import {
  useSessionQueueQuery,
  useTeachingPlanQuery,
  useInfiniteReviewQueue,
} from '@/features/session/hooks/useSessionQueue'
import { t } from '@/lib/constants/strings'
import { SessionCardView, InfiniteReviewSessionView } from '@/features/session'

export default function SessionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppStore((s) => s.session)
  const locationState = location.state as
    | { mode?: SessionMode; script?: ScriptType }
    | null
  const sessionMode = locationState?.mode ?? 'learn'
  const script = locationState?.script ?? 'hiragana'

  const userId = session?.user.id ?? ''
  const isLearnMode = sessionMode === 'learn'
  const isInfiniteMode = sessionMode === 'infinite-review'

  // ── Learn mode: fetch teaching plan ──────────────────────────────────────
  const {
    data: teachingPlan,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useTeachingPlanQuery({
    userId,
    enabled: !!userId && isLearnMode,
  })

  // ── Review modes: fetch flat card queue ───────────────────────────────────
  const {
    data: queue,
    isLoading: isQueueLoading,
    isError: isQueueError,
    error: queueError,
  } = useSessionQueueQuery({
    userId,
    mode: sessionMode,
    enabled: !!userId && !isLearnMode && !isInfiniteMode,
  })

  // ── Infinite Review: fetch all learnt cards of the chosen script ──────────
  const {
    data: infiniteQueue,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    error: infiniteError,
  } = useInfiniteReviewQueue({
    userId,
    script,
    enabled: !!userId && isInfiniteMode,
  })

  // New card IDs for review modes (unused in learn mode)
  const newCardIds = useMemo<Set<string>>(() => {
    if (!queue || isLearnMode) return new Set()
    return new Set()
  }, [queue, isLearnMode])

  const isLoading = isLearnMode
    ? isPlanLoading
    : isInfiniteMode
      ? isInfiniteLoading
      : isQueueLoading
  const isError = isLearnMode
    ? isPlanError
    : isInfiniteMode
      ? isInfiniteError
      : isQueueError
  const error = isLearnMode
    ? planError
    : isInfiniteMode
      ? infiniteError
      : queueError

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (!userId) {
    return (
      <PageTransition>
        <div className="flex min-h-svh items-center justify-center">
          <p className="text-muted-foreground text-sm">{t.session.loadingSession}</p>
        </div>
      </PageTransition>
    )
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-svh items-center justify-center">
          <p className="text-muted-foreground text-sm">{t.session.buildingSession}</p>
        </div>
      </PageTransition>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (isError) {
    return (
      <PageTransition>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
          <p className="text-destructive text-sm text-center">
            {t.session.failedToLoad(error?.message ?? t.session.unknownError)}
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="min-h-[48px] px-6 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-95 transition-transform duration-75"
          >
            {t.common.goHome}
          </button>
        </div>
      </PageTransition>
    )
  }

  // ---------------------------------------------------------------------------
  // Empty queue state
  // ---------------------------------------------------------------------------
  const isEmpty = isLearnMode
    ? !teachingPlan || teachingPlan.length === 0
    : isInfiniteMode
      ? !infiniteQueue || infiniteQueue.length === 0
      : !queue || queue.length === 0

  if (isEmpty) {
    return (
      <PageTransition>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
          <p className="text-2xl">🌟</p>
          <h1 className="text-xl font-bold text-foreground text-center">
            {isInfiniteMode
              ? t.session.emptyInfiniteTitle(script)
              : t.session.emptyReviewTitle}
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            {isInfiniteMode
              ? t.session.emptyInfiniteHint
              : t.session.emptyReviewHint}
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-transform duration-75 shadow-sm"
          >
            {t.common.returnHome}
          </button>
        </div>
      </PageTransition>
    )
  }

  // ---------------------------------------------------------------------------
  // Active session
  // ---------------------------------------------------------------------------
  return (
    <PageTransition>
      {isLearnMode && teachingPlan ? (
        <SessionCardView
          mode="learn"
          teachingPlan={teachingPlan}
          userId={userId}
        />
      ) : isInfiniteMode ? (
        infiniteQueue && <InfiniteReviewSessionView cards={infiniteQueue} />
      ) : (
        queue && (
          <SessionCardView
            mode={sessionMode as Exclude<SessionMode, 'learn' | 'infinite-review'>}
            initialQueue={queue}
            userId={userId}
            newCardIds={newCardIds}
          />
        )
      )}
    </PageTransition>
  )
}
