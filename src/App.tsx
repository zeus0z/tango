import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AppRouter } from '@/router'

/**
 * Root application component.
 *
 * Composition order:
 *   ErrorBoundary  — catches JS errors anywhere in the tree
 *     AnimatePresence — enables exit animations for PageTransition
 *       AppRouter      — route table + lazy-loaded pages
 *
 * QueryClientProvider and Toaster are in main.tsx (outside the router so they
 * persist across route changes and are available during SSR error states).
 */
function App() {
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <AppRouter />
      </AnimatePresence>
    </ErrorBoundary>
  )
}

export default App
