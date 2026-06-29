import { QueryClient } from '@tanstack/react-query'

/**
 * Singleton QueryClient for the app.
 * - staleTime: 1 min — avoids refetch on every focus for data that doesn't change often
 * - gcTime: 5 min — keep unused cache around for quick back-navigation
 * - retry: 1 — one retry on transient network errors, then fail fast
 * - refetchOnWindowFocus: true (default) — re-sync when user returns to the tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
