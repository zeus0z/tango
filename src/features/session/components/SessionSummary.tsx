/**
 * SessionSummary — Shown when the session queue empties.
 *
 * Displays: total reviewed, accuracy %, new cards learned, return home button.
 */

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { t } from '@/lib/constants/strings'

interface SessionSummaryProps {
  totalReviewed: number
  totalCorrect: number
  newLearned: number
}

export function SessionSummary({ totalReviewed, totalCorrect, newLearned }: SessionSummaryProps) {
  const navigate = useNavigate()
  const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-10"
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-4xl mb-2">🎉</p>
        <h1 className="text-2xl font-bold text-foreground">{t.sessionSummary.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.sessionSummary.subtitle}</p>
      </div>

      {/* Stats grid */}
      <div className="w-full grid grid-cols-3 gap-3">
        <StatCard label={t.sessionSummary.reviewed} value={String(totalReviewed)} />
        <StatCard label={t.sessionSummary.accuracy} value={`${accuracy}%`} highlight={accuracy >= 80} />
        <StatCard label={t.sessionSummary.learned} value={String(newLearned)} />
      </div>

      {/* Return home */}
      <button
        type="button"
        onClick={() => navigate('/home')}
        className="w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground font-bold text-base active:scale-95 transition-transform duration-75 shadow-sm"
      >
        {t.sessionSummary.returnHome}
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Stat card sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string
  highlight?: boolean
}

function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-card-bg py-4 px-2 shadow-sm">
      <span
        className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  )
}
