/**
 * HomePage — the post-login hub at /home.
 *
 * Sections (top to bottom on mobile):
 *   1. Header — greeting with user email initial
 *   2. Milestone banner (conditional) — "You completed the X group!"
 *   3. Daily goal tracker — "X / 5 learned today" with progress bar
 *   4. Alphabet progress map — grid of all 46 hiragana, colour-coded by mastery
 *   5. Session mode selector — Learn / Review All buttons
 *
 * Data:
 *   - learnedToday: count of distinct correct reviews today (UTC day)
 *   - masteryMap: Record<character, MasteryState> derived from user_card_progress
 *
 * Mode handoff: React Router location state — navigate('/session', { state: { mode } })
 * See SessionModeSelector for the full contract documentation.
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useTodayLearnedCount, useCharacterMasteryMap } from '@/features/home/hooks/useHomeData'
import { DailyGoalTracker } from '@/features/home/components/DailyGoalTracker'
import { MilestoneBanner } from '@/features/home/components/MilestoneBanner'
import { SessionModeSelector } from '@/features/home/components/SessionModeSelector'
import { AlphabetProgressMap } from '@/components/AlphabetProgressMap'
import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const { data: learnedToday, isLoading: loadingCount } = useTodayLearnedCount(userId)
  const { data: masteryMap, isLoading: loadingMap } = useCharacterMasteryMap(userId)

  // Greeting initial — first letter of email or a fallback
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-col gap-6 px-4 py-6 pb-safe-bottom">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-baseline gap-2">
                <span lang="ja" className="font-ja text-primary">単語</span>
                <span className="tracking-widest uppercase text-sm">TANGO</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.email ? t.home.signedInAs(user.email) : t.home.loadingUser}
              </p>
            </div>

            {/* Avatar — tapping navigates to the Account page */}
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground active:opacity-80"
              aria-label={t.home.accountMenu}
            >
              {initial}
            </button>
          </header>

          {/* ── Milestone banner (conditional) ─────────────────────────── */}
          {masteryMap && Object.keys(masteryMap).length > 0 && (
            <MilestoneBanner progress={masteryMap} />
          )}

          {/* ── Daily goal tracker ──────────────────────────────────────── */}
          <section aria-labelledby="daily-goal-heading">
            <h2 id="daily-goal-heading" className="sr-only">
              {t.home.dailyGoalHeading}
            </h2>
            <DailyGoalTracker
              learnedToday={learnedToday ?? 0}
              isLoading={loadingCount}
            />
          </section>

          {/* ── Alphabet progress map ───────────────────────────────────── */}
          <section aria-labelledby="progress-map-heading">
            <h2
              id="progress-map-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {t.home.hiraganaProgress}
            </h2>

            {loadingMap ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">{t.home.loadingMap}</p>
              </div>
            ) : (
              <AlphabetProgressMap
                progress={masteryMap ?? {}}
                size="sm"
              />
            )}

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {(
                [
                  { key: 'Unseen', cls: 'bg-muted' },
                  { key: 'Learning', cls: 'bg-amber-200' },
                  { key: 'Review', cls: 'bg-blue-200' },
                  { key: 'Mastered', cls: 'bg-green-300' },
                ] as const
              ).map(({ key, cls }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-sm ${cls}`} aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">{t.mastery[key]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Session mode selector ───────────────────────────────────── */}
          <section aria-labelledby="session-heading">
            <h2 id="session-heading" className="sr-only">
              {t.home.startSession}
            </h2>
            <SessionModeSelector />
          </section>
        </div>
      </Layout>
    </PageTransition>
  )
}
