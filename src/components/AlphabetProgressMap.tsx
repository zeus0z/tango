/**
 * AlphabetProgressMap — shared reusable component.
 *
 * Renders all 46 base hiragana in Genki order as a colour-coded grid.
 * Used on:
 *   - /home  (size="sm", non-interactive)
 *   - /progress (size="lg", onCellPress wired)
 *
 * Props:
 *   progress     — Record<character, MasteryState>. Characters absent from
 *                  this map render as 'Unseen' (grey).
 *   size         — 'sm' | 'md' | 'lg'. Controls cell dimensions.
 *   onCellPress  — optional tap handler. When undefined the grid is display-only.
 *
 * Mastery colours (per docs/UI.md):
 *   Unseen   → bg-muted          (grey)
 *   Learning → bg-amber-200      (amber)
 *   Review   → bg-blue-200       (blue)
 *   Mastered → bg-green-300      (green)
 */

import { HIRAGANA } from '@/lib/constants/hiragana'
import type { MasteryState } from '@/types'
import { cn } from '@/lib/utils'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlphabetProgressMapProps {
  /** Character → mastery state. Missing characters default to 'Unseen'. */
  progress: Record<string, MasteryState>
  /** Visual size of each cell. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg'
  /** Optional tap handler — wires up interactive mode (used by A6 Progress). */
  onCellPress?: (character: string) => void
}

// ---------------------------------------------------------------------------
// Colour mapping
// ---------------------------------------------------------------------------

const MASTERY_COLOURS: Record<MasteryState, string> = {
  Unseen: 'bg-muted text-muted-foreground',
  Learning: 'bg-amber-200 text-amber-900',
  Review: 'bg-blue-200 text-blue-900',
  Mastered: 'bg-green-300 text-green-900',
}

// ---------------------------------------------------------------------------
// Cell size classes
// ---------------------------------------------------------------------------

const CELL_SIZES: Record<NonNullable<AlphabetProgressMapProps['size']>, string> = {
  sm: 'h-9 w-9 text-base',   // ~36px — compact for home screen
  md: 'h-11 w-11 text-lg',   // ~44px — default
  lg: 'h-14 w-14 text-2xl',  // ~56px — progress page
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlphabetProgressMap({
  progress,
  size = 'md',
  onCellPress,
}: AlphabetProgressMapProps) {
  const cellSize = CELL_SIZES[size]
  const isInteractive = !!onCellPress

  return (
    <div
      role="grid"
      aria-label={t.alphabet.progressMapAriaLabel}
      className="flex flex-wrap justify-center gap-1.5"
    >
      {HIRAGANA.map(({ character, romaji }) => {
        const mastery: MasteryState = progress[character] ?? 'Unseen'
        const colourClass = MASTERY_COLOURS[mastery]

        return (
          <button
            key={character}
            type="button"
            role="gridcell"
            aria-label={t.alphabet.cellAriaLabel(character, romaji, t.mastery[mastery])}
            disabled={!isInteractive}
            onClick={isInteractive ? () => onCellPress(character) : undefined}
            className={cn(
              'flex items-center justify-center rounded-lg font-ja font-medium',
              'transition-colors duration-150',
              cellSize,
              colourClass,
              isInteractive
                ? 'cursor-pointer active:scale-95 active:brightness-90'
                : 'cursor-default',
              // Disable default button outline when non-interactive
              !isInteractive && 'outline-none focus:outline-none',
            )}
          >
            <span lang="ja">{character}</span>
          </button>
        )
      })}
    </div>
  )
}

export default AlphabetProgressMap
