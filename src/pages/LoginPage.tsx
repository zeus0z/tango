/**
 * LoginPage — sign-in with Google (Google Identity Services).
 *
 * UX:
 * - Google Sign-In button (primary CTA, full-width) via GoogleSignInButton
 * - After success → navigate to /home
 * - Errors → toast (sonner)
 *
 * Email/password is temporarily disabled — see docs/email-templates.md
 * "Future polish" for why (Supabase's built-in mailer caps confirmation
 * emails at 2/hour with no custom SMTP configured yet).
 *
 * Mobile-first: tap targets ≥48px, active: states, safe-area padding.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'
import { useAuthSession } from '@/features/auth/useAuth'
import { t } from '@/lib/constants/strings'

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const session = useAuthSession()
  const navigate = useNavigate()

  // GIS sign-in resolves the session in-page (no redirect), so this effect
  // is what actually navigates to /home once onAuthStateChange fires.
  useEffect(() => {
    if (session) {
      navigate('/home', { replace: true })
    }
  }, [session, navigate])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
          {/* ── Branding ── */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-bold tracking-tight">日本語フラッシュ</h1>
            <p className="text-muted-foreground text-sm">{t.auth.loginSubtitle}</p>
          </div>

          {/* ── Auth card ── */}
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t.auth.welcomeTitle}</CardTitle>
              <CardDescription>{t.auth.welcomeDescription}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* ── Google Sign-In ── */}
              <GoogleSignInButton />

              {/* Email/password sign-in is temporarily disabled — see the
                  file header comment above for why. Re-enable once a custom
                  SMTP provider (docs/email-templates.md) is configured:

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-muted-foreground text-xs">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="auth-email">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="auth-password">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    placeholder={isSignUp ? 'Create a password' : 'Your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || googleLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || googleLoading || !email.trim() || !password}
                >
                  {loading
                    ? isSignUp
                      ? 'Creating account…'
                      : 'Signing in…'
                    : isSignUp
                      ? 'Create account'
                      : 'Sign in'}
                </Button>
              </form>
              */}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </PageTransition>
  )
}
