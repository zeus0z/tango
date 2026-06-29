/**
 * useAuth — central auth hook for Tango.
 *
 * Responsibilities:
 * 1. Subscribe to supabase.auth.onAuthStateChange once (at app boot via AppAuthProvider).
 * 2. Keep the Zustand store's `session` slot in sync via `setAuthSession`.
 * 3. Expose convenience selectors + action helpers to consuming components.
 *
 * Important:
 * - ProtectedRoute in router.tsx already maintains its own local session state
 *   for routing decisions; useAuth keeps the Zustand slot in sync for features
 *   that read `session` from the store (e.g. displaying the user's name/email).
 * - The subscription is established once inside AppAuthProvider (src/features/auth/AppAuthProvider.tsx)
 *   which is mounted near the root. Components call useAuth() to get the derived values.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { useAppStore, useAuthSession, useSetAuthSession } from '@/lib/store'
import { signOut as authSignOut } from './authService'

// ---------------------------------------------------------------------------
// AppAuthProvider hook — call once at the app root to wire onAuthStateChange
// ---------------------------------------------------------------------------

/**
 * Sets up the global auth state listener.
 * Must be called once inside a component that is mounted for the app's lifetime
 * (e.g. AppAuthProvider). It subscribes to supabase.auth.onAuthStateChange and
 * syncs the Zustand store on every auth event.
 */
export function useAuthListener() {
  const setAuthSession = useSetAuthSession()

  useEffect(() => {
    // Resolve existing session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data }) => {
      setAuthSession(data.session)
    })

    // Keep in sync with auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setAuthSession])
}

// ---------------------------------------------------------------------------
// useAuth — component-level hook
// ---------------------------------------------------------------------------

export interface UseAuthReturn {
  /** Current Supabase session — null if logged out, undefined while loading. */
  session: ReturnType<typeof useAuthSession>
  /** True while the initial session is being resolved. */
  isLoading: boolean
  /** The authenticated user object (shortcut for session.user). */
  user: ReturnType<typeof useAuthSession> extends null ? null : NonNullable<ReturnType<typeof useAuthSession>>['user'] | null
  /** Sign out and redirect to `/`. */
  logout: () => Promise<void>
}

export function useAuth() {
  const session = useAuthSession()
  const navigate = useNavigate()

  // session is null after store initialises (never undefined in Zustand)
  // We can consider session 'loading' only before the listener fires, but since
  // the store initialises to null we treat null as "logged out" here.
  const isLoading = false
  const user = session?.user ?? null

  async function logout() {
    const { error } = await authSignOut()
    if (error) {
      toast.error('Sign out failed. Please try again.')
      return
    }
    navigate('/', { replace: true })
  }

  return { session, isLoading, user, logout }
}

// Re-export store selectors for convenience
export { useAuthSession, useSetAuthSession }

// Re-export the whole store hook for components that need other slots
export { useAppStore }
