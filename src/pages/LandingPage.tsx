/**
 * LandingPage — public route `/`
 *
 * The only page visible to logged-out visitors.
 * Single centered column on all breakpoints — sized to fit one viewport, no scroll.
 */

import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <PageTransition>
      {/*
       * Override Layout's max-w-[390px] constraint for the landing page so it
       * can use a slightly wider centered column on desktop.
       */}
      <div className="flex min-h-svh flex-col bg-background">
        {/* ── Hero section ────────────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col items-center justify-center text-center gap-6 px-6 py-8 max-w-md mx-auto w-full">

          {/* Wordmark / app name */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <span lang="ja" className="text-4xl md:text-5xl font-bold font-ja text-primary leading-none">
                単語
              </span>
              <span className="text-sm font-semibold tracking-[0.25em] uppercase text-foreground">
                TANGO
              </span>
            </div>
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
          <ul className="text-sm text-muted-foreground space-y-1">
            {[
              'FSRS algorithm — smarter scheduling',
              'Genki-ordered hiragana & katakana',
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
        </main>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="flex flex-col items-center gap-3 text-center text-xs text-muted-foreground/50 py-6 px-4">
          <div className="flex flex-col items-center gap-1.5 px-6">
            <Heart
              className="h-3.5 w-3.5 fill-rose-400 text-rose-400 dark:fill-rose-300 dark:text-rose-300"
              aria-hidden="true"
            />
            <p className="max-w-xs text-[11px] italic leading-relaxed text-rose-400/90 dark:text-rose-300/80">
              Dedicado à minha noiva, Aléxia, que me inspira a explorar novos
              horizontes e me lembra que a maior aventura da minha vida é
              construí-la ao seu lado.
            </p>
          </div>
          <p>&copy; {new Date().getFullYear()} Tango. Built for learners.</p>
        </footer>
      </div>
    </PageTransition>
  )
}
