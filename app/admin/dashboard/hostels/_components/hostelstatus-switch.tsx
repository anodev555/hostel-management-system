"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import { updateHostelStatusAction } from "../actions/update-hostelstatus";

export default function HostelStatusSwitch({
  hostelId,
  isActive,
}: {
  hostelId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  async function handleCheckedChange(next: boolean) {
    if (isPending) return;

    const previous = checked;
    setChecked(next);
    startTransition(async () => {
      try {
        const response = await updateHostelStatusAction({
          hostelId,
          isActive: next,
        });

        if (response.success) {
          toast.success(response.message ?? "Hostel status updated");
          router.refresh();
          return;
        }

        setChecked(previous);
        toast.error(response.message ?? "Failed to update hostel status");
      } catch (error) {
        setChecked(previous);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update hostel status",
        );
      }
    });
  }

  return (
    <span
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Switch
        checked={checked}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
        aria-label={checked ? "Mark hostel inactive" : "Mark hostel active"}
        title={checked ? "Mark hostel inactive" : "Mark hostel active"}
      />
    </span>
  );
}
