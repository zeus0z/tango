/**
 * CardTypeA — Symbol → Sound (Full Grid)
 *
 * Front: shows the Japanese character (≥text-8xl, lang="ja").
 * Back:  shows the full romaji sound grid (RomajiGrid).
 *        Tapping any romaji cell IS the answer — no confirm step.
 *
 * PRESENTATIONAL: receives a Card + callbacks, no data fetching, no FSRS.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { Card } from '@/types'
import { AnswerFeedback, type FeedbackState } from './AnswerFeedback'
import { RomajiGrid } from './RomajiGrid'
import { cn } from '@/lib/utils'
import { speakHiragana } from '../utils/speak'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CardTypeAProps {
  /** The flashcard data (character, romaji, optional example word). */
  card: Card
  /**
   * Called when the user taps a romaji cell.
   * `correct` is true when the tapped romaji matches card.romaji.
   */
  onAnswer: (correct: boolean) => void
  /** Whether the card is in the revealed (back) state. */
  revealed?: boolean
  /** Called when the card face is tapped to reveal the back. */
  onReveal?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardTypeA({ card, onAnswer, revealed = false, onReveal }: CardTypeAProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  function handleAnswer(correct: boolean) {
    setFeedback(correct ? 'correct' : 'wrong')
  }

  function handleAnimationComplete() {
    if (feedback !== 'idle') {
      const wasCorrect = feedback === 'correct'
      setFeedback('idle')
      onAnswer(wasCorrect)
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      {/* ── Card face ─────────────────────────────────────────────────────── */}
      <AnswerFeedback
        feedback={feedback}
        onAnimationComplete={handleAnimationComplete}
        onClick={!revealed ? onReveal : undefined}
        className={cn(
          'relative w-full rounded-3xl shadow-md',
          'bg-card-bg',
          'flex flex-col items-center justify-center',
          'py-10 px-4',
          !revealed && 'cursor-pointer active:scale-[0.98] transition-transform duration-75',
        )}
      >
        {/* Speaker button — top-right, always visible on Type A */}
        <button
          type="button"
          aria-label="Play pronunciation"
          onClick={(e) => {
            e.stopPropagation()
            speakHiragana(card.character)
          }}
          className={cn(
            'absolute top-3 right-3',
            'flex items-center justify-center',
            'w-12 h-12 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'transition-transform duration-75 active:scale-90',
          )}
        >
          <Volume2 size={22} />
        </button>

        {/* Front: large Japanese character */}
        <p
          lang="ja"
          className="font-ja text-8xl text-foreground leading-none select-none"
        >
          {card.character}
        </p>

      </AnswerFeedback>

      {/* ── Romaji grid (shown only when revealed) ────────────────────────── */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <RomajiGrid
            correctRomaji={card.romaji}
            onAnswer={handleAnswer}
          />
        </motion.div>
      )}
    </div>
  )
}
