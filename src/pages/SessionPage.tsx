/**
 * SessionPage — /session
 *
 * Entry point for the study session. Reads sessionMode from Zustand store,
 * builds the card queue via TanStack Query, then hands off to SessionCardView.
 *
 * ## Mode handoff contract (PER-14 → PER-15 coordination)
 * PER-15 (home) navigates to /session by calling:
 *   setStudySession(mode, [])   // queue IDs left empty; session builds own queue
 *   navigate('/session')
 * The mode is read from useAppStore(s => s.sessionMode).
 * Fallback: if sessionMode is null, defaults to 'learn'.
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAppStore } from '@/lib/store'
import { useSessionQueueQuery } from '@/features/session/hooks/useSessionQueue'
import { SessionCardView } from '@/features/session'

export default function SessionPage() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const sessionMode = useAppStore((s) => s.sessionMode) ?? 'learn'

  const userId = session?.user.id ?? ''

  const {
    data: queue,
    isLoading,
    isError,
    error,
  } = useSessionQueueQuery({
    userId,
    mode: sessionMode,
    enabled: !!userId,
  })

  // Determine which cards are "new" (unseen) for learned-count tracking.
  // In learn mode the first ≤5 cards were fetched as unseen; we approximate
  // by tagging all cards that came back with state === 'New' or no progress.
  // Since buildLearnQueue puts new cards first, we tag the leading cards
  // up to the NEW_CARDS_PER_SESSION limit.
  const NEW_CARDS_PER_SESSION = 5
  const newCardIds = useMemo<Set<string>>(() => {
    if (!queue || sessionMode !== 'learn') return new Set()
    return new Set(queue.slice(0, NEW_CARDS_PER_SESSION).map((c) => c.id))
  }, [queue, sessionMode])

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
  if (!queue || queue.length === 0) {
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
      <SessionCardView
        initialQueue={queue}
        mode={sessionMode}
        userId={userId}
        newCardIds={newCardIds}
      />
    </PageTransition>
  )
}
