"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { deleteHostelAction } from "../action/delete-hostel";

type DeleteHostelDialogProps = {
  hostelId: string;
  hostelName: string;
};

export default function DeleteHostelDialog({
  hostelId,
  hostelName,
}: DeleteHostelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isConfirmed = confirmation === "delete-hostel";

  async function handleDelete() {
    if (!isConfirmed || isLoading) return;
    setIsLoading(true);
    try {
      const response = await deleteHostelAction({
        hostelId,
        confirmation: "delete-hostel" as const,
      });
      if (response.success) {
        toast.success(response.message ?? "Hostel deleted");
        router.push("/admin/dashboard/hostels");
      } else {
        toast.error(response.message ?? "Failed to delete hostel");
      }
    } catch {
      toast.error("Failed to delete hostel");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Delete Hostel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Delete &ldquo;{hostelName}&rdquo;?</DialogTitle>
        <DialogDescription>
          This will permanently delete <strong>{hostelName}</strong> and all its
          data — students, staff, subscriptions, rooms, and records. This action
          cannot be undone.
        </DialogDescription>

        <div className="py-2">
          <p className="mb-2 text-sm text-muted-foreground">
            Type <strong>delete-hostel</strong> to confirm.
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="delete-hostel"
            aria-label="Type delete-hostel to confirm"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              setOpen(false);
              setConfirmation("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isConfirmed || isLoading}
            onClick={handleDelete}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Delete Hostel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}