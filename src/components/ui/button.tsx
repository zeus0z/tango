import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base: mobile-friendly tap target (min 44px), active: state for touch feedback
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] min-w-[44px] select-none',
  {
    variants: {
      variant: {
        // Primary CTA — uses --primary token
        default:
          'bg-primary text-primary-foreground active:opacity-80 hover:bg-primary/90',
        // Success — correct answer
        success:
          'bg-success text-success-foreground active:opacity-80 hover:bg-success/90',
        // Danger — wrong answer
        danger:
          'bg-danger text-danger-foreground active:opacity-80 hover:bg-danger/90',
        destructive:
          'bg-destructive text-destructive-foreground active:opacity-80 hover:bg-destructive/90',
        outline:
          'border border-input bg-background active:bg-accent active:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground active:opacity-80 hover:bg-secondary/80',
        ghost:
          'active:bg-accent active:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Rating buttons (Hard / Good / Easy) — used post-answer
        hard: 'bg-amber-100 text-amber-800 active:opacity-80 hover:bg-amber-200 border border-amber-200',
        good: 'bg-success text-success-foreground active:opacity-80 hover:bg-success/90 font-semibold',
        easy: 'bg-blue-100 text-blue-800 active:opacity-80 hover:bg-blue-200 border border-blue-200',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-14 rounded-lg px-8 text-base',
        // Rating button size (≥56px tall per spec)
        rating: 'h-14 w-full rounded-lg text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Cast to 'button' so TypeScript resolves props against React.ButtonHTMLAttributes
    // and avoids the CSSProperties type mismatch between @radix-ui/react-slot and
    // @types/react@19 (duplicate installs disagree on the --radix-* index signature).
    // At runtime Slot clones the child and forwards all props — the cast is safe.
    const Comp = (asChild ? Slot : 'button') as 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
