"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteVisitorAction } from "../action/visitors"

export default function DeleteVisitorDialog({ visitorId }: { visitorId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    if (isLoading) return
    try {
      setIsLoading(true)
      const response = await deleteVisitorAction({ id: visitorId })
      if (response.success) {
        toast.success(response.message || "Visitor record deleted successfully")
        setOpen(false)
      } else {
        toast.error(response.message || "Failed to delete visitor record")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-sm" variant="destructive">
          <Trash2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This visitor record will be deleted permanently.
          </DialogDescription>
          <div className="flex flex-row gap-2 items-center justify-end">
            <Button variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="w-30"
              disabled={isLoading}
              onClick={handleDelete}
              variant="destructive"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
