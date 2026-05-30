/**
 * AppAuthProvider — mounts once at the app root.
 *
 * Wires supabase.auth.onAuthStateChange into the Zustand store so that any
 * component calling useAuthSession() gets a live, up-to-date session.
 *
 * This is a renderless provider (no UI). Mount it inside QueryClientProvider
 * but outside the router so the subscription persists across route changes.
 *
 * Usage (main.tsx or App.tsx):
 *   <AppAuthProvider>
 *     <AppRouter />
 *   </AppAuthProvider>
 */

import { type ReactNode } from 'react'
import { useAuthListener } from './useAuth'

interface AppAuthProviderProps {
  children: ReactNode
}

export default function AppAuthProvider({ children }: AppAuthProviderProps) {
  useAuthListener()
  return <>{children}</>
}
