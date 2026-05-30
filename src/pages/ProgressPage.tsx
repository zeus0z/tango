/**
 * /progress — Progress & stats dashboard.
 *
 * Sections:
 *   1. Interactive alphabet progress map (AlphabetProgressMap size="lg")
 *      Tapping a character opens CharacterDetailDialog.
 *   2. Study history heatmap (StudyHeatmap) — last 12 weeks.
 *   3. Weak cards list (WeakCardsList) — lowest accuracy, min 3 reviews.
 *
 * All data via TanStack Query hooks in src/features/progress/hooks/useProgressData.ts.
 * Auth via useAuth — userId gates all queries.
 */

import { useState } from 'react'
import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'
import AlphabetProgressMap from '@/components/AlphabetProgressMap'
import { useAuth } from '@/features/auth/useAuth'
import {
  useProgressMap,
  useStudyHistory,
  useWeakCards,
  CharacterDetailDialog,
  StudyHeatmap,
  WeakCardsList,
} from '@/features/progress'
import type { MasteryState } from '@/types'

// ---------------------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ProgressPage() {
  const { user } = useAuth()
  const userId = user?.id

  // -- Data ------------------------------------------------------------------
  const { data: progressData, isLoading: mapLoading } = useProgressMap(userId)
  const { data: history, isLoading: historyLoading } = useStudyHistory(userId)
  const { data: weakCards, isLoading: weakLoading } = useWeakCards(userId)

  // -- Dialog state ----------------------------------------------------------
  const [selectedChar, setSelectedChar] = useState<string | null>(null)

  const masteryMap: Record<string, MasteryState> = progressData?.mastery ?? {}
  const detailMap = progressData?.detail ?? {}

  const selectedProgress = selectedChar ? detailMap[selectedChar] : undefined
  const selectedMastery: MasteryState = selectedChar
    ? (masteryMap[selectedChar] ?? 'Unseen')
    : 'Unseen'

  // -------------------------------------------------------------------------

  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-1 flex-col gap-6 px-4 py-6 pb-safe">
          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Progress</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your hiragana mastery at a glance
            </p>
          </div>

          {/* ── Section 1: Alphabet map ─────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <SectionHeader title="Hiragana map" />
            {mapLoading ? (
              <div className="flex justify-center py-8">
                <span className="text-sm text-muted-foreground">Loading map…</span>
              </div>
            ) : (
              <AlphabetProgressMap
                progress={masteryMap}
                size="lg"
                onCellPress={setSelectedChar}
              />
            )}

            {/* Legend */}
            {!mapLoading && (
              <div className="flex flex-wrap justify-center gap-3 pt-1">
                {(['Unseen', 'Learning', 'Review', 'Mastered'] as MasteryState[]).map((state) => {
                  const colours: Record<MasteryState, string> = {
                    Unseen: 'bg-muted',
                    Learning: 'bg-amber-200',
                    Review: 'bg-blue-200',
                    Mastered: 'bg-green-300',
                  }
                  return (
                    <div key={state} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-sm ${colours[state]}`} />
                      <span className="text-xs text-muted-foreground">{state}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Section 2: Study history heatmap ───────────────────────── */}
          <section className="flex flex-col gap-3">
            <SectionHeader title="Study history" />
            {historyLoading ? (
              <div className="flex justify-center py-6">
                <span className="text-sm text-muted-foreground">Loading history…</span>
              </div>
            ) : !history || history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No review history yet. Complete a study session to see your activity here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <StudyHeatmap data={history} />
              </div>
            )}
          </section>

          {/* ── Section 3: Weak cards ───────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <SectionHeader title="Weak cards" />
            <p className="text-xs text-muted-foreground -mt-1">
              Characters with the lowest accuracy (min. 3 reviews)
            </p>
            {weakLoading ? (
              <div className="flex justify-center py-6">
                <span className="text-sm text-muted-foreground">Loading…</span>
              </div>
            ) : (
              <WeakCardsList
                rows={weakCards ?? []}
                masteryMap={masteryMap}
                onCharacterPress={setSelectedChar}
              />
            )}
          </section>
        </div>

        {/* ── Character detail dialog ────────────────────────────────────── */}
        <CharacterDetailDialog
          character={selectedChar}
          progressRow={selectedProgress}
          mastery={selectedMastery}
          onClose={() => setSelectedChar(null)}
        />
      </Layout>
    </PageTransition>
  )
}
