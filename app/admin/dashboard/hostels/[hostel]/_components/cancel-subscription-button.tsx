"use client";

import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
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

import { cancelSubscriptionAction } from "../action/cancel-subscription";

type CancelSubscriptionButtonProps = {
  subscriptionId: string;
};

export default function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await cancelSubscriptionAction({ subscriptionId });
      if (response.success) {
        toast.success(response.message ?? "Subscription cancelled");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to cancel subscription");
      }
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive">
          <XCircle className="mr-2 size-4" />
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Cancel subscription?</DialogTitle>
        <DialogDescription>
          This will cancel the current plan. The hostel will lose access to
          plan-limited features. This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Keep Plan
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={handleCancel}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Cancel Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}