/**
 * SessionCardView — Drives the study loop for a single session.
 *
 * Receives the ordered card queue and handles:
 *  - Card-type selection (Type A for new/Learning, Type B for Review)
 *  - Answer handling (correct → rating buttons, wrong → auto-Again + requeue)
 *  - FSRS scheduling + Supabase persistence via persistReview
 *  - Zustand store updates (dailyProgress)
 *  - Slide animation between cards (AnimatePresence)
 *  - Summary screen when queue empties
 */

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { CardTypeA, CardTypeB } from '@/features/cards'
import { useAppStore } from '@/lib/store'
import type { Card, SessionMode } from '@/types'
import type { UIRating } from '@/lib/fsrs'
import { persistReview, fetchCardProgress } from '../utils/persistReview'
import { RatingButtons } from './RatingButtons'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'

// ---------------------------------------------------------------------------
// Card-type selection
// Type A = new/Learning cards (recognition: symbol → sound)
// Type B = Review cards (recall: sound → symbol)
// ---------------------------------------------------------------------------
type CardDisplayType = 'A' | 'B'

function selectCardType(_card: Card, mode: SessionMode): CardDisplayType {
  // In Learn mode the first batch are new (unseen) — use Type A for recognition
  // In Review modes — use Type B for recall
  if (mode === 'learn') return 'A'
  return 'B'
}

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------

interface SessionStats {
  totalReviewed: number
  totalCorrect: number
  newLearned: number
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionCardViewProps {
  initialQueue: Card[]
  mode: SessionMode
  userId: string
  /** IDs of unseen (new) cards in this session — used to count newLearned */
  newCardIds: Set<string>
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionCardView({ initialQueue, mode, userId, newCardIds }: SessionCardViewProps) {
  const [queue, setQueue] = useState<Card[]>(initialQueue)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showRatingButtons, setShowRatingButtons] = useState(false)
  const [ratingDisabled, setRatingDisabled] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1) // slide direction
  const [stats, setStats] = useState<SessionStats>({
    totalReviewed: 0,
    totalCorrect: 0,
    newLearned: 0,
  })
  const [done, setDone] = useState(false)
  // Total cards for progress bar — starts at initialQueue.length, grows when wrong cards requeue
  const [totalCards, setTotalCards] = useState(initialQueue.length)

  const incrementReviewed = useAppStore((s) => s.incrementReviewed)
  const incrementLearned = useAppStore((s) => s.incrementLearned)

  const currentCard = queue[currentIndex]

  // ---------------------------------------------------------------------------
  // Handle answer from card component (correct / wrong)
  // ---------------------------------------------------------------------------
  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (!currentCard) return

      if (!correct) {
        // Wrong: auto-rate Again, requeue at end
        try {
          const progress = await fetchCardProgress(userId, currentCard.id)
          await persistReview(userId, currentCard.id, 'Again', progress)
        } catch (err) {
          console.error('Failed to persist review:', err)
          toast.error('Could not save review — check your connection.')
        }

        setStats((prev) => ({
          ...prev,
          totalReviewed: prev.totalReviewed + 1,
        }))
        incrementReviewed()

        // Requeue at end
        setQueue((prev) => {
          const newQueue = [...prev]
          const card = newQueue[currentIndex]
          newQueue.splice(currentIndex, 1)
          newQueue.push(card)
          return newQueue
        })
        setTotalCards((n) => n + 1)

        // Advance (index stays the same since we removed current)
        setDirection(1)
        setRevealed(false)
        setShowRatingButtons(false)
      } else {
        // Correct: show rating buttons
        setShowRatingButtons(true)
      }
    },
    [currentCard, currentIndex, userId, incrementReviewed],
  )

  // ---------------------------------------------------------------------------
  // Handle rating (Hard / Good / Easy)
  // ---------------------------------------------------------------------------
  const handleRate = useCallback(
    async (rating: UIRating) => {
      if (!currentCard || ratingDisabled) return
      setRatingDisabled(true)

      try {
        const cardProgress = await fetchCardProgress(userId, currentCard.id)
        await persistReview(userId, currentCard.id, rating, cardProgress)
      } catch (err) {
        console.error('Failed to persist review:', err)
        toast.error('Could not save review — check your connection.')
      }

      const isNew = newCardIds.has(currentCard.id)
      setStats((prev) => ({
        totalReviewed: prev.totalReviewed + 1,
        totalCorrect: prev.totalCorrect + 1,
        newLearned: prev.newLearned + (isNew ? 1 : 0),
      }))
      incrementReviewed()
      if (isNew) incrementLearned()

      // Advance to next card
      const nextIndex = currentIndex + 1
      setDirection(1)

      if (nextIndex >= queue.length) {
        setDone(true)
      } else {
        setCurrentIndex(nextIndex)
        setRevealed(false)
        setShowRatingButtons(false)
        setRatingDisabled(false)
      }
    },
    [
      currentCard,
      currentIndex,
      queue.length,
      ratingDisabled,
      userId,
      newCardIds,
      incrementReviewed,
      incrementLearned,
    ],
  )

  // ---------------------------------------------------------------------------
  // Summary screen
  // ---------------------------------------------------------------------------
  if (done) {
    return (
      <SessionSummary
        totalReviewed={stats.totalReviewed}
        totalCorrect={stats.totalCorrect}
        newLearned={stats.newLearned}
      />
    )
  }

  if (!currentCard) {
    return (
      <SessionSummary
        totalReviewed={stats.totalReviewed}
        totalCorrect={stats.totalCorrect}
        newLearned={stats.newLearned}
      />
    )
  }

  const cardType = selectCardType(currentCard, mode)
  const progress = Math.min(currentIndex, totalCards)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col w-full min-h-svh">
      {/* Progress bar */}
      <SessionProgress current={progress} total={totalCards} />

      {/* Card area */}
      <div className="flex flex-col flex-1 items-center justify-start px-4 pt-6 pb-safe-or-6 gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentCard.id + '-' + currentIndex}
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
            {cardType === 'A' ? (
              <CardTypeA
                card={currentCard}
                onAnswer={handleAnswer}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
              />
            ) : (
              <CardTypeB
                card={currentCard}
                onAnswer={handleAnswer}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Rating buttons (correct path) */}
        <AnimatePresence>
          {showRatingButtons && (
            <motion.div
              key="rating-buttons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <RatingButtons onRate={handleRate} disabled={ratingDisabled} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
