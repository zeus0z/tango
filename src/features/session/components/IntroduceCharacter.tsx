/**
 * IntroduceCharacter — Full-screen character introduction screen.
 *
 * Handles two variants:
 *  - Solo intro (`derived` omitted): shows one character with mnemonic + speaker.
 *  - Compound-lesson (`derived` provided): shows base → derived transformation,
 *    diacritic explanation pulled from DIACRITICS, speaker buttons for both.
 *
 * Mnemonic is shown BY DEFAULT on intro screens (the only place it is).
 * Speaker auto-plays on mount.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, ArrowRight } from 'lucide-react'
import type { Card } from '@/types'
import { Button } from '@/components/ui/button'
import { DIACRITICS } from '@/lib/constants/diacritics'
import { speakHiragana } from '@/features/cards/utils/speak'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface IntroduceCharacterProps {
  /** The base character card to introduce. */
  card: Card
  /**
   * When provided, renders the compound-lesson (base → derived) screen
   * including the diacritic explanation block.
   */
  derived?: Card
  /** Called when the user taps the primary "Got it →" CTA. */
  onAdvance: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntroduceCharacter({ card, derived, onAdvance }: IntroduceCharacterProps) {
  const isPair = !!derived

  // Auto-play on mount: base first, then derived (300ms after)
  useEffect(() => {
    speakHiragana(card.character)
    if (derived) {
      const t = window.setTimeout(() => speakHiragana(derived.character), 900)
      return () => window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.character, derived?.character])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col w-full min-h-svh items-center justify-start px-4 pt-10 pb-safe-or-8 gap-6"
    >
      {isPair ? (
        <PairIntro card={card} derived={derived!} />
      ) : (
        <SoloIntro card={card} />
      )}

      {/* Primary CTA */}
      <Button
        size="lg"
        className="w-full min-h-[56px] text-base font-bold rounded-2xl"
        onClick={onAdvance}
      >
        Got it →
      </Button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Solo intro
// ---------------------------------------------------------------------------

function SoloIntro({ card }: { card: Card }) {
  return (
    <>
      {/* Character card */}
      <div
        className={cn(
          'relative w-full rounded-3xl shadow-md',
          'bg-card-bg',
          'flex flex-col items-center justify-center',
          'py-14 px-4',
        )}
      >
        {/* Speaker — top-right */}
        <SpeakerButton character={card.character} />

        <p lang="ja" className="font-ja text-[9rem] leading-none text-foreground select-none">
          {card.character}
        </p>

        <p className="mt-3 text-2xl font-semibold text-muted-foreground tracking-widest">
          {card.romaji}
        </p>
      </div>

      {/* Mnemonic — shown by default */}
      {card.mnemonic && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="w-full rounded-2xl bg-card px-4 py-3 shadow-sm border border-border"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Memory hook
          </p>
          <p className="text-sm text-foreground italic">{card.mnemonic}</p>
        </motion.div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Pair (compound-lesson) intro: base → derived
// ---------------------------------------------------------------------------

function PairIntro({ card, derived }: { card: Card; derived: Card }) {
  const diacriticType = derived.diacritic ?? 'dakuten'
  const info = DIACRITICS[diacriticType]

  return (
    <>
      {/* Caption above the pair */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-base font-semibold text-muted-foreground text-center tracking-wide"
      >
        {card.romaji}{' '}
        <span className="font-ja text-xl align-middle">{info.mark}</span>
        {' → '}
        {derived.romaji}
      </motion.p>

      {/* Transformation row: base ──arrow──> derived */}
      <div className="w-full flex items-center justify-center gap-3">
        {/* Base character tile */}
        <CharTile card={card} />

        {/* Arrow + diacritic mark */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span lang="ja" className="text-2xl text-muted-foreground font-ja leading-none">
            {info.mark}
          </span>
          <ArrowRight size={28} className="text-muted-foreground" strokeWidth={2.5} />
        </div>

        {/* Derived character tile */}
        <CharTile card={derived} />
      </div>

      {/* Diacritic explanation block */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="w-full rounded-2xl bg-card px-4 py-4 shadow-sm border border-border flex flex-col gap-2"
      >
        {/* Heading: mark + name */}
        <p className="text-sm font-bold text-foreground">
          <span lang="ja">{info.mark}</span>
          {'  '}
          {info.name}{' '}
          <span lang="ja" className="font-ja font-normal text-muted-foreground">
            ({info.nameJa})
          </span>
          {' — '}
          <span className="font-normal italic text-muted-foreground">{info.shortLabel}.</span>
        </p>

        {/* Rule */}
        <p className="text-xs text-muted-foreground italic">{info.rule}</p>

        {/* Worked example */}
        <p className="text-xs text-muted-foreground italic">{info.example}</p>
      </motion.div>

      {/* Base mnemonic — shown by default */}
      {card.mnemonic && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          className="w-full rounded-2xl bg-card px-4 py-3 shadow-sm border border-border"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Memory hook ({card.romaji})
          </p>
          <p className="text-sm text-foreground italic">{card.mnemonic}</p>
        </motion.div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// CharTile — character display tile with speaker button
// ---------------------------------------------------------------------------

function CharTile({ card }: { card: Card }) {
  return (
    <div
      className={cn(
        'relative flex-1 rounded-3xl shadow-md',
        'bg-card-bg',
        'flex flex-col items-center justify-center',
        'py-8 px-2',
        'min-w-0',
      )}
    >
      <SpeakerButton character={card.character} />

      <p lang="ja" className="font-ja text-7xl leading-none text-foreground select-none">
        {card.character}
      </p>
      <p className="mt-2 text-base font-semibold text-muted-foreground tracking-widest">
        {card.romaji}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SpeakerButton
// ---------------------------------------------------------------------------

function SpeakerButton({ character }: { character: string }) {
  return (
    <button
      type="button"
      aria-label="Play pronunciation"
      onClick={(e) => {
        e.stopPropagation()
        speakHiragana(character)
      }}
      className={cn(
        'absolute top-3 right-3',
        'flex items-center justify-center',
        'w-11 h-11 rounded-full',
        'text-muted-foreground hover:text-foreground',
        'transition-transform duration-75 active:scale-90',
      )}
    >
      <Volume2 size={20} />
    </button>
  )
}
