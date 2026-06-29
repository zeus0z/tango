import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Wraps page content in a Framer Motion div for route-change transitions.
 * Used inside every page component as the outermost wrapper.
 *
 * Must be a child of <AnimatePresence> (rendered in App.tsx) to get exit
 * animations. Each page component must set a unique `key` on its route so
 * AnimatePresence can track exits.
 */
function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex min-h-svh flex-col"
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
