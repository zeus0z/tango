import { lazy, Suspense, useEffect } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom'
import { useAuthSession, useIsSessionResolved } from '@/lib/store'
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
 * Guards all routes that require an authenticated Supabase session.
 *
 * Auth resolution strategy:
 * - Read `session` + `sessionResolved` from the Zustand store, which is kept
 *   in sync by the single `onAuthStateChange` subscription in `useAuthListener`
 *   (src/features/auth/useAuth.ts), mounted once at app boot via AppAuthProvider.
 * - Show a loading indicator until `sessionResolved` is true.
 * - If unauthenticated → redirect to `/`.
 *
 * This component used to maintain its own, independent `onAuthStateChange`
 * subscription. That subscription was created fresh every time this layout
 * route mounted — i.e. exactly when navigating here right after sign-in — and
 * a brand-new subscriber's first event can be delivered before the
 * just-created session is visible to it (GoTrueClient queues it behind an
 * internal lock). That caused an intermittent bounce back to `/` on the
 * first Google sign-in attempt (a second attempt always worked, since by
 * then there was no lock contention left). Reading from the store instead
 * means there's only ever one subscription — already alive since app boot,
 * well before any sign-in starts — so there's no fresh-subscriber race.
 */
function ProtectedRoute() {
  const session = useAuthSession()
  const sessionResolved = useIsSessionResolved()

  // Waiting for the initial session check.
  if (!sessionResolved) {
    return <PageLoader />
  }

  // Not authenticated — redirect to landing page.
  if (!session) {
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
