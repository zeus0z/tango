/**
 * AnswerFeedback — wraps any content and plays a green flash (correct)
 * or a red flash + horizontal shake (wrong) via Framer Motion.
 *
 * The flash holds on its final color instead of fading back to white —
 * callers are expected to keep `feedback` set until they unmount/replace
 * this instance (e.g. on advancing to the next card), so the marking stays
 * visible until the user explicitly moves on.
 *
 * The wrapper is purely presentational: it responds to `feedback` prop
 * and fires `onAnimationComplete` when the animation ends.
 */

import { motion, type AnimationDefinition } from 'framer-motion'
import type { ReactNode } from 'react'

export type FeedbackState = 'idle' | 'correct' | 'wrong'

interface AnswerFeedbackProps {
  feedback: FeedbackState
  onAnimationComplete?: (definition: AnimationDefinition) => void
  onClick?: () => void
  className?: string
  children: ReactNode
}

export function AnswerFeedback({
  feedback,
  onAnimationComplete,
  onClick,
  className,
  children,
}: AnswerFeedbackProps) {
  const isCorrect = feedback === 'correct'
  const isWrong = feedback === 'wrong'

  return (
    <motion.div
      className={className}
      onClick={onClick}
      animate={
        isCorrect
          ? { backgroundColor: ['#ffffff', '#dcfce7'] }
          : isWrong
            ? {
                x: [0, -8, 8, -8, 8, 0],
                backgroundColor: ['#ffffff', '#fee2e2'],
              }
            : {}
      }
      transition={
        isCorrect
          ? { duration: 0.5 }
          : isWrong
            ? { duration: 0.4 }
            : {}
      }
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  )
}
