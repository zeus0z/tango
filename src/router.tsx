import { lazy, Suspense, useEffect, useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Lazy page imports — each page must be a default export
// ---------------------------------------------------------------------------

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const HomePage = lazy(() => import('@/pages/HomePage'))
const SessionPage = lazy(() => import('@/pages/SessionPage'))
const ProgressPage = lazy(() => import('@/pages/ProgressPage'))

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------

function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading…</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------

/**
 * Guards all routes that require an authenticated Supabase session.
 *
 * Auth resolution strategy:
 * 1. On mount: call `supabase.auth.getSession()` to check the existing session.
 * 2. Subscribe to `onAuthStateChange` for live updates.
 * 3. Show a loading indicator while the initial resolution is in flight.
 * 4. If unauthenticated → redirect to `/`.
 *
 * Seam for A1: A1 can additionally call `setAuthSession` in `src/lib/store.ts`
 * inside the same `onAuthStateChange` listener to keep the Zustand store in sync
 * without restructuring this component.
 */
function ProtectedRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Resolve the existing session once on mount.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Keep in sync with auth state changes (login / logout / token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Waiting for the initial session check.
  if (session === undefined) {
    return <PageLoader />
  }

  // Not authenticated — redirect to landing page.
  if (session === null) {
    return <Navigate to="/" replace />
  }

  // Authenticated — render the requested route.
  return <Outlet />
}

// ---------------------------------------------------------------------------
// Route table
// ALL app routes must be defined here.
// Feature agents fill the page bodies; they must NOT add routes.
// ---------------------------------------------------------------------------

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },

  // ── Protected routes ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/home',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/session',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SessionPage />
          </Suspense>
        ),
      },
      {
        path: '/progress',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgressPage />
          </Suspense>
        ),
      },
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
