/**
 * RatingButtons — Hard / Good / Easy rating buttons shown after a correct answer.
 *
 * All three buttons are equal width (flex-1) and equal height (≥56px).
 * Colors follow FSRS semantic intuition: red → Hard, amber → Good, green → Easy.
 */

import type { UIRating } from '@/lib/fsrs'
import { cn } from '@/lib/utils'
import { t } from '@/lib/constants/strings'

interface RatingButtonsProps {
  onRate: (rating: UIRating) => void
  disabled?: boolean
}

export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  return (
    <div className="w-full flex gap-2 px-1 mt-4">
      {/* Hard */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate('Hard')}
        className={cn(
          'flex-1 min-h-[56px] rounded-2xl font-semibold text-sm',
          'bg-red-100 text-red-800 border border-red-200',
          'active:bg-red-200 active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        {t.rating.hard}
      </button>

      {/* Good */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate('Good')}
        className={cn(
          'flex-1 min-h-[56px] rounded-2xl font-semibold text-sm',
          'bg-amber-100 text-amber-800 border border-amber-200',
          'active:bg-amber-200 active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        {t.rating.good}
      </button>

      {/* Easy */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate('Easy')}
        className={cn(
          'flex-1 min-h-[56px] rounded-2xl font-semibold text-sm',
          'bg-green-100 text-green-800 border border-green-200',
          'active:bg-green-200 active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        {t.rating.easy}
      </button>
    </div>
  )
}
