/**
 * Auth service — thin wrappers around Supabase Auth.
 *
 * All calls go through the singleton `supabase` client from `@/lib/supabase`.
 * Never instantiate a new client here.
 */

import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Email / Password
// ---------------------------------------------------------------------------

/** Sign up with email + password. Returns the Supabase AuthResponse. */
export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

/** Sign in with email + password. Returns the Supabase AuthTokenResponse. */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------

/**
 * Initiates Google OAuth sign-in.
 * The redirect URL must match the Supabase project dashboard configuration.
 * After the OAuth round-trip Supabase will call onAuthStateChange with the new session.
 */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  })
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

/** Signs out the current user globally (invalidates all sessions). */
export async function signOut() {
  return supabase.auth.signOut()
}
