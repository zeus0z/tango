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
import type { SessionMode } from '@/types'
import { useSessionQueueQuery, useTeachingPlanQuery } from '@/features/session/hooks/useSessionQueue'
import { SessionCardView } from '@/features/session'

export default function SessionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useAppStore((s) => s.session)
  const sessionMode =
    (location.state as { mode?: SessionMode } | null)?.mode ?? 'learn'

  const userId = session?.user.id ?? ''
  const isLearnMode = sessionMode === 'learn'

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
    enabled: !!userId && !isLearnMode,
  })

  // New card IDs for review modes (unused in learn mode)
  const newCardIds = useMemo<Set<string>>(() => {
    if (!queue || isLearnMode) return new Set()
    return new Set()
  }, [queue, isLearnMode])

  const isLoading = isLearnMode ? isPlanLoading : isQueueLoading
  const isError = isLearnMode ? isPlanError : isQueueError
  const error = isLearnMode ? planError : queueError

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (!userId) {
    return (
      <PageTransition>
        <div className="flex min-h-svh items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading session…</p>
        </div>
      </PageTransition>
    )
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex min-h-svh items-center justify-center">
          <p className="text-muted-foreground text-sm">Building your session…</p>
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
            Failed to load session: {error?.message ?? 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="min-h-[48px] px-6 rounded-xl bg-primary text-primary-foreground font-semibold active:scale-95 transition-transform duration-75"
          >
            Go Home
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
    : !queue || queue.length === 0

  if (isEmpty) {
    return (
      <PageTransition>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
          <p className="text-2xl">🌟</p>
          <h1 className="text-xl font-bold text-foreground text-center">
            Nothing to review right now!
          </h1>
          <p className="text-muted-foreground text-sm text-center">
            Come back later or try a different session mode.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-transform duration-75 shadow-sm"
          >
            Return Home
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
      ) : (
        queue && (
          <SessionCardView
            mode={sessionMode as Exclude<SessionMode, 'learn'>}
            initialQueue={queue}
            userId={userId}
            newCardIds={newCardIds}
          />
        )
      )}
    </PageTransition>
  )
}
