/**
 * RatingButtons — Hard / Good / Easy rating buttons shown after a correct answer.
 *
 * Good is the dominant CTA (primary green, ≥56px).
 * Hard is amber-tinted, Easy is blue-tinted.
 * All buttons are at least 56px tall for comfortable tapping.
 */

import type { UIRating } from '@/lib/fsrs'
import { cn } from '@/lib/utils'

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
          'bg-amber-100 text-amber-800 border border-amber-200',
          'active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        Hard
      </button>

      {/* Good — visually dominant */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate('Good')}
        className={cn(
          'flex-[2] min-h-[56px] rounded-2xl font-bold text-base',
          'bg-primary text-primary-foreground shadow-sm',
          'active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        Good
      </button>

      {/* Easy */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onRate('Easy')}
        className={cn(
          'flex-1 min-h-[56px] rounded-2xl font-semibold text-sm',
          'bg-blue-100 text-blue-800 border border-blue-200',
          'active:scale-95 transition-transform duration-75',
          'disabled:opacity-50 disabled:pointer-events-none',
        )}
      >
        Easy
      </button>
    </div>
  )
}
