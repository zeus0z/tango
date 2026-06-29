import { lazy, Suspense, useEffect, useState } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ---------------------------------------------------------------------------
// Lazy page imports — each page must be a default export.
// lazyWithRetry catches chunk-not-found errors (stale deployment) and reloads.
// ---------------------------------------------------------------------------

type LazyFactory<T> = () => Promise<{ default: T }>

function lazyWithRetry<T extends React.ComponentType<unknown>>(factory: LazyFactory<T>) {
  return lazy(() =>
    factory().catch(() => {
      // Chunk hash mismatch after a new deploy — hard reload gets fresh index.html.
      window.location.reload()
      return new Promise<never>(() => {})
    }),
  )
}

const LandingPage = lazyWithRetry(() => import('@/pages/LandingPage'))
const LoginPage = lazyWithRetry(() => import('@/pages/LoginPage'))
const HomePage = lazyWithRetry(() => import('@/pages/HomePage'))
const SessionPage = lazyWithRetry(() => import('@/pages/SessionPage'))
const InfiniteReviewPage = lazyWithRetry(() => import('@/pages/InfiniteReviewPage'))
const ProgressPage = lazyWithRetry(() => import('@/pages/ProgressPage'))

// ---------------------------------------------------------------------------
// Route-level error element — shown when React Router catches an error
// (loader/action failures, lazy import errors that slip past lazyWithRetry, etc.)
// ---------------------------------------------------------------------------

function RouteErrorPage() {
  const error = useRouteError()
  const isChunkError =
    error instanceof TypeError && error.message.includes('dynamically imported module')

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'

  const description = isChunkError
    ? 'The app was updated. Reload to get the latest version.'
    : 'An unexpected error occurred. Try refreshing the page.'

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

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
 * - Drive auth state from a single `onAuthStateChange` subscription only.
 * - Initialise session as `undefined` (loading) and update on the first event
 *   (`INITIAL_SESSION`, `SIGNED_IN`, or `SIGNED_OUT`).
 * - Show a loading indicator until the first event fires.
 * - If unauthenticated → redirect to `/`.
 *
 * Why NOT `getSession()` first:
 * After Google OAuth, Supabase returns tokens in the URL hash at the redirect
 * target (`/home`). The client must asynchronously extract and exchange those
 * tokens before a session exists. Calling `getSession()` immediately on mount
 * races against this hash processing and returns `null`, triggering a redirect
 * to `/` before `onAuthStateChange` fires `SIGNED_IN`. Using only
 * `onAuthStateChange` lets the Supabase client always be the source of truth —
 * it fires `INITIAL_SESSION` for existing sessions and `SIGNED_IN` after OAuth.
 *
 * Seam for A1: A1 calls `setAuthSession` in `src/lib/store.ts` inside a
 * separate `onAuthStateChange` listener (via AppAuthProvider) to keep the
 * Zustand store in sync without restructuring this component.
 */
function ProtectedRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // Drive auth state from onAuthStateChange only — avoids the getSession()
    // race condition on OAuth redirect (see JSDoc above).
    // Fires INITIAL_SESSION (existing/null session) or SIGNED_IN (after OAuth).
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
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
    errorElement: <RouteErrorPage />,
  },

  // ── Protected routes ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorPage />,
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
        path: '/infinite-review',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InfiniteReviewPage />
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
