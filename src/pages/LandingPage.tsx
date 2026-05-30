/**
 * LandingPage — public route `/`
 *
 * The only page visible to logged-out visitors.
 * Mobile-first: hero stacks vertically on ≤390px, side-by-side on md:.
 */

import { Link } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { CardPreview } from '@/features/landing/CardPreview'

export default function LandingPage() {
  return (
    <PageTransition>
      {/*
       * Override Layout's max-w-[390px] constraint for the landing page so it
       * fills the full desktop viewport. We keep the outer centering via
       * justify-center on the Layout wrapper but allow wider content.
       */}
      <div className="flex min-h-svh flex-col bg-background">
        {/* ── Hero section ────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-6 py-12 md:py-20 max-w-4xl mx-auto w-full">

          {/* Left column: copy + CTA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 flex-1">

            {/* Wordmark / app name */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                Nihongo Flash
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                Learn Japanese<br />
                <span lang="ja" className="font-ja text-primary">
                  あいうえお
                </span>
              </h1>
            </div>

            {/* Short pitch */}
            <p className="text-base text-muted-foreground max-w-sm">
              Master hiragana and katakana through smart spaced repetition —
              built on the <strong className="text-foreground">Genki I/II</strong> curriculum.
              No fluff. Just kana.
            </p>

            {/* Feature bullets */}
            <ul className="text-sm text-muted-foreground space-y-1 self-start md:self-auto">
              {[
                'FSRS algorithm — smarter scheduling',
                'Genki-ordered hiragana & katakana',
                'Mobile-first progressive web app',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-primary" aria-hidden="true">✦</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs pb-[env(safe-area-inset-bottom)]">
              <Button asChild size="lg" className="w-full text-base">
                <Link to="/login?signup=1">Get started — it&apos;s free</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-sm text-muted-foreground">
                <Link to="/login">Already have an account? Log in</Link>
              </Button>
            </div>
          </div>

          {/* Right column: card preview */}
          <div className="flex-shrink-0 w-full max-w-[280px] md:max-w-[320px]">
            <div className="relative">
              {/* Decorative glow behind the card */}
              <div
                className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl -z-10 scale-110"
                aria-hidden="true"
              />
              <CardPreview />
            </div>

            {/* Caption */}
            <p className="mt-3 text-center text-xs text-muted-foreground/60">
              Tap a card to answer
            </p>
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-muted-foreground/50 py-6 px-4">
          &copy; {new Date().getFullYear()} Nihongo Flash. Built for learners.
        </footer>
      </div>
    </PageTransition>
  )
}
