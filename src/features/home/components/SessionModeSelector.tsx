/**
 * SessionModeSelector — three buttons that start a study session.
 *
 * Mode handoff contract: React Router location state.
 * On tap, navigates to '/session' with { state: { mode: SessionMode } }.
 * PER-14 (study session) should read `location.state?.mode` on mount to
 * initialise the session queue. This is preferred over the Zustand slot
 * because it's a one-shot intent that disappears after the session starts,
 * keeping Zustand for persistent/shared state only.
 *
 * Modes (per docs/FEATURES.md §3):
 *   learn        — 5 new cards + all due today
 *   review-recent — cards introduced in the last 7 days that are due
 *   review-all   — every card due today (full FSRS history)
 */

import { useNavigate } from 'react-router-dom'
import type { SessionMode } from '@/types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModeConfig {
  mode: SessionMode
  emoji: string
  label: string
  description: string
  colourClass: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODES: ModeConfig[] = [
  {
    mode: 'learn',
    emoji: '🌱',
    label: 'Learn',
    description: '5 new + due today',
    colourClass:
      'bg-green-50 border-green-200 text-green-900 active:bg-green-100',
  },
  {
    mode: 'review-recent',
    emoji: '🔁',
    label: 'Review Recent',
    description: 'Last 7 days, due now',
    colourClass:
      'bg-amber-50 border-amber-200 text-amber-900 active:bg-amber-100',
  },
  {
    mode: 'review-all',
    emoji: '📚',
    label: 'Review All',
    description: 'All due today',
    colourClass:
      'bg-blue-50 border-blue-200 text-blue-900 active:bg-blue-100',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionModeSelector() {
  const navigate = useNavigate()

  function handleSelect(mode: SessionMode) {
    // Handoff: React Router location state (see module docstring)
    navigate('/session', { state: { mode } })
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Start a session
      </h2>

      <div className="flex flex-col gap-2.5">
        {MODES.map(({ mode, emoji, label, description, colourClass }) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleSelect(mode)}
            className={cn(
              'flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left',
              'transition-colors duration-100',
              colourClass,
            )}
          >
            <span className="text-2xl" aria-hidden="true">
              {emoji}
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{label}</p>
              <p className="text-xs opacity-70">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SessionModeSelector
