/**
 * SessionProgress — Thin progress bar at the top of the session screen.
 * Shows "X / Y" label and animates fill left-to-right as cards complete.
 */

import { motion } from 'framer-motion'

interface SessionProgressProps {
  current: number
  total: number
}

export function SessionProgress({ current, total }: SessionProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full flex flex-col gap-1 px-4 pt-4">
      {/* Fill bar */}
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Count label */}
      <p className="text-xs text-muted-foreground text-right">
        {current} / {total}
      </p>
    </div>
  )
}
