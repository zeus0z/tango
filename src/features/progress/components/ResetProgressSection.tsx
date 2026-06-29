import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useResetProgress } from '../hooks/useResetProgress'

interface ResetProgressSectionProps {
  userId: string | undefined
}

export function ResetProgressSection({ userId }: ResetProgressSectionProps) {
  const [open, setOpen] = useState(false)
  const reset = useResetProgress(userId)
  const disabled = !userId || reset.isPending

  async function handleConfirm() {
    try {
      await reset.mutateAsync()
      toast.success('All progress reset. Your account is fresh.')
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <section className="flex flex-col gap-3 mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Reset all progress</h2>
          <p className="text-sm text-muted-foreground">
            Delete every review and start over as if this account were brand new. This cannot be undone.
          </p>
        </div>
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="self-start"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Reset all progress
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (reset.isPending) return
          setOpen(next)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset all progress?</DialogTitle>
            <DialogDescription>
              This permanently deletes every review you've done and every FSRS card state for your
              account. Your hiragana map will go grey and every character will need to be learned again.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={reset.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={reset.isPending}
              onClick={handleConfirm}
            >
              {reset.isPending ? 'Resetting…' : 'Reset everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
