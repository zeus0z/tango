import { Toaster as Sonner, type ToasterProps } from 'sonner'

// Toaster: uses sonner (React 19-compatible).
// Toasts auto-dismiss after 3 s; styled with design-system tokens.
// Usage: render <Toaster /> once in your root layout.
// To show a toast: import { toast } from 'sonner' and call toast('message').

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      duration={3000}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'bg-card-bg text-card-bg-foreground border border-border shadow-md rounded-xl text-sm',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'bg-danger text-danger-foreground border-danger/30',
          success: 'bg-success text-success-foreground border-success/30',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
