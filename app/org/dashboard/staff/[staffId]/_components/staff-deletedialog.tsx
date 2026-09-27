"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteStaffAction } from "../action/delete-staff";

export default function DeleteStaffDialog({
  userId,
  memberId,
}: {
  userId: string;
  memberId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await deleteStaffAction({ staffId: memberId });
      if (response.success) {
        toast.success(response.message ?? "Staff deleted successfully");
        setIsOpen(false);
        router.push("/org/dashboard/staff");
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete staff");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete staff",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          <Trash className="size-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the staff
            member and remove their data from the organization.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
