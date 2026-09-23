"use client"

import { Loader2, TriangleAlert } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type FormSaveBarProps = {
  isDirty: boolean
  className?: string
  isLoading?: boolean
  onReset: () => void
  onConfirm: () => void | Promise<void | boolean>
  message?: string
  resetLabel?: string
  saveLabel?: string
  dialogTitle?: string
  dialogDescription?: string
  confirmLabel?: string
  cancelLabel?: string
}

export function FormSaveBar({
  isDirty,
  className,
  isLoading = false,
  onReset,
  onConfirm,
  message = "unsaved changes",
  resetLabel = "Reset",
  saveLabel = "Save changes",
  dialogTitle = "Save changes?",
  dialogDescription,
  confirmLabel = "Confirm save",
  cancelLabel = "Cancel",
}: FormSaveBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleConfirm() {
    const result = await onConfirm()
    if (result !== false) {
      setConfirmOpen(false)
    }
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "fixed inset-x-0 bottom-1 z-40 mx-auto flex max-w-md justify-center px-4 pb-4 transition-all duration-200",
          isDirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        )}
      >
        <div className="mx-auto flex w-fit items-center justify-between gap-4 rounded-xl border border-(--table-border) bg-muted/50 px-2 py-2">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <TriangleAlert size="18" color="red" />
            <span className="hidden font-medium text-red-500 sm:inline">
              {message}
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isLoading}
              onClick={onReset}
            >
              {resetLabel}
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={isLoading}
              onClick={() => setConfirmOpen(true)}
            >
              {saveLabel}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {dialogDescription && (
              <DialogDescription>{dialogDescription}</DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => setConfirmOpen(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isLoading}
              onClick={handleConfirm}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
