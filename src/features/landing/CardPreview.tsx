/**
 * CardPreview — static showcase of CardTypeA for the landing page.
 *
 * Renders a non-interactive card face showing あ → 'a'.
 * pointer-events: none prevents any interaction; onAnswer is a no-op.
 */

import { CardTypeA } from '@/features/cards'
import type { Card } from '@/types'

const PREVIEW_CARD: Card = {
  id: 'preview-a',
  character: 'あ',
  romaji: 'a',
  type: 'hiragana',
  group_name: 'vowels',
  genki_order: 1,
  example_word: 'あお (ao)',
  example_word_romaji: 'blue',
}

export function CardPreview() {
  return (
    <div
      className="pointer-events-none select-none w-full max-w-[320px] mx-auto"
      aria-hidden="true"
    >
      <CardTypeA
        card={PREVIEW_CARD}
        onAnswer={() => {}}
        revealed={false}
      />
    </div>
  )
}
