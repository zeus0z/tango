/**
 * StudyHeatmap — GitHub-style calendar heatmap of daily review activity.
 *
 * Renders the last 12 weeks (84 days) in a grid:
 *   - Columns = weeks (Sunday → Saturday)
 *   - Colour scale: muted grey for 0, then F1 primary green at increasing opacity
 *
 * Hand-rolled CSS grid — no charting library needed.
 * Mobile-first: scrolls horizontally if needed (unlikely at 390px+).
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { DayCount } from '../services/progress.service'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StudyHeatmapProps {
  data: DayCount[]
  weeks?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns "YYYY-MM-DD" for a given Date (UTC). */
function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Maps a review count to a Tailwind colour class. */
function countToColour(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count < 5) return 'bg-green-200'
  if (count < 10) return 'bg-green-300'
  if (count < 20) return 'bg-green-400'
  return 'bg-green-500'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StudyHeatmap({ data, weeks = 12 }: StudyHeatmapProps) {
  const totalDays = weeks * 7

  // Build a lookup: date string → count
  const countMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const { date, count } of data) {
      map[date] = count
    }
    return map
  }, [data])

  // Build the grid: a 2D array [week][dayOfWeek], starting from the most
  // recent Sunday that is >= totalDays ago.
  const { grid, monthLabels } = useMemo(() => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Find the Sunday at or before (today - totalDays + 1)
    const startDay = new Date(today)
    startDay.setUTCDate(startDay.getUTCDate() - totalDays + 1)
    // Roll back to Sunday
    startDay.setUTCDate(startDay.getUTCDate() - startDay.getUTCDay())

    const weeksArr: Array<Array<{ dateStr: string; count: number; isToday: boolean; isFuture: boolean }>> = []
    const todayStr = toUtcDateString(today)
    const seenMonths = new Set<string>()
    const monthLabelsArr: Array<{ label: string; weekIndex: number }> = []

    const cursor = new Date(startDay)
    while (weeksArr.length < weeks) {
      const week: typeof weeksArr[0] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = toUtcDateString(cursor)
        const isFuture = cursor > today
        week.push({
          dateStr,
          count: countMap[dateStr] ?? 0,
          isToday: dateStr === todayStr,
          isFuture,
        })

        // Track month labels for the first day of each month visible
        const monthKey = dateStr.slice(0, 7) // "YYYY-MM"
        if (!seenMonths.has(monthKey) && cursor.getUTCDate() <= 7) {
          seenMonths.add(monthKey)
          monthLabelsArr.push({
            label: t.heatmap.months[cursor.getUTCMonth()],
            weekIndex: weeksArr.length,
          })
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }
      weeksArr.push(week)
    }

    return { grid: weeksArr, monthLabels: monthLabelsArr }
  }, [countMap, weeks, totalDays])

  const totalReviews = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Month labels */}
      <div className="flex pl-7 gap-0">
        {grid.map((_, wi) => {
          const label = monthLabels.find((m) => m.weekIndex === wi)
          return (
            <div key={wi} className="w-[14px] flex-shrink-0 mx-px">
              {label ? (
                <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                  {label.label}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Grid body: day labels + cells */}
      <div className="flex gap-1">
        {/* Day-of-week labels (2ª, 4ª, 6ª only) */}
        <div className="flex flex-col gap-px mt-px">
          {(t.heatmap.dayLabels as readonly string[]).map((label) => (
            <div key={label} className="h-[14px] w-5 flex items-center justify-end pr-1">
              {(t.heatmap.displayedDays as readonly string[]).includes(label) ? (
                <span className="text-[9px] text-muted-foreground">{label[0]}</span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Weeks columns */}
        <div className="flex gap-px overflow-x-auto">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-px">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={t.heatmap.cellTooltip(day.dateStr, day.count)}
                  className={cn(
                    'h-[14px] w-[14px] rounded-sm flex-shrink-0',
                    day.isFuture
                      ? 'bg-transparent'
                      : countToColour(day.count),
                    day.isToday && 'ring-1 ring-primary ring-offset-1',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground text-right pr-1">
        {t.heatmap.summary(totalReviews, weeks)}
      </p>
    </div>
  )
}
