/**
 * RomajiGrid — the full romaji sound chart displayed on the back of a Type A card.
 *
 * Layout matches docs/sounds_options.jpeg EXACTLY:
 *  - 10 columns: A / K / S / T / N / H / M / Y / R / W  (col indices 0-9)
 *  - 5 vowel rows: a / i / u / e / o
 *  - 1 special bottom row: lone N (col 0), backspace (cols 6-7, 2-wide),
 *    confirm/checkmark (cols 8-9, 2-wide, blue)
 *
 * Gaps (empty cells) per the screenshot:
 *  - Row i (index 1): Y col (7) empty, W col (9) empty
 *  - Row u (index 2): W col (9) empty
 *  - Row e (index 3): Y col (7) empty, W col (9) empty
 */

import { Delete, Check } from 'lucide-react'
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
// Sub-components
// ---------------------------------------------------------------------------

interface GridKeyProps {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick: () => void
}

function GridKey({ label, selected, disabled, onClick }: GridKeyProps) {
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
        // Colours
        'bg-secondary text-secondary-foreground',
        // Active tap feedback (mobile-first — no hover)
        'active:scale-95 active:bg-secondary/70 transition-transform duration-75',
        // Selected state
        selected && 'ring-2 ring-primary bg-primary/10',
        // Disabled / empty
        disabled && 'invisible pointer-events-none',
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
  /** The romaji value that has been tapped (controlled). */
  selected: string | null
  /** Called with the romaji label when a key is tapped. */
  onSelect: (romaji: string) => void
  /** Called when the confirm (checkmark) key is tapped. */
  onConfirm: () => void
  /** Called when the backspace key is tapped. */
  onBackspace: () => void
  /** Disable all keys (e.g. after answer submitted). */
  disabled?: boolean
}

export function RomajiGrid({
  selected,
  onSelect,
  onConfirm,
  onBackspace,
  disabled = false,
}: RomajiGridProps) {
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
              selected={selected === cell}
              disabled={disabled}
              onClick={() => onSelect(cell)}
            />
          )
        }),
      )}

      {/* ── special bottom row ─────────────────────────────────────────────── */}
      {/* Lone N — col 0 */}
      <GridKey
        label="n"
        selected={selected === 'n'}
        disabled={disabled}
        onClick={() => onSelect('n')}
      />

      {/* Empty spacers — cols 1-5 (5 cells) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`spacer-${i}`} className="min-h-[48px]" />
      ))}

      {/* Backspace — cols 6-7 (span 2) */}
      <button
        type="button"
        disabled={disabled}
        onClick={onBackspace}
        className={cn(
          'col-span-2 flex items-center justify-center',
          'min-h-[48px] rounded-lg',
          'bg-secondary text-secondary-foreground',
          'active:scale-95 active:bg-secondary/70 transition-transform duration-75',
          disabled && 'opacity-50 pointer-events-none',
        )}
        aria-label="Backspace"
      >
        <Delete className="w-5 h-5" />
      </button>

      {/* Confirm — cols 8-9 (span 2, blue) */}
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className={cn(
          'col-span-2 flex items-center justify-center',
          'min-h-[48px] rounded-lg',
          'bg-blue-500 text-white',
          'active:scale-95 active:bg-blue-600 transition-transform duration-75',
          disabled && 'opacity-50 pointer-events-none',
        )}
        aria-label="Confirm"
      >
        <Check className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  )
}
