/**
 * WeakCardsList — characters with the lowest accuracy rate.
 *
 * Only shows cards with >= 3 reviews (small samples excluded).
 * Each row: character (lang="ja"), romaji, accuracy %, state pill.
 * Tapping a row → opens the CharacterDetailDialog.
 *
 * Mobile-first: full-width list, tap targets ≥ 48px.
 */

import { cn } from '@/lib/utils'
import type { MasteryState } from '@/types'
import type { WeakCardRow } from '../services/progress.service'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeakCardsListProps {
  rows: WeakCardRow[]
  masteryMap: Record<string, MasteryState>
  onCharacterPress: (character: string) => void
}

// ---------------------------------------------------------------------------
// Mastery pill colours
// ---------------------------------------------------------------------------

const MASTERY_PILL: Record<MasteryState, string> = {
  Unseen: 'bg-muted text-muted-foreground',
  Learning: 'bg-amber-200 text-amber-900',
  Review: 'bg-blue-200 text-blue-900',
  Mastered: 'bg-green-300 text-green-900',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WeakCardsList({
  rows,
  masteryMap,
  onCharacterPress,
}: WeakCardsListProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        {t.weakCards.noWeakCards}
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
      {rows.map((row) => {
        const mastery: MasteryState = masteryMap[row.character] ?? 'Unseen'
        const accuracyPct = Math.round(row.accuracy * 100)
        // Colour code accuracy: red < 50%, amber 50-75%, green > 75%
        const accuracyColour =
          accuracyPct < 50
            ? 'text-red-600'
            : accuracyPct < 75
              ? 'text-amber-600'
              : 'text-green-600'

        return (
          <button
            key={row.card_id}
            type="button"
            onClick={() => onCharacterPress(row.character)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-left w-full',
              'min-h-[48px]', // ≥48px tap target
              'bg-background active:bg-muted/50 transition-colors duration-150',
            )}
            aria-label={t.weakCards.characterAriaLabel(row.character, row.romaji, accuracyPct)}
          >
            {/* Character */}
            <span lang="ja" className="font-ja text-2xl font-medium w-8 text-center">
              {row.character}
            </span>

            {/* Romaji + group */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground">{row.romaji}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {row.group_name.replace('-group', ' group')}
              </span>
            </div>

            {/* Accuracy */}
            <span className={cn('text-sm font-bold tabular-nums', accuracyColour)}>
              {accuracyPct}%
            </span>

            {/* State pill */}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                MASTERY_PILL[mastery],
              )}
            >
              {t.mastery[mastery]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
