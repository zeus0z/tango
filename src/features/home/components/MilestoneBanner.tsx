/**
 * MilestoneBanner — contextual achievement banner shown on the home screen.
 *
 * Logic:
 *   - Checks each hiragana group in Genki order.
 *   - If ALL characters in a group are 'Mastered', a completion banner fires.
 *   - At most ONE banner is shown at a time (the first completed group not yet dismissed).
 *   - Tap to dismiss.
 *
 * This is a purely presentational component that derives state from the
 * mastery map prop — no data fetching here.
 */

import { useState, useMemo } from 'react'
import { HIRAGANA, GENKI_ORDER } from '@/lib/constants/hiragana'
import type { MasteryState } from '@/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MilestoneBannerProps {
  /** Character → MasteryState map. */
  progress: Record<string, MasteryState>
}

// ---------------------------------------------------------------------------
// Group label formatting
// ---------------------------------------------------------------------------

function formatGroupLabel(groupName: string): string {
  if (groupName === 'vowel') return 'vowel group (あいうえお)'
  if (groupName === 'n') return 'standalone ん'
  return `${groupName} group`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MilestoneBanner({ progress }: MilestoneBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Find the first completed group that hasn't been dismissed
  const banner = useMemo(() => {
    for (const group of GENKI_ORDER) {
      if (dismissed.has(group)) continue

      const groupChars = HIRAGANA.filter((h) => h.group_name === group)
      if (groupChars.length === 0) continue

      const allMastered = groupChars.every(
        (h) => (progress[h.character] ?? 'Unseen') === 'Mastered',
      )

      if (allMastered) {
        return group
      }
    }
    return null
  }, [progress, dismissed])

  if (!banner) return null

  return (
    <button
      type="button"
      aria-label="Dismiss milestone banner"
      onClick={() =>
        setDismissed((prev) => {
          const next = new Set(prev)
          next.add(banner)
          return next
        })
      }
      className={cn(
        'w-full rounded-xl px-4 py-3 text-left',
        'bg-green-100 text-green-900',
        'border border-green-300',
        'active:brightness-95',
        'transition-colors duration-150',
      )}
    >
      <p className="text-sm font-semibold">
        You completed the {formatGroupLabel(banner)}!
      </p>
      <p className="mt-0.5 text-xs text-green-700">Tap to dismiss</p>
    </button>
  )
}

export default MilestoneBanner
