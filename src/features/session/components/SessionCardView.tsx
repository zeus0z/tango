/**
 * SessionCardView — Drives the study loop for a single session.
 *
 * Supports two modes:
 *  - Teaching mode (learn): receives a TeachingItem[] plan and renders
 *    IntroduceCharacter screens or CardTypeA/B drills per item kind.
 *    Handles requeue logic for wrong answers.
 *  - Legacy card mode (review-recent, review-all): receives a flat Card[]
 *    and runs the original FSRS-driven loop.
 *
 * FSRS scheduling + Supabase persistence runs on every rating via persistReview.
 * Zustand store updates (dailyProgress) fire for every card interaction.
 */

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { CardTypeA, CardTypeB } from '@/features/cards'
import { useAppStore } from '@/lib/store'
import type { Card, SessionMode } from '@/types'
import type { UIRating } from '@/lib/fsrs'
import { persistReview, fetchCardProgress } from '../utils/persistReview'
import type { TeachingItem } from '../utils/buildSession'
import { RatingButtons } from './RatingButtons'
import { SessionProgress } from './SessionProgress'
import { SessionSummary } from './SessionSummary'
import { IntroduceCharacter } from './IntroduceCharacter'

// ---------------------------------------------------------------------------
// Session stats
// ---------------------------------------------------------------------------

interface SessionStats {
  totalReviewed: number
  totalCorrect: number
  newLearned: number
}

// ---------------------------------------------------------------------------
// Props — two overloads:
//   1. Teaching mode (mode === 'learn'): teachingPlan required
//   2. Review mode: initialQueue + newCardIds
// ---------------------------------------------------------------------------

interface TeachingSessionProps {
  mode: 'learn'
  teachingPlan: TeachingItem[]
  userId: string
}

interface ReviewSessionProps {
  mode: Exclude<SessionMode, 'learn'>
  initialQueue: Card[]
  userId: string
  newCardIds: Set<string>
}

// Union prop — session page passes the appropriate variant
type SessionCardViewProps = TeachingSessionProps | ReviewSessionProps

