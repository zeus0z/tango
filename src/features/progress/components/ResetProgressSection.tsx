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
import { t } from '@/lib/constants/strings'

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
      toast.success(t.resetProgress.successToast)
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.resetProgress.errorToast
      toast.error(message)
    }
  }

  return (
    <section className="flex flex-col gap-3 mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">{t.resetProgress.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {t.resetProgress.sectionDescription}
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
        {t.resetProgress.buttonLabel}
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
            <DialogTitle>{t.resetProgress.dialogTitle}</DialogTitle>
            <DialogDescription>
              {t.resetProgress.dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={reset.isPending}
              onClick={() => setOpen(false)}
            >
              {t.resetProgress.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={reset.isPending}
              onClick={handleConfirm}
            >
              {reset.isPending ? t.resetProgress.resetting : t.resetProgress.resetEverything}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
