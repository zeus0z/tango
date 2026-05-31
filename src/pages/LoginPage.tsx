/**
 * LoginPage — sign-in / sign-up with Google OAuth or email + password.
 *
 * UX:
 * - Single page with a tab toggle: "Sign in" / "Sign up"
 * - Google OAuth button (primary CTA, full-width)
 * - Divider
 * - Email + Password form
 * - After success → navigate to /home
 * - Errors → toast (sonner)
 *
 * Mobile-first: tap targets ≥48px, active: states, safe-area padding.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/features/auth/authService'

// ---------------------------------------------------------------------------
// Google icon (inline SVG — no extra dep)
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// LoginPage
// ---------------------------------------------------------------------------

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function resetForm() {
    setEmail('')
    setPassword('')
  }

  function switchTab(next: Tab) {
    setTab(next)
    resetForm()
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message || 'Google sign-in failed. Please try again.')
      }
      // On success the browser redirects; no further action needed here.
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Email / password ──────────────────────────────────────────────────────

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    try {
      if (tab === 'signup') {
        const { error } = await signUpWithEmail(email.trim(), password)
        if (error) {
          toast.error(error.message || 'Sign-up failed. Please try again.')
          return
        }
        toast.success('Account created! Check your email to confirm, then sign in.')
        switchTab('signin')
      } else {
        const { error } = await signInWithEmail(email.trim(), password)
        if (error) {
          toast.error(error.message || 'Sign-in failed. Check your credentials.')
          return
        }
        navigate('/home', { replace: true })
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isSignUp = tab === 'signup'

  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
          {/* ── Branding ── */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-bold tracking-tight">日本語フラッシュ</h1>
            <p className="text-muted-foreground text-sm">Tango — learn Japanese with SRS</p>
          </div>

          {/* ── Auth card ── */}
          <Card className="w-full max-w-sm">
            <CardHeader className="pb-4">
              {/* Tab toggle */}
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className={[
                    'flex-1 rounded-md py-2 text-sm font-medium transition-colors select-none',
                    'active:opacity-80',
                    tab === 'signin'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground',
                  ].join(' ')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className={[
                    'flex-1 rounded-md py-2 text-sm font-medium transition-colors select-none',
                    'active:opacity-80',
                    tab === 'signup'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground',
                  ].join(' ')}
                >
                  Sign up
                </button>
              </div>

              <CardTitle className="text-lg">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? 'Start your hiragana journey today.'
                  : 'Sign in to continue your practice.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* ── Google OAuth ── */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-3"
                disabled={googleLoading || loading}
                onClick={handleGoogleSignIn}
                aria-label="Continue with Google"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </Button>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-muted-foreground text-xs">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* ── Email + Password form ── */}
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
            </CardContent>
          </Card>
        </div>
      </Layout>
    </PageTransition>
  )
}
