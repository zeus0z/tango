/**
 * RomajiGrid — the full romaji sound chart displayed on the back of a Type A card.
 *
 * Layout matches docs/sounds_options.jpeg EXACTLY:
 *  - 10 columns: A / K / S / T / N / H / M / Y / R / W  (col indices 0-9)
 *  - 5 vowel rows: a / i / u / e / o
 *  - 1 special bottom row: lone N (col 0), empty cols 1-9
 *
 * Gaps (empty cells) per the screenshot:
 *  - Row i (index 1): Y col (7) empty, W col (9) empty
 *  - Row u (index 2): W col (9) empty
 *  - Row e (index 3): Y col (7) empty, W col (9) empty
 *
 * Interaction model (instant-answer):
 *  - Tapping a cell IS the answer — no confirm step.
 *  - Correct tap → cell flashes green, then onAnswer(true) fires.
 *  - Wrong tap → tapped cell flashes red, correct cell flashes green
 *    simultaneously, then onAnswer(false) fires after ~600ms.
 */

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Grid data
// ---------------------------------------------------------------------------

/** null = empty cell (gap in the chart) */
type Cell = string | null

/** Each row is exactly 10 cells (one per consonant column). */
const VOWEL_ROWS: Cell[][] = [
  // col: A      K      S      T      N      H      M      Y      R      W
  ['a',   'ka',  'sa',  'ta',  'na',  'ha',  'ma',  'ya',  'ra',  'wa'],  // a-row
  ['i',   'ki',  'shi', 'chi', 'ni',  'hi',  'mi',  null,  'ri',  null],  // i-row
  ['u',   'ku',  'su',  'tsu', 'nu',  'fu',  'mu',  'yu',  'ru',  null],  // u-row
  ['e',   'ke',  'se',  'te',  'ne',  'he',  'me',  null,  're',  null],  // e-row
  ['o',   'ko',  'so',  'to',  'no',  'ho',  'mo',  'yo',  'ro',  'wo'],  // o-row
]

// ---------------------------------------------------------------------------
// Flash state per cell
// ---------------------------------------------------------------------------

type CellFlash = 'idle' | 'correct' | 'wrong'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface GridKeyProps {
  label: string
  flash: CellFlash
  disabled: boolean
  onClick: () => void
}

function GridKey({ label, flash, disabled, onClick }: GridKeyProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        // Base layout
        'flex items-center justify-center',
        'min-h-[48px] w-full rounded-lg',
        'text-sm font-medium select-none',
        // Colour transitions
        'transition-colors duration-150',
        // Default colours
        flash === 'idle' && 'bg-secondary text-secondary-foreground',
        // Flash states
        flash === 'correct' && 'bg-green-300 text-green-900',
        flash === 'wrong'   && 'bg-red-300 text-red-900',
        // Active tap feedback (only when idle and interactive)
        flash === 'idle' && !disabled && 'active:scale-95 active:bg-secondary/70 transition-transform duration-75',
        // Disabled / no interaction after answer
        disabled && 'pointer-events-none',
      )}
    >
      {label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface RomajiGridProps {
  /** The correct romaji for this card — used to evaluate taps instantly. */
  correctRomaji: string
  /** Called with true/false after the flash animation completes (~600ms). */
  onAnswer: (correct: boolean) => void
}

export function RomajiGrid({ correctRomaji, onAnswer }: RomajiGridProps) {
  /** Map from romaji → flash state. Empty = all idle. */
  const [flashes, setFlashes] = useState<Record<string, CellFlash>>({})
  const [answered, setAnswered] = useState(false)

  const handleTap = useCallback(
    (romaji: string) => {
      if (answered) return

      const correct = romaji === correctRomaji
      setAnswered(true)

      if (correct) {
        setFlashes({ [romaji]: 'correct' })
      } else {
        setFlashes({ [romaji]: 'wrong', [correctRomaji]: 'correct' })
      }

      // Fire onAnswer after the flash animation (~600ms)
      setTimeout(() => {
        setFlashes({})
        setAnswered(false)
        onAnswer(correct)
      }, 600)
    },
    [answered, correctRomaji, onAnswer],
  )

  return (
    <div className="w-full grid grid-cols-10 gap-1 px-1">
      {/* ── vowel rows ─────────────────────────────────────────────────────── */}
      {VOWEL_ROWS.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === null) {
            // Empty gap — invisible placeholder preserving grid structure
            return <div key={`empty-${rowIdx}-${colIdx}`} className="min-h-[48px]" />
          }
          return (
            <GridKey
              key={cell}
              label={cell}
              flash={flashes[cell] ?? 'idle'}
              disabled={answered}
              onClick={() => handleTap(cell)}
            />
          )
        }),
      )}

      {/* ── special bottom row ─────────────────────────────────────────────── */}
      {/* Lone N — col 0 */}
      <GridKey
        label="n"
        flash={flashes['n'] ?? 'idle'}
        disabled={answered}
        onClick={() => handleTap('n')}
      />

      {/* Empty spacers — cols 1-9 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={`spacer-${i}`} className="min-h-[48px]" />
      ))}
    </div>
  )
}
