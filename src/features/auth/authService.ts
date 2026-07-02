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
// Google Sign-In (Google Identity Services)
// ---------------------------------------------------------------------------

/**
 * Completes Google sign-in from a GIS ID token (see GoogleSignInButton).
 * Runs entirely client-side — no redirect through Supabase's hosted domain.
 * Supabase verifies the token against the Google provider's Client ID
 * configured in the dashboard, then calls onAuthStateChange with the new session.
 */
export async function signInWithGoogleIdToken(idToken: string, nonce: string) {
  return supabase.auth.signInWithIdToken({ provider: 'google', token: idToken, nonce })
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

/** Signs out the current user globally (invalidates all sessions). */
export async function signOut() {
  return supabase.auth.signOut()
}
