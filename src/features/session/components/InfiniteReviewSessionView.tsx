/**
 * InfiniteReviewSessionView — the looping practice view for Infinite Review (PER-26).
 *
 * Adapted from ReviewSessionView, but PURE PRACTICE:
 *  - No persistReview / fetchCardProgress — the FSRS schedule is never touched.
 *  - No Zustand daily-counter updates.
 *  - No RatingButtons — rating is meaningless without scheduling.
 *  - Never ends on its own: when the queue is exhausted it reshuffles and
 *    restarts. The user exits manually via the header Exit button.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CardTypeB } from '@/features/cards'
import { NextButton } from './NextButton'
import type { Card } from '@/types'

interface InfiniteReviewSessionViewProps {
  /** All learnt cards of the chosen script. */
  cards: Card[]
}

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function InfiniteReviewSessionView({ cards }: InfiniteReviewSessionViewProps) {
  const navigate = useNavigate()

  const [queue, setQueue] = useState<Card[]>(() => shuffle(cards))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [showNextButton, setShowNextButton] = useState(false)
  const [nextDisabled, setNextDisabled] = useState(false)
  const [pendingWrong, setPendingWrong] = useState(false)

  const currentCard = queue[currentIndex]

  const advance = useCallback(() => {
    setReviewedCount((n) => n + 1)
    setDirection(1)
    setRevealed(false)
    setShowNextButton(false)
    setNextDisabled(false)

    setCurrentIndex((index) => {
      const next = index + 1
      if (next >= queue.length) {
        // Loop forever: reshuffle and restart from the top.
        setQueue((prev) => shuffle(prev))
        return 0
      }
      return next
    })
  }, [queue.length])

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return
      // Feedback stays on screen until the user taps "Next".
      setPendingWrong(!correct)
      setShowNextButton(true)
    },
    [currentCard],
  )

  const handleNext = useCallback(() => {
    if (nextDisabled) return
    setNextDisabled(true)

    if (pendingWrong) {
      // Requeue the missed card toward the end so it comes back this loop.
      // currentIndex stays put — the array already shifted underneath it,
      // so the next card is naturally whatever slid into this slot.
      setQueue((prev) => {
        const newQueue = [...prev]
        const [card] = newQueue.splice(currentIndex, 1)
        newQueue.push(card)
        return newQueue
      })
      setReviewedCount((n) => n + 1)
      setPendingWrong(false)
      setDirection(1)
      setRevealed(false)
      setShowNextButton(false)
      setNextDisabled(false)
    } else {
      advance()
    }
  }, [nextDisabled, pendingWrong, currentIndex, advance])

  if (!currentCard) return null

  return (
    <div className="flex flex-col w-full min-h-svh">
      {/* Header: exit + running count (no fixed total — this loops forever) */}
      <div className="flex items-center justify-between px-4 pt-safe-or-4 pb-2">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="min-h-[44px] px-3 -ml-1 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:bg-muted/60 cursor-pointer"
        >
          ✕ Exit
        </button>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {reviewedCount} reviewed
        </span>
      </div>

      <div className="flex flex-col flex-1 items-center justify-start px-4 pt-6 pb-safe-or-6 gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentCard.id + '-' + currentIndex + '-' + reviewedCount}
            variants={{
              enter: { x: direction * 60, opacity: 0 },
              center: { x: 0, opacity: 1 },
              exit: { x: direction * -60, opacity: 0 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            <CardTypeB
              card={currentCard}
              onAnswer={handleAnswer}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              mnemonicHidden={true}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showNextButton && (
            <motion.div
              key="next-button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <NextButton onClick={handleNext} disabled={nextDisabled} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default InfiniteReviewSessionView
