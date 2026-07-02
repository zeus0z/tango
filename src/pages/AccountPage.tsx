/**
 * AccountPage — /account
 *
 * Full-screen account/appearance settings, reached by tapping the avatar on
 * Home (replaces the old dropdown menu). Holds: theme picker, font picker,
 * sign out. Secondary screen with its own back button — follows the same
 * PageTransition-only pattern as InfiniteReviewPage.tsx (not Layout, which
 * is reserved for primary bottom-nav destinations like Home/Progress).
 */

import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { useAuth } from '@/features/auth/useAuth'
import { FONT_OPTIONS, loadFont, persistAndApply } from '@/lib/fonts'
import { THEME_OPTIONS, persistAndApplyTheme, type ThemeId } from '@/lib/themes'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { t } from '@/lib/constants/strings'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const fontId = useAppStore((s) => s.fontId)
  const setFontId = useAppStore((s) => s.setFontId)
  const themeId = useAppStore((s) => s.themeId)
  const setThemeId = useAppStore((s) => s.setThemeId)

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  async function handleFontChange(newFontId: string) {
    await loadFont(newFontId)
    persistAndApply(newFontId)
    setFontId(newFontId)
  }

  function handleThemeChange(newThemeId: ThemeId) {
    persistAndApplyTheme(newThemeId)
    setThemeId(newThemeId)
  }

  return (
    <PageTransition>
      <div className="flex min-h-svh flex-col px-5 pt-safe-or-6 pb-safe-or-6">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="min-h-[44px] self-start -ml-1 px-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:bg-muted/60 cursor-pointer"
        >
          {t.common.backHome}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.account.title}</h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        {/* ── Aparência ─────────────────────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.account.appearanceHeading}
          </h2>

          {/* Tema */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{t.account.themeLabel}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = themeId === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border px-3 py-3 text-left',
                      'transition-colors duration-100',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border bg-card hover:bg-muted/40 active:bg-muted/60 cursor-pointer',
                    )}
                  >
                    <div className="grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-md">
                      {theme.swatch.map((hex, i) => (
                        <span key={i} style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold leading-tight text-foreground">
                      {theme.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fonte */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground">{t.account.fontLabel}</p>
            <div className="flex flex-col gap-2">
              {FONT_OPTIONS.map((font) => {
                const isSelected = fontId === font.id
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => { void handleFontChange(font.id) }}
                    className={cn(
                      'flex min-h-[48px] w-full items-center rounded-xl border px-4 py-2 text-left',
                      'transition-colors duration-100',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border bg-card hover:bg-muted/40 active:bg-muted/60 cursor-pointer',
                    )}
                  >
                    <span
                      lang="ja"
                      className="text-sm font-semibold text-foreground"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Conta ─────────────────────────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.account.accountHeading}
          </h2>
          <button
            type="button"
            onClick={() => { void logout() }}
            className="flex min-h-[48px] w-full items-center rounded-xl border border-border bg-card px-4 py-2 text-left text-sm font-semibold text-foreground transition-colors duration-100 hover:bg-muted/40 active:bg-muted/60 cursor-pointer"
          >
            {t.home.signOut}
          </button>
        </div>
      </div>
    </PageTransition>
  )
}
