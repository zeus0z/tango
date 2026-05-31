/**
 * CardTypeA — Symbol → Sound (Full Grid)
 *
 * Front: shows the Japanese character (≥text-8xl, lang="ja").
 * Back:  shows the full romaji sound grid (RomajiGrid).
 *        User taps the correct romaji; no process of elimination.
 *        Confirm button submits the answer; backspace clears selection.
 *
 * PRESENTATIONAL: receives a Card + callbacks, no data fetching, no FSRS.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Card } from '@/types'
import { AnswerFeedback, type FeedbackState } from './AnswerFeedback'
import { RomajiGrid } from './RomajiGrid'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CardTypeAProps {
  /** The flashcard data (character, romaji, optional example word). */
  card: Card
  /**
   * Called when the user confirms their answer.
   * `correct` is true when the selected romaji matches card.romaji.
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
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [answered, setAnswered] = useState(false)

  function handleConfirm() {
    if (!selected || answered) return

    const correct = selected === card.romaji
    setAnswered(true)
    setFeedback(correct ? 'correct' : 'wrong')
  }

  function handleBackspace() {
    if (answered) return
    setSelected(null)
  }

  function handleAnimationComplete() {
    if (feedback !== 'idle') {
      const wasCorrect = feedback === 'correct'
      // Reset local state before handing off to parent
      setFeedback('idle')
      setSelected(null)
      setAnswered(false)
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
          'w-full rounded-3xl shadow-md',
          'bg-card-bg',
          'flex flex-col items-center justify-center',
          'py-10 px-4',
          !revealed && 'cursor-pointer active:scale-[0.98] transition-transform duration-75',
        )}
      >
        {/* Front: large Japanese character */}
        <p
          lang="ja"
          className="font-ja text-8xl text-foreground leading-none select-none"
        >
          {card.character}
        </p>

        {/* Optional Genki example word — shown when revealed */}
        {revealed && card.example_word && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            lang="ja"
            className="mt-4 text-sm text-muted-foreground font-ja"
          >
            {card.example_word}
            {card.example_word_romaji && (
              <span className="ml-2 text-muted-foreground/70 not-italic">
                ({card.example_word_romaji})
              </span>
            )}
          </motion.p>
        )}
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
            selected={selected}
            onSelect={(romaji) => {
              if (!answered) setSelected(romaji)
            }}
            onConfirm={handleConfirm}
            onBackspace={handleBackspace}
            disabled={answered}
          />
        </motion.div>
      )}
    </div>
  )
}
