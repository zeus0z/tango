/**
 * IntroduceCharacter — Full-screen character introduction screen.
 *
 * Handles two variants:
 *  - Solo intro (`derived` omitted): shows one character with mnemonic + speaker.
 *  - Compound-lesson (`derived` provided): shows base → derived transformation,
 *    diacritic explanation pulled from DIACRITICS, speaker buttons for both.
 *
 * Mnemonic is embedded INSIDE the character card (PER-37):
 *  - Mobile (default): character + mnemonic stacked vertically, separated by a divider.
 *  - Desktop (md:): character left, mnemonic right, separated by a vertical divider.
 *
 * Label reads "Como lembrar:" (pt-BR). Speaker auto-plays on mount.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, ArrowRight } from 'lucide-react'
import type { Card } from '@/types'
import { Button } from '@/components/ui/button'
import { DIACRITICS } from '@/lib/constants/diacritics'
import { MnemonicViewer } from '@/features/cards/components/MnemonicViewer'
import { playKana } from '@/features/cards/utils/speak'
import { cn } from '@/lib/utils'
import { t } from '@/lib/constants/strings'

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

  // Auto-play on mount: base first, then derived (900ms after)
  useEffect(() => {
    playKana(card.character, card.romaji)
    if (derived) {
      const t = window.setTimeout(() => playKana(derived.character, derived.romaji), 900)
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
        {t.introduce.gotIt}
      </Button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Solo intro
// ---------------------------------------------------------------------------

function SoloIntro({ card }: { card: Card }) {
  const hasMnemonic = !!(card.mnemonics_pt && card.mnemonics_pt.length > 0)

  return (
    <div
      className={cn(
        'w-full rounded-3xl shadow-md bg-card-bg overflow-hidden',
        'flex flex-col',
        hasMnemonic && 'md:flex-row',
      )}
    >
      {/* ── Character section ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'py-14 px-4',
          hasMnemonic && 'md:flex-1',
        )}
      >
        {/* Speaker — top-right of character section */}
        <SpeakerButton character={card.character} romaji={card.romaji} />

        <p lang="ja" className="font-ja text-[9rem] leading-none text-foreground select-none">
          {card.character}
        </p>

        <p className="mt-3 text-2xl font-semibold text-muted-foreground tracking-widest">
          {card.romaji}
        </p>
      </div>

      {/* ── Mnemonic section — embedded inside the card ───────────────────── */}
      {hasMnemonic && (
        <>
          {/* Mobile: horizontal rule; Desktop: vertical separator */}
          <div className="h-px bg-border md:hidden" />
          <div className="hidden md:block w-px bg-border self-stretch" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="flex flex-col justify-center px-5 py-5 md:flex-1"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t.introduce.memoryHook}:
            </p>
            <MnemonicViewer
              mnemonics={card.mnemonics_pt!}
              keywords={card.mnemonic_keyword ?? undefined}
              textClassName="text-foreground"
            />
          </motion.div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pair (compound-lesson) intro: base → derived
// ---------------------------------------------------------------------------

function PairIntro({ card, derived }: { card: Card; derived: Card }) {
  const diacriticType = derived.diacritic ?? 'dakuten'
  const info = DIACRITICS[diacriticType]
  const hasMnemonic = !!(card.mnemonics_pt && card.mnemonics_pt.length > 0)

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

      {/* ── Compound character card: transformation row + mnemonic ─────────── */}
      <div className="w-full rounded-3xl shadow-md bg-card-bg overflow-hidden">
        {/* Transformation row: base ──arrow──> derived */}
        <div className="flex items-center justify-center gap-3 px-4 py-8">
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

        {/* Mnemonic — integrated below the transformation row */}
        {hasMnemonic && (
          <>
            <div className="h-px bg-border" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="px-5 py-4 flex flex-col gap-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.introduce.memoryHookWithRomaji(card.romaji)}
              </p>
              <MnemonicViewer
                mnemonics={card.mnemonics_pt!}
                keywords={card.mnemonic_keyword ?? undefined}
                textClassName="text-foreground"
              />
            </motion.div>
          </>
        )}
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
      <SpeakerButton character={card.character} romaji={card.romaji} />

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

function SpeakerButton({ character, romaji }: { character: string; romaji: string }) {
  return (
    <button
      type="button"
      aria-label={t.common.playPronunciation}
      onClick={(e) => {
        e.stopPropagation()
        playKana(character, romaji)
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
