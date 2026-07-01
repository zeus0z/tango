/**
 * DailyGoalTracker — shows "X / 5 learned today" with a progress bar.
 *
 * Uses the shadcn <Progress> component (thin bar, primary colour fill).
 * Target is 5 cards/day per docs/FEATURES.md §3.
 *
 * Props:
 *   learnedToday — count of distinct correct cards today (from TanStack Query).
 *   isLoading    — show skeleton state while fetching.
 */

import { Progress } from '@/components/ui/progress'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyGoalTrackerProps {
  learnedToday: number
  isLoading?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAILY_GOAL = 5

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DailyGoalTracker({ learnedToday, isLoading = false }: DailyGoalTrackerProps) {
  const pct = Math.min(100, Math.round((learnedToday / DAILY_GOAL) * 100))
  const isGoalMet = learnedToday >= DAILY_GOAL

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {t.home.dailyGoalLabel}
        </p>
        <span
          className={
            isGoalMet
              ? 'text-sm font-semibold text-green-600'
              : 'text-sm font-semibold text-foreground'
          }
        >
          {learnedToday} / {DAILY_GOAL}
        </span>
      </div>

      <Progress
        value={pct}
        className="h-2"
        aria-label={t.home.dailyGoalAriaLabel(learnedToday, DAILY_GOAL)}
      />

      {isGoalMet && (
        <p className="text-xs text-green-600 font-medium">
          {t.home.goalReached}
        </p>
      )}
    </div>
  )
}

export default DailyGoalTracker
