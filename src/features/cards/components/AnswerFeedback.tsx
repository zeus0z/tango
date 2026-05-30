/**
 * AnswerFeedback — wraps any content and plays a green flash (correct)
 * or a red flash + horizontal shake (wrong) via Framer Motion.
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
  className?: string
  children: ReactNode
}

export function AnswerFeedback({
  feedback,
  onAnimationComplete,
  className,
  children,
}: AnswerFeedbackProps) {
  const isCorrect = feedback === 'correct'
  const isWrong = feedback === 'wrong'

  return (
    <motion.div
      className={className}
      animate={
        isCorrect
          ? { backgroundColor: ['#ffffff', '#dcfce7', '#ffffff'] }
          : isWrong
            ? {
                x: [0, -8, 8, -8, 8, 0],
                backgroundColor: ['#ffffff', '#fee2e2', '#ffffff'],
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
