/**
 * Global client-state store (Zustand).
 *
 * RULE: Only GLOBAL CLIENT state lives here — NOT server data.
 * Server data (cards, progress from Supabase) belongs in TanStack Query.
 *
 * Slots:
 * ─────────────────────────────────────────────────────────────────────────────
 * auth          — Supabase session. A1 (auth feature) will call `setAuthSession`
 *                 inside `supabase.auth.onAuthStateChange` to populate this slot.
 *                 ProtectedRoute reads `session` to gate access.
 *
 * sessionMode   — Which study mode the user picked on the home screen.
 * sessionQueue  — Ordered list of card IDs queued for the current session.
 *                 A4 (session feature) will populate this before navigating to
 *                 /session.
 *
 * dailyProgress — Lightweight counters shown on the home screen badge.
 *                 A4 updates these after each reviewed card.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import type { SessionMode } from '@/types'

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface AppStore {
  // ── Auth ──────────────────────────────────────────────────────────────────
  /** Current Supabase session — null means logged-out or not yet resolved. */
  session: Session | null
  /**
   * Called by A1 inside supabase.auth.onAuthStateChange.
   * Example:
   *   supabase.auth.onAuthStateChange((_event, session) => setAuthSession(session))
   */
  setAuthSession: (session: Session | null) => void

  // ── Study session ─────────────────────────────────────────────────────────
  /** Mode selected by user on the home screen. */
  sessionMode: SessionMode | null
  /** Ordered card IDs to review in the current session. */
  sessionQueue: string[]
  /**
   * Set by A4 before navigating to /session.
   * Example:
   *   setStudySession('learn', newCardIds)
   *   navigate('/session')
   */
  setStudySession: (mode: SessionMode, queue: string[]) => void
  clearStudySession: () => void

  // ── Daily progress ────────────────────────────────────────────────────────
  /** Cards reviewed today (incremented by A4 after each review). */
  reviewedToday: number
  /** New cards introduced today. */
  learnedToday: number
  /** Increment reviewed count by n (default 1). */
  incrementReviewed: (n?: number) => void
  /** Increment learned count by n (default 1). */
  incrementLearned: (n?: number) => void
  /** Reset to zero (called at session start or midnight rollover). */
  resetDailyProgress: () => void
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useAppStore = create<AppStore>((set) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  session: null,
  setAuthSession: (session) => set({ session }),

  // ── Study session ─────────────────────────────────────────────────────────
  sessionMode: null,
  sessionQueue: [],
  setStudySession: (mode, queue) => set({ sessionMode: mode, sessionQueue: queue }),
  clearStudySession: () => set({ sessionMode: null, sessionQueue: [] }),

  // ── Daily progress ────────────────────────────────────────────────────────
  reviewedToday: 0,
  learnedToday: 0,
  incrementReviewed: (n = 1) => set((s) => ({ reviewedToday: s.reviewedToday + n })),
  incrementLearned: (n = 1) => set((s) => ({ learnedToday: s.learnedToday + n })),
  resetDailyProgress: () => set({ reviewedToday: 0, learnedToday: 0 }),
}))

// ---------------------------------------------------------------------------
// Selector hooks — prefer these in components for focused re-renders
// ---------------------------------------------------------------------------

/** Returns the current Supabase session (null if logged out / not resolved). */
export function useAuthSession() {
  return useAppStore((s) => s.session)
}

/** Returns the auth session setter. Wire into onAuthStateChange in A1. */
export function useSetAuthSession() {
  return useAppStore((s) => s.setAuthSession)
}

/** Returns daily progress counters. */
export function useDailyProgress() {
  return useAppStore((s) => ({
    reviewedToday: s.reviewedToday,
    learnedToday: s.learnedToday,
  }))
}

/** Returns the current session queue and mode. */
export function useSessionQueue() {
  return useAppStore((s) => ({
    sessionMode: s.sessionMode,
    sessionQueue: s.sessionQueue,
  }))
}
