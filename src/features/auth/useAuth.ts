/**
 * useAuth — central auth hook for Tango.
 *
 * Responsibilities:
 * 1. Subscribe to supabase.auth.onAuthStateChange once (at app boot via AppAuthProvider).
 * 2. Keep the Zustand store's `session` + `sessionResolved` slots in sync via `setAuthSession`.
 * 3. Expose convenience selectors + action helpers to consuming components.
 *
 * Important:
 * - This is the ONLY `onAuthStateChange` subscription in the app. ProtectedRoute
 *   in router.tsx reads `session`/`sessionResolved` from the Zustand store rather
 *   than subscribing itself — a second, independent subscription there used to
 *   cause an intermittent bounce back to `/` right after sign-in (see router.tsx
 *   for the full explanation), since a freshly-created subscriber's first event
 *   can race a just-completed sign-in.
 * - The subscription is established once inside AppAuthProvider (src/features/auth/AppAuthProvider.tsx)
 *   which is mounted near the root. Components call useAuth() to get the derived values.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'
import { useAppStore, useAuthSession, useIsSessionResolved, useSetAuthSession } from '@/lib/store'
import { t } from '@/lib/constants/strings'
import { signOut as authSignOut } from './authService'

// ---------------------------------------------------------------------------
// AppAuthProvider hook — call once at the app root to wire onAuthStateChange
// ---------------------------------------------------------------------------

/**
 * Sets up the global auth state listener.
 * Must be called once inside a component that is mounted for the app's lifetime
 * (e.g. AppAuthProvider). It subscribes to supabase.auth.onAuthStateChange and
 * syncs the Zustand store on every auth event.
 *
 * Uses only onAuthStateChange (not getSession first) — see ProtectedRoute in
 * router.tsx for the full explanation.
 */
export function useAuthListener() {
  const setAuthSession = useSetAuthSession()

  useEffect(() => {
    // Drive auth state from onAuthStateChange only.
    // Fires INITIAL_SESSION (existing/null session) or SIGNED_IN (after OAuth).
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
  const sessionResolved = useIsSessionResolved()
  const navigate = useNavigate()

  const isLoading = !sessionResolved
  const user = session?.user ?? null

  async function logout() {
    const { error } = await authSignOut()
    if (error) {
      toast.error(t.auth.signOutError)
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
