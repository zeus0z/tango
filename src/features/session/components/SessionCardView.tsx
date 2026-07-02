/**
 * SessionCardView — Drives the study loop for a single session.
 *
 * Supports two modes:
 *  - Teaching mode (learn): receives a TeachingItem[] plan and renders
 *    IntroduceCharacter screens or CardTypeA/B drills per item kind.
 *    Handles requeue logic for wrong answers.
 *  - Legacy card mode (review-all): receives a flat Card[]
 *    and runs the original FSRS-driven loop.
 *
 * FSRS scheduling + Supabase persistence runs on every rating via persistReview.
 * Zustand store updates (dailyProgress) fire for every card interaction.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { CardTypeA, CardTypeB } from '@/features/cards'
import { useAppStore } from '@/lib/store'
import type { Card, SessionMode } from '@/types'
import type { UIRating } from '@/lib/fsrs'
import { persistReview, fetchCardProgress } from '../utils/persistReview'
import type { TeachingItem } from '../utils/buildSession'
import { RatingButtons } from './RatingButtons'
import { t } from '@/lib/constants/strings'
import { NextButton } from './NextButton'
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
  const navigate = useNavigate()
  const [plan, setPlan] = useState<TeachingItem[]>(teachingPlan)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNextButton, setShowNextButton] = useState(false)
  const [nextDisabled, setNextDisabled] = useState(false)
  const [pendingWrong, setPendingWrong] = useState(false)
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
      setShowNextButton(false)
      setNextDisabled(false)
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
  // Handle answer from a drill card.
  //
  // Learn mode never asks the user to judge difficulty — every correct
  // drill answer auto-rates 'Good', every wrong one auto-rates 'Again'.
  //
  // PER-39: UI state (stats, pendingWrong, showNextButton) updates immediately
  // so the Next button appears without waiting for the Supabase round-trips.
  // Persistence runs in the background; errors surface via toast.
  // -------------------------------------------------------------------------
  const handleDrillAnswer = useCallback(
    (correct: boolean) => {
      if (!currentItem || currentItem.kind !== 'drill') return

      // Update UI immediately — Next button appears right away.
      setStats((prev) => ({
        ...prev,
        totalReviewed: prev.totalReviewed + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
      }))
      incrementReviewed()
      setPendingWrong(!correct)
      setShowNextButton(true)

      // Persist in the background — do not block the UI.
      void (async () => {
        try {
          const progress = await fetchCardProgress(userId, currentItem.card.id)
          await persistReview(userId, currentItem.card.id, correct ? 'Good' : 'Again', progress)
        } catch (err) {
          console.error('Failed to persist review:', err)
          toast.error(t.session.couldNotSaveReview)
        }
      })()
    },
    [currentItem, userId, incrementReviewed],
  )

  // -------------------------------------------------------------------------
  // Handle the "Next" tap: requeue a wrong drill to the end of the plan, or
  // simply advance for a correct one.
  // -------------------------------------------------------------------------
  const handleDrillNext = useCallback(() => {
    if (nextDisabled) return
    setNextDisabled(true)

    if (pendingWrong) {
      setPlan((prev) => {
        const updated = [...prev]
        const item = updated[currentIndex]
        updated.splice(currentIndex, 1)
        updated.push(item)
        return updated
      })
      setTotalItems((n) => n + 1)
      setPendingWrong(false)
      setDirection(1)
      setShowNextButton(false)
      setNextDisabled(false)
    } else {
      advanceToNext()
    }
  }, [nextDisabled, pendingWrong, currentIndex, advanceToNext])

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
      <SessionProgress current={progress} total={totalItems} onExit={() => navigate('/home')} />

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
                revealed={true}
                mnemonicHidden={true}
                showPrompt={true}
              />
            )}

            {currentItem.kind === 'drill' && currentItem.cardType === 'B' && (
              <CardTypeB
                card={currentItem.card}
                onAnswer={handleDrillAnswer}
                revealed={true}
                mnemonicHidden={true}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next button (drill answer acknowledgement — no rating in Learn mode) */}
        <AnimatePresence>
          {showNextButton && currentItem.kind === 'drill' && (
            <motion.div
              key="next-button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <NextButton onClick={handleDrillNext} disabled={nextDisabled} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ===========================================================================
// Review session (review-all — original behaviour)
// ===========================================================================

function ReviewSessionView({ initialQueue, userId, newCardIds }: ReviewSessionProps) {
  const navigate = useNavigate()
  const [queue, setQueue] = useState<Card[]>(initialQueue)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [showRatingButtons, setShowRatingButtons] = useState(false)
  const [ratingDisabled, setRatingDisabled] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const [nextDisabled, setNextDisabled] = useState(false)
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
    (correct: boolean) => {
      if (!currentCard) return

      if (!correct) {
        // PER-39: update UI immediately — Next button appears right away.
        setStats((prev) => ({
          ...prev,
          totalReviewed: prev.totalReviewed + 1,
        }))
        incrementReviewed()
        setShowNextButton(true)

        // Persist in the background — do not block the UI.
        void (async () => {
          try {
            const progress = await fetchCardProgress(userId, currentCard.id)
            await persistReview(userId, currentCard.id, 'Again', progress)
          } catch (err) {
            console.error('Failed to persist review:', err)
            toast.error(t.session.couldNotSaveReview)
          }
        })()
      } else {
        setShowRatingButtons(true)
      }
    },
    [currentCard, userId, incrementReviewed],
  )

  // -------------------------------------------------------------------------
  // Handle the "Next" tap on a wrong answer: requeue toward the end.
  // -------------------------------------------------------------------------
  const handleWrongNext = useCallback(() => {
    if (nextDisabled) return
    setNextDisabled(true)

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
    setShowNextButton(false)
    setNextDisabled(false)
  }, [nextDisabled, currentIndex])

  const handleRate = useCallback(
    async (rating: UIRating) => {
      if (!currentCard || ratingDisabled) return
      setRatingDisabled(true)

      try {
        const cardProgress = await fetchCardProgress(userId, currentCard.id)
        await persistReview(userId, currentCard.id, rating, cardProgress)
      } catch (err) {
        console.error('Failed to persist review:', err)
        toast.error(t.session.couldNotSaveReview)
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
      <SessionProgress current={progress} total={totalCards} onExit={() => navigate('/home')} />

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
          {showNextButton && (
            <motion.div
              key="next-button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <NextButton onClick={handleWrongNext} disabled={nextDisabled} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
