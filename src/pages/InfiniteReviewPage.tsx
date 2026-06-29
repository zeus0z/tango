/**
 * InfiniteReviewPage — /infinite-review
 *
 * Setup / details screen for Infinite Review (PER-26). Explains the mode and
 * lets the user pick ONE script to practice. Scripts with no learnt cards are
 * disabled. Start hands off to /session via React Router location state
 * (same contract as SessionModeSelector).
 *
 * Infinite Review is pure practice — it never affects the FSRS schedule.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAppStore } from '@/lib/store'
import { useLearntScriptCounts } from '@/features/session'
import type { ScriptType } from '@/types'
import { cn } from '@/lib/utils'

interface ScriptOption {
  script: ScriptType
  emoji: string
  label: string
}

const SCRIPTS: ScriptOption[] = [
  { script: 'hiragana', emoji: 'あ', label: 'Hiragana' },
  { script: 'katakana', emoji: 'ア', label: 'Katakana' },
  { script: 'kanji', emoji: '漢', label: 'Kanji' },
]

export default function InfiniteReviewPage() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const userId = session?.user.id ?? ''

  const { data: counts, isLoading } = useLearntScriptCounts(userId)
  const [selected, setSelected] = useState<ScriptType | null>(null)

  function handleStart() {
    if (!selected) return
    navigate('/session', { state: { mode: 'infinite-review', script: selected } })
  }

  return (
    <PageTransition>
      <div className="flex min-h-svh flex-col px-5 pt-safe-or-6 pb-safe-or-6">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="min-h-[44px] self-start -ml-1 px-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:bg-muted/60 cursor-pointer"
        >
          ← Home
        </button>

        <div className="mt-4 space-y-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <span aria-hidden="true">♾️</span> Infinite Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Practice <span className="font-medium text-foreground">every card you've
            already learnt</span> of one script, on an endless loop. Great for extra
            drilling before a test.
          </p>
          <p className="text-xs text-muted-foreground">
            This is practice only — it{' '}
            <span className="font-medium">does not affect your spaced-repetition
            schedule</span>. For real progress, keep doing your daily Learn sessions.
          </p>
        </div>

        {/* Script chooser */}
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Choose a script
          </h2>

          <div className="flex flex-col gap-2.5">
            {SCRIPTS.map(({ script, emoji, label }) => {
              const count = counts?.[script] ?? 0
              const disabled = isLoading || count === 0
              const isSelected = selected === script

              return (
                <button
                  key={script}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelected(script)}
                  className={cn(
                    'flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left',
                    'transition-colors duration-100',
                    disabled
                      ? 'cursor-not-allowed border-border bg-muted/40 text-muted-foreground opacity-60'
                      : isSelected
                        ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted/40 hover:border-primary/50 active:bg-muted/60 cursor-pointer',
                  )}
                >
                  <span className="text-2xl" lang="ja" aria-hidden="true">
                    {emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-tight">{label}</p>
                    <p className="text-xs opacity-70">
                      {isLoading
                        ? 'Loading…'
                        : count === 0
                          ? 'No cards learnt yet'
                          : `${count} card${count === 1 ? '' : 's'} learnt`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Start */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            disabled={!selected}
            onClick={handleStart}
            className={cn(
              'w-full min-h-[56px] rounded-2xl font-bold text-base shadow-sm',
              'transition-transform duration-75',
              selected
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 cursor-pointer'
                : 'cursor-not-allowed bg-muted text-muted-foreground',
            )}
          >
            Start practising
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
