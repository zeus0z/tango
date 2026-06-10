/**
 * MnemonicViewer — shows one mnemonic at a time with ‹ › navigation.
 *
 * A card may have a couple of memory hooks (mnemonics_pt). This renders the
 * current one and, when there's more than one, a small prev/next control with a
 * "1 / 2" indicator. Styling of the surrounding block + the text is left to the
 * caller via `className` / `textClassName`, so it fits both the in-card affordance
 * and the intro-screen "Memory hook" block.
 *
 * PRESENTATIONAL: no data fetching.
 */

import { useState, type ComponentProps } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MnemonicViewerProps {
  /** The memory hooks for this card; the first entry is the primary/default. */
  mnemonics: string[]
  /** Extra classes for the mnemonic text element. */
  textClassName?: string
  /** Extra classes for the wrapper. */
  className?: string
}

export function MnemonicViewer({ mnemonics, textClassName, className }: MnemonicViewerProps) {
  const count = mnemonics.length
  const [index, setIndex] = useState(0)
  const [seen, setSeen] = useState(mnemonics)

  // Reset to the primary hook when the card's mnemonic set changes.
  // (Adjusting state during render — the React-recommended alternative to an effect.)
  if (seen !== mnemonics) {
    setSeen(mnemonics)
    setIndex(0)
  }

  if (count === 0) return null

  const current = Math.min(index, count - 1)
  const go = (delta: number) => setIndex((i) => (Math.min(i, count - 1) + delta + count) % count)

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.15 }}
          className={cn('text-sm italic', textClassName)}
        >
          {mnemonics[current]}
        </motion.p>
      </AnimatePresence>

      {count > 1 && (
        <div className="flex items-center gap-3">
          <NavButton
            aria-label="Mnemônico anterior"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            <ChevronLeft size={16} />
          </NavButton>
          <span className="text-xs tabular-nums text-muted-foreground select-none">
            {current + 1} / {count}
          </span>
          <NavButton
            aria-label="Próximo mnemônico"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            <ChevronRight size={16} />
          </NavButton>
        </div>
      )}
    </div>
  )
}

function NavButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full',
        'text-muted-foreground hover:text-foreground hover:bg-muted',
        'transition-colors active:scale-90',
        className,
      )}
      {...props}
    />
  )
}