function isTeachingMode(props: SessionCardViewProps): props is TeachingSessionProps {
  return props.mode === 'learn'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionCardView(props: SessionCardViewProps) {
  if (isTeachingMode(props)) {
    return <TeachingSessionView {...props} />
  }
  return <ReviewSessionView {...props} />
}

// ===========================================================================
// Teaching session (Learn mode — PER-23)
// ===========================================================================

function TeachingSessionView({ teachingPlan, userId }: TeachingSessionProps) {
  const [plan, setPlan] = useState<TeachingItem[]>(teachingPlan)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showRatingButtons, setShowRatingButtons] = useState(false)
  const [ratingDisabled, setRatingDisabled] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [done, setDone] = useState(false)
  const [totalItems, setTotalItems] = useState(teachingPlan.length)

  // Track new characters introduced this session (both bases and derived)
  const [newLearnedIds, setNewLearnedIds] = useState<Set<string>>(new Set())

  const [stats, setStats] = useState<SessionStats>({
    totalReviewed: 0,
    totalCorrect: 0,
    newLearned: 0,
  })

  const incrementReviewed = useAppStore((s) => s.incrementReviewed)
  const incrementLearned = useAppStore((s) => s.incrementLearned)

  const currentItem = plan[currentIndex]

  // -------------------------------------------------------------------------
  // Advance to the next plan item (declared first so callbacks can reference it)
  // -------------------------------------------------------------------------
  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    setDirection(1)

    if (nextIndex >= plan.length) {
      setDone(true)
    } else {
      setCurrentIndex(nextIndex)
      setRevealed(false)
      setShowRatingButtons(false)
      setRatingDisabled(false)
    }
  }, [currentIndex, plan.length])

  // -------------------------------------------------------------------------
  // Handle advance from an introduction screen
  // -------------------------------------------------------------------------
  const handleIntroAdvance = useCallback(() => {
    if (!currentItem) return

    // Count characters introduced as "new learned"
    const introduced: string[] = []
    if (currentItem.kind === 'introduce') {
      introduced.push(currentItem.card.id)
    } else if (currentItem.kind === 'introduce-pair') {
      introduced.push(currentItem.card.id)
      introduced.push(currentItem.derivedCard.id)
    }

    const newIds = new Set(newLearnedIds)
    let addedCount = 0
    for (const id of introduced) {
      if (!newIds.has(id)) {
        newIds.add(id)
        addedCount++
      }
    }
    setNewLearnedIds(newIds)

    setStats((prev) => ({
      ...prev,
      newLearned: prev.newLearned + addedCount,
    }))
    for (let i = 0; i < addedCount; i++) incrementLearned()

    advanceToNext()
  }, [currentItem, newLearnedIds, incrementLearned, advanceToNext])

  // -------------------------------------------------------------------------
  // Handle answer from a drill card
  // -------------------------------------------------------------------------
  const handleDrillAnswer = useCallback(
    async (correct: boolean) => {
      if (!currentItem || currentItem.kind !== 'drill') return

      if (!correct) {
        // Wrong: auto-rate Again, requeue at end of plan
        try {
          const progress = await fetchCardProgress(userId, currentItem.card.id)
          await persistReview(userId, currentItem.card.id, 'Again', progress)
        } catch (err) {
          console.error('Failed to persist review:', err)
          toast.error('Could not save review — check your connection.')
        }

        setStats((prev) => ({
          ...prev,
          totalReviewed: prev.totalReviewed + 1,
        }))
        incrementReviewed()

        // Requeue the same item at the end
        setPlan((prev) => {
          const updated = [...prev]
          const item = updated[currentIndex]
          updated.splice(currentIndex, 1)
          updated.push(item)
          return updated
        })
        setTotalItems((n) => n + 1)

        // Advance (index stays same since we removed current)
        setDirection(1)
        setRevealed(false)
        setShowRatingButtons(false)
      } else {
        // Correct: show rating buttons
        setShowRatingButtons(true)
      }
    },
    [currentItem, currentIndex, userId, incrementReviewed],
  )

  // -------------------------------------------------------------------------
  // Handle rating for a drill card
  // -------------------------------------------------------------------------
  const handleDrillRate = useCallback(
    async (rating: UIRating) => {
      if (!currentItem || currentItem.kind !== 'drill' || ratingDisabled) return
      setRatingDisabled(true)

      try {
        const cardProgress = await fetchCardProgress(userId, currentItem.card.id)
        await persistReview(userId, currentItem.card.id, rating, cardProgress)
      } catch (err) {
        console.error('Failed to persist review:', err)
        toast.error('Could not save review — check your connection.')
      }

      setStats((prev) => ({
        totalReviewed: prev.totalReviewed + 1,
        totalCorrect: prev.totalCorrect + 1,
        newLearned: prev.newLearned,
      }))
      incrementReviewed()

      advanceToNext()
    },
    [currentItem, ratingDisabled, userId, incrementReviewed, advanceToNext],
  )

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  if (done || !currentItem) {
    return (
      <SessionSummary
        totalReviewed={stats.totalReviewed}
        totalCorrect={stats.totalCorrect}
        newLearned={stats.newLearned}
      />
    )
  }

  const progress = Math.min(currentIndex, totalItems)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col w-full min-h-svh">
      <SessionProgress current={progress} total={totalItems} />

      <div className="flex flex-col flex-1 items-center justify-start px-4 pt-6 pb-safe-or-6 gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`item-${currentIndex}`}
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
            {(currentItem.kind === 'introduce' || currentItem.kind === 'introduce-pair') && (
              <IntroduceCharacter
                card={currentItem.card}
                derived={currentItem.kind === 'introduce-pair' ? currentItem.derivedCard : undefined}
                onAdvance={handleIntroAdvance}
              />
            )}

            {currentItem.kind === 'drill' && currentItem.cardType === 'A' && (
              <CardTypeA
                card={currentItem.card}
                onAnswer={handleDrillAnswer}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
                mnemonicHidden={true}
              />
            )}

            {currentItem.kind === 'drill' && currentItem.cardType === 'B' && (
              <CardTypeB
                card={currentItem.card}
                onAnswer={handleDrillAnswer}
                revealed={revealed}
                onReveal={() => setRevealed(true)}
                mnemonicHidden={true}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Rating buttons (drill correct path) */}
        <AnimatePresence>
          {showRatingButtons && currentItem.kind === 'drill' && (
            <motion.div
              key="rating-buttons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <RatingButtons onRate={handleDrillRate} disabled={ratingDisabled} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ===========================================================================
// Review session (review-recent / review-all — original behaviour)
// ===========================================================================

function ReviewSessionView({ initialQueue, userId, newCardIds }: ReviewSessionProps) {
  const [queue, setQueue] = useState<Card[]>(initialQueue)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showRatingButtons, setShowRatingButtons] = useState(false)
  const [ratingDisabled, setRatingDisabled] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [stats, setStats] = useState<SessionStats>({
    totalReviewed: 0,
    totalCorrect: 0,
    newLearned: 0,
  })
  const [done, setDone] = useState(false)
  const [totalCards, setTotalCards] = useState(initialQueue.length)

  const incrementReviewed = useAppStore((s) => s.incrementReviewed)
  const incrementLearned = useAppStore((s) => s.incrementLearned)

  const currentCard = queue[currentIndex]

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (!currentCard) return

      if (!correct) {
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

        setQueue((prev) => {
          const newQueue = [...prev]
          const card = newQueue[currentIndex]
          newQueue.splice(currentIndex, 1)
          newQueue.push(card)
          return newQueue
        })
        setTotalCards((n) => n + 1)

        setDirection(1)
        setRevealed(false)
        setShowRatingButtons(false)
      } else {
        setShowRatingButtons(true)
      }
    },
    [currentCard, currentIndex, userId, incrementReviewed],
  )

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

  if (done || !currentCard) {
    return (
      <SessionSummary
        totalReviewed={stats.totalReviewed}
        totalCorrect={stats.totalCorrect}
        newLearned={stats.newLearned}
      />
    )
  }

  const progress = Math.min(currentIndex, totalCards)

  return (
    <div className="flex flex-col w-full min-h-svh">
      <SessionProgress current={progress} total={totalCards} />

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
            {/* Review modes always use TypeB */}
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
