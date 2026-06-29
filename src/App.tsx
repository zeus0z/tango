import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AppRouter } from '@/router'
import AppAuthProvider from '@/features/auth/AppAuthProvider'

/**
 * Root application component.
 *
 * Composition order:
 *   ErrorBoundary    — catches JS errors anywhere in the tree
 *     AppAuthProvider  — wires supabase.auth.onAuthStateChange → Zustand store (A1)
 *       AnimatePresence — enables exit animations for PageTransition
 *         AppRouter      — route table + lazy-loaded pages
 *
 * QueryClientProvider and Toaster are in main.tsx (outside the router so they
 * persist across route changes and are available during SSR error states).
 */
function App() {
  return (
    <ErrorBoundary>
      <AppAuthProvider>
        <AnimatePresence mode="wait" initial={false}>
          <AppRouter />
        </AnimatePresence>
      </AppAuthProvider>
    </ErrorBoundary>
  )
}

export default App
