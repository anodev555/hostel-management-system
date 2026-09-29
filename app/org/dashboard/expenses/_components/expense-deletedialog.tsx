"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { deleteExpenseAction } from "../action/expenses";
import { error } from "console";
import { toast } from "sonner";

export default function DeleteExpenseDialog({
  expenseId,
}: {
  expenseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function deleteExpenses(expenseId: string) {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await deleteExpenseAction({ id: expenseId });
      if (response.success) {
        toast.success(`${response.message}`);
        setOpen(false);
      } else {
        toast.error(`${response.message}`);
        setOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
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
            Expense and its items will be delete permanently
          </DialogDescription>
          <div className="flex flex-row gap-2 items-center justify-end">
            <Button
              disabled={isLoading}

              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="w-30"
              disabled={isLoading}
              onClick={() => deleteExpenses(expenseId)}
              variant="destructive"
            >
              {isLoading ? <Loader2 /> : "Delete"}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
