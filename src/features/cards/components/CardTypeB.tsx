/**
 * CardTypeB — Sound → Symbol (6 Options)
 *
 * Front: shows the romaji sound (e.g. "ka").
 * Back:  6 tappable hiragana character tiles — one correct, five distractors
 *        from the F6 distractor helper (same phonetic family preferred).
 *
 * PRESENTATIONAL: receives a Card + callbacks, no data fetching, no FSRS.
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { Card } from '@/types'
import { Button } from '@/components/ui/button'
import { getDistractors } from '@/lib/constants/distractors'
import { HIRAGANA } from '@/lib/constants/hiragana'
import { AnswerFeedback, type FeedbackState } from './AnswerFeedback'
import { MnemonicViewer } from './MnemonicViewer'
import { cn } from '@/lib/utils'
import { speakHiragana } from '../utils/speak'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CardTypeBProps {
  /** The flashcard data (character = correct answer, romaji = prompt). */
  card: Card
  /**
   * Called when the user taps a hiragana tile.
   * `correct` is true when the tapped character matches card.character.
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
}

// ---------------------------------------------------------------------------
// Option tile
// ---------------------------------------------------------------------------

interface OptionTileProps {
  character: string
  feedback: FeedbackState
  disabled: boolean
  onAnimationComplete: () => void
  onClick: () => void
}

function OptionTile({
  character,
  feedback,
  disabled,
  onAnimationComplete,
  onClick,
}: OptionTileProps) {
  return (
    <AnswerFeedback
      feedback={feedback}
      onAnimationComplete={onAnimationComplete}
      className={cn(
        'rounded-2xl shadow-sm border border-border',
        'bg-card',
        'flex items-center justify-center',
        'min-h-[72px]',
        !disabled && 'cursor-pointer active:scale-95 transition-transform duration-75',
        disabled && 'pointer-events-none',
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full h-full flex items-center justify-center"
      >
        <span
          lang="ja"
          className="font-ja text-4xl text-foreground select-none"
        >
          {character}
        </span>
      </button>
    </AnswerFeedback>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardTypeB({ card, onAnswer, revealed = false, onReveal, mnemonicHidden = true }: CardTypeBProps) {
  const [feedback, setFeedback] = useState<Record<string, FeedbackState>>({})
  const [answered, setAnswered] = useState(false)
  const [mnemonicOpen, setMnemonicOpen] = useState(false)

  // Build the 6-option set: correct + 5 distractors, shuffled.
  // Memoised per card so it doesn't re-shuffle on every render.
  const options = useMemo(() => {
    // Find the matching HiraganaChar for the target
    const target = HIRAGANA.find((h) => h.character === card.character)
    if (!target) {
      // Fallback: just show the correct answer alone (shouldn't happen with valid data)
      return [card.character]
    }

    const distractors = getDistractors(target, 5)
    const all = [card.character, ...distractors.map((d) => d.character)]

    // Simple deterministic shuffle based on card.id
    const seed = card.id
    let s = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const shuffled = all.slice()
    for (let i = shuffled.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      const j = Math.floor(((s >>> 0) / 0x100000000) * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [card])

  function handleTap(character: string) {
    if (answered) return

    const correct = character === card.character
    setAnswered(true)
    setFeedback({ [character]: correct ? 'correct' : 'wrong' })
  }

  function handleAnimationComplete(character: string) {
    if (feedback[character] && feedback[character] !== 'idle') {
      const wasCorrect = feedback[character] === 'correct'
      setFeedback({})
      setAnswered(false)
      onAnswer(wasCorrect)
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-6">
      {/* ── Card face — romaji prompt ──────────────────────────────────────── */}
      <div
        onClick={!revealed ? onReveal : undefined}
        className={cn(
          'relative w-full rounded-3xl shadow-md',
          'bg-card-bg',
          'flex flex-col items-center justify-center',
          'py-10 px-4',
          !revealed && 'cursor-pointer active:scale-[0.98] transition-transform duration-75',
        )}
      >
        {/* Speaker button — top-right, only after reveal on Type B */}
        {revealed && (
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
        )}

        <p className="text-4xl font-bold text-foreground tracking-wide select-none">
          {card.romaji}
        </p>

      </div>

      {/* ── 6 hiragana options (shown only when revealed) ─────────────────── */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full grid grid-cols-3 gap-3"
        >
          {options.map((character) => (
            <OptionTile
              key={character}
              character={character}
              feedback={feedback[character] ?? 'idle'}
              disabled={answered}
              onClick={() => handleTap(character)}
              onAnimationComplete={() => handleAnimationComplete(character)}
            />
          ))}
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
                onClick={() => setMnemonicOpen((prev) => !prev)}
              >
                💡 Show mnemonic
              </Button>
              {mnemonicOpen && (
                <MnemonicViewer
                  mnemonics={card.mnemonics_pt}
                  textClassName="text-muted-foreground px-1"
                />
              )}
            </>
          ) : (
            <MnemonicViewer
              mnemonics={card.mnemonics_pt}
              textClassName="text-muted-foreground px-1"
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
