import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  /** Render a bottom navigation bar above the iOS home indicator. */
  bottomNav?: ReactNode
  className?: string
}

/**
 * App shell layout:
 * - Full viewport height on mobile, centred column on desktop
 * - Max content width 390px (mimics phone screen on desktop)
 * - Respects iOS/Android safe-area insets via CSS env() variables
 * - Optional bottom nav slot above the iOS home indicator
 */
function Layout({ children, bottomNav, className }: LayoutProps) {
  return (
    <div className="flex min-h-svh justify-center bg-background">
      {/* ── Centred phone-width column ── */}
      <div
        className={cn(
          'relative flex w-full max-w-[390px] flex-col',
          // Safe-area top/sides (body already handles left/right, but keep
          // the padding here for the column in case body padding is removed)
          'pt-safe-top pl-safe-left pr-safe-right',
          className,
        )}
      >
        {/* ── Page content ── */}
        <main className={cn('flex flex-1 flex-col', bottomNav ? 'pb-16' : 'pb-safe-bottom')}>
          {children}
        </main>

        {/* ── Optional bottom nav — sits above iOS home indicator ── */}
        {bottomNav && (
          <nav
            className={cn(
              'fixed bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2',
              'border-t border-border bg-background',
              'pb-safe-bottom',
            )}
          >
            {bottomNav}
          </nav>
        )}
      </div>
    </div>
  )
}

export default Layout
