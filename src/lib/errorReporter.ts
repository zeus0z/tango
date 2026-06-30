/**
 * Pluggable production error reporter.
 *
 * By default this is a no-op in both dev and prod.
 * Wire in your error-monitoring service in main.tsx:
 *
 *   import { setErrorReporter } from '@/lib/errorReporter'
 *   import * as Sentry from '@sentry/browser'
 *   Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })
 *   setErrorReporter((err, ctx) => Sentry.captureException(err, { extra: ctx }))
 *
 * No call to setErrorReporter = silent in production (errors will not be swallowed
 * in dev — they are always logged to the console there).
 */

type ErrorReporter = (error: Error, context?: Record<string, unknown>) => void

let _reporter: ErrorReporter = () => {}

/** Wire in a production error reporter once at app boot (e.g. Sentry.captureException). */
export function setErrorReporter(fn: ErrorReporter): void {
  _reporter = fn
}

/**
 * Report an error to the external service (if configured).
 * Always logs to console in dev; always calls the reporter in prod.
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // In dev, surface errors visibly so nothing is silently swallowed.
    console.error('[errorReporter]', error, context)
    return
  }
  _reporter(error, context)
}
