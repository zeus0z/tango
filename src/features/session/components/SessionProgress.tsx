/**
 * SessionProgress — Thin progress bar at the top of the session screen.
 * Shows "X / Y" label and animates fill left-to-right as cards complete.
 */

import { motion } from 'framer-motion'
import { t } from '@/lib/constants/strings'

interface SessionProgressProps {
  current: number
  total: number
  onExit?: () => void
}

export function SessionProgress({ current, total, onExit }: SessionProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full flex flex-col px-4 pt-4 gap-1">
      {onExit ? (
        <div className="flex items-center justify-between mb-1">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[44px] px-3 -ml-1 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:bg-muted/60 cursor-pointer"
          >
            {t.common.backHome}
          </button>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {current} / {total}
          </span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-right">
          {current} / {total}
        </p>
      )}

      {/* Fill bar */}
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
