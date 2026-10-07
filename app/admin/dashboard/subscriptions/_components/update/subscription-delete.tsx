"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import type { PlanListItem } from "@/types/subscription-types";

import { deleteSubscriptionPlanAction } from "../../actions/delete-subscription";

export default function SubscriptionDelete({ plan }: { plan: PlanListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAttached = plan.subscriberCount > 0;

  async function handleDelete() {
    if (isLoading || isAttached) return;
    setIsLoading(true);
    try {
      const response = await deleteSubscriptionPlanAction({
        planId: plan.id,
      });
      if (response.success) {
        toast.success(response.message ?? "Subscription plan deleted");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to delete subscription plan");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete subscription plan",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="destructive"
          onClick={() => setOpen(true)}
          aria-label={`Delete ${plan.name}`}
          title={`Delete ${plan.name}`}
        >
          <Trash2 className="size-4 text-destructive " />
        </Button>
      </DialogTrigger>

      <DialogContent className={cn("sm:max-w-md")}>
        <DialogTitle>Delete subscription plan?</DialogTitle>
        <DialogDescription>
          {isAttached ? (
            <>
              &ldquo;{plan.name}&rdquo; cannot be deleted because{" "}
              {plan.subscriberCount} hostel
              {plan.subscriberCount === 1 ? " is" : "s are"} subscribed to it.
              Move those hostels to another plan first.
            </>
          ) : (
            <>
              This will permanently delete the &ldquo;{plan.name}&rdquo; plan.
              This action cannot be undone.
            </>
          )}
        </DialogDescription>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-30"
            disabled={isLoading || isAttached}
            onClick={handleDelete}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              "Delete Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
