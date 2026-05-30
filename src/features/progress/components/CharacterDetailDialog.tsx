/**
 * CharacterDetailDialog — shows mastery details for a single hiragana character.
 *
 * Opened when the user taps a cell in the AlphabetProgressMap on /progress.
 * Shows:
 *   - The character (large, lang="ja")
 *   - Romaji + Genki order + group name
 *   - Current mastery state (coloured pill)
 *   - Next review date (relative)
 *   - Reps + lapses + accuracy (from review_logs if available)
 *   - "Not seen yet" state for unseen cards
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { MasteryState } from '@/types'
import type { ProgressRow } from '../services/progress.service'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CharacterDetailDialogProps {
  /** The selected character, or null when dialog is closed. */
  character: string | null
  /** Full progress row for the character, or undefined if not yet seen. */
  progressRow: ProgressRow | undefined
  /** Precomputed mastery state (from the map). */
  mastery: MasteryState
  /** Call to close the dialog. */
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MASTERY_PILL: Record<MasteryState, string> = {
  Unseen: 'bg-muted text-muted-foreground',
  Learning: 'bg-amber-200 text-amber-900',
  Review: 'bg-blue-200 text-blue-900',
  Mastered: 'bg-green-300 text-green-900',
}

function formatRelativeDate(isoDate: string): string {
  const now = Date.now()
  const due = new Date(isoDate).getTime()
  const diffMs = due - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday (overdue)'
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 14) return 'In 1 week'
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`
  if (diffDays < 365) return `In ${Math.round(diffDays / 30)} months`
  return `In ${Math.round(diffDays / 365)} years`
}

function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return '—'
  return `${Math.round((correct / total) * 100)}%`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterDetailDialog({
  character,
  progressRow,
  mastery,
  onClose,
}: CharacterDetailDialogProps) {
  const isOpen = character !== null

  if (!isOpen) return null

  const isSeen = mastery !== 'Unseen'
  const accuracy = progressRow
    ? formatAccuracy(
        progressRow.reps - progressRow.lapses,
        progressRow.reps,
      )
    : '—'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle asChild>
            {/* Large character display */}
            <div className="flex flex-col items-center gap-1 pb-1">
              <span
                lang="ja"
                className="font-ja text-8xl font-bold leading-none"
                aria-label={`Character: ${character}`}
              >
                {character}
              </span>
              {progressRow && (
                <span className="text-muted-foreground text-base font-normal">
                  {progressRow.romaji}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3 pt-2 text-left">
              {/* Metadata row */}
              {progressRow && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{progressRow.group_name.replace('-group', ' group')}</span>
                  <span>·</span>
                  <span>Genki #{progressRow.genki_order}</span>
                </div>
              )}

              {/* Mastery pill */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Mastery</span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    MASTERY_PILL[mastery],
                  )}
                >
                  {mastery}
                </span>
              </div>

              {isSeen && progressRow ? (
                <>
                  {/* Next review */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next review</span>
                    <span className="font-medium text-foreground">
                      {formatRelativeDate(progressRow.due)}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{progressRow.reps}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{progressRow.lapses}</p>
                      <p className="text-xs text-muted-foreground">Lapses</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{accuracy}</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </div>

                  {/* Stability */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stability</span>
                    <span className="font-medium text-foreground">
                      {progressRow.stability.toFixed(1)}d
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven't studied this character yet. It will appear once introduced in a session.
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
