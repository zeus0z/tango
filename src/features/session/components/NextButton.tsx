/**
 * NextButton — single CTA shown after an answer's feedback has been marked.
 *
 * Used everywhere an answer needs explicit acknowledgement before advancing:
 * Learn mode (both outcomes), Review Recent/All's wrong-answer path, and
 * Infinite Review (both outcomes). Review Recent/All's correct-answer path
 * uses RatingButtons instead.
 */

import { Button } from '@/components/ui/button'

interface NextButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function NextButton({ onClick, disabled = false }: NextButtonProps) {
  return (
    <Button
      size="lg"
      disabled={disabled}
      className="w-full min-h-[56px] text-base font-bold rounded-2xl"
      onClick={onClick}
    >
      Next →
    </Button>
  )
}
