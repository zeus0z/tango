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
import { Button } from '@/components/ui/button'
import { AnswerFeedback, type FeedbackState } from './AnswerFeedback'
import { MnemonicViewer } from './MnemonicViewer'
import { RomajiGrid } from './RomajiGrid'
import { cn } from '@/lib/utils'
import { speakHiragana } from '../utils/speak'
import { t } from '@/lib/constants/strings'

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
  /**
   * When true (default): mnemonic is hidden behind a "💡 Show mnemonic" button (PER-22 behaviour).
   * When false: mnemonic is shown by default with no button (used on the introduction screen).
   */
  mnemonicHidden?: boolean
  /** When true, shows "Qual som ele faz?" prompt above the romaji grid (Learn mode). */
  showPrompt?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardTypeA({ card, onAnswer, revealed = false, onReveal, mnemonicHidden = true, showPrompt = false }: CardTypeAProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [mnemonicOpen, setMnemonicOpen] = useState(false)

  function handleAnswer(correct: boolean) {
    setFeedback(correct ? 'correct' : 'wrong')
    // Fire onAnswer immediately alongside the color change.
    // Do NOT gate on onAnimationComplete — that 0.4–0.5s delay before the
    // Next button appeared was the bug fixed by PER-39. The visual flash
    // animation still runs; we just decouple it from downstream state.
    onAnswer(correct)
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      {/* ── Card face ─────────────────────────────────────────────────────── */}
      <AnswerFeedback
        feedback={feedback}
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
          aria-label={t.common.playPronunciation}
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
          className="w-full flex flex-col gap-2"
        >
          {showPrompt && (
            <p className="text-center text-sm text-muted-foreground">
              {t.introduce.promptQuiz}
            </p>
          )}
          <RomajiGrid
            correctRomaji={card.romaji}
            onAnswer={handleAnswer}
          />
        </motion.div>
      )}

      {/* ── Mnemonic affordance (shown only when revealed + mnemonics exist) ─ */}
      {revealed && card.mnemonics_pt && card.mnemonics_pt.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full flex flex-col items-start gap-2"
        >
          {mnemonicHidden ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={() => setMnemonicOpen((prev) => !prev)}
              >
                {t.common.showMnemonic}
              </Button>
              {mnemonicOpen && (
                <MnemonicViewer
                  mnemonics={card.mnemonics_pt}
                  keywords={card.mnemonic_keyword ?? undefined}
                  textClassName="text-muted-foreground px-1"
                />
              )}
            </>
          ) : (
            <MnemonicViewer
              mnemonics={card.mnemonics_pt}
              keywords={card.mnemonic_keyword ?? undefined}
              textClassName="text-muted-foreground px-1"
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
