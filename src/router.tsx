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
import { reportError } from '@/lib/errorReporter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { t } from '@/lib/constants/strings'

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
const AccountPage = lazyWithRetry(() => import('@/pages/AccountPage'))

// ---------------------------------------------------------------------------
// Route-level error element — shown when React Router catches an error
// (loader/action failures, lazy import errors that slip past lazyWithRetry, etc.)
// ---------------------------------------------------------------------------

function RouteErrorPage() {
  const error = useRouteError()

  const is404 = isRouteErrorResponse(error) && error.status === 404
  const isChunkError =
    error instanceof TypeError && error.message.includes('dynamically imported module')

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t.errors.somethingWentWrong

  const description = is404
    ? t.errors.unexpectedError
    : isChunkError
    ? t.errors.appUpdated
    : t.errors.tryRefreshing

  // Report unexpected errors (not 404s or deliberate chunk reloads) to the
  // external error service configured in errorReporter.ts.
  useEffect(() => {
    if (!is404 && !isChunkError && error instanceof Error) {
      reportError(error)
    }
  }, [error, is404, isChunkError])

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.location.reload()}>
            {t.errors.reload}
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
      <span className="text-muted-foreground text-sm">{t.common.loading}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------

/**
 * True if the current URL still carries an unprocessed OAuth redirect param
 * (PKCE `?code=` or legacy implicit-flow `#access_token=`). Used to avoid
 * treating a null session as final before Supabase finishes the async token
 * exchange — see the race explained in the JSDoc below.
 */
function hasPendingOAuthParams() {
  const { search, hash } = window.location
  return search.includes('code=') || hash.includes('access_token=')
}

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
 * The same race can still happen with `onAuthStateChange` alone: the PKCE
 * code exchange is an async network call, and on a slow connection the first
 * `INITIAL_SESSION` event can fire with `session: null` before that exchange
 * resolves. If we redirected to `/` on that first null, this component
 * unmounts and unsubscribes — so the real `SIGNED_IN` event that arrives a
 * moment later has nobody listening, and the user gets stranded on the
 * public page despite having just signed in. When the URL still has pending
 * OAuth params, we ignore exactly one leading null event and wait for the
 * next one instead (an 8s timeout guards against the exchange failing
 * outright, e.g. an expired/invalid code).
 *
 * Seam for A1: A1 calls `setAuthSession` in `src/lib/store.ts` inside a
 * separate `onAuthStateChange` listener (via AppAuthProvider) to keep the
 * Zustand store in sync without restructuring this component.
 */
function ProtectedRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    const pendingOAuth = hasPendingOAuthParams()
    let isFirstEvent = true
    let settled = false

    const timeoutId = pendingOAuth
      ? window.setTimeout(() => {
          if (!settled) {
            settled = true
            setSession(null)
          }
        }, 8000)
      : undefined

    // Drive auth state from onAuthStateChange only — avoids the getSession()
    // race condition on OAuth redirect (see JSDoc above).
    // Fires INITIAL_SESSION (existing/null session) or SIGNED_IN (after OAuth).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const skipLeadingNull = isFirstEvent && pendingOAuth && s === null
      isFirstEvent = false
      if (skipLeadingNull) return

      settled = true
      if (timeoutId) window.clearTimeout(timeoutId)
      setSession(s)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
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
        errorElement: <RouteErrorPage />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: '/session',
        errorElement: <RouteErrorPage />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <SessionPage />
          </Suspense>
        ),
      },
      {
        path: '/infinite-review',
        errorElement: <RouteErrorPage />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <InfiniteReviewPage />
          </Suspense>
        ),
      },
      {
        path: '/progress',
        errorElement: <RouteErrorPage />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgressPage />
          </Suspense>
        ),
      },
      {
        path: '/account',
        errorElement: <RouteErrorPage />,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccountPage />
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
