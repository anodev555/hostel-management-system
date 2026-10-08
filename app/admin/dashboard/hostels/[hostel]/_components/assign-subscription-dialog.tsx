"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HostelDetail } from "@/types/hostels-types";

import { assignSubscriptionAction } from "../action/assign-subscription";

type AssignSubscriptionDialogProps = {
  hostelId: string;
  availablePlans: HostelDetail["availablePlans"];
};

export default function AssignSubscriptionDialog({
  hostelId,
  availablePlans,
}: AssignSubscriptionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlan = availablePlans.find((p) => p.id === planId);

  async function handleAssign() {
    if (!planId || isLoading) return;
    setIsLoading(true);
    try {
      const response = await assignSubscriptionAction({
        hostelId,
        planId,
      });
      if (response.success) {
        toast.success(response.message ?? "Plan assigned");
        setOpen(false);
        setPlanId("");
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to assign plan");
      }
    } catch {
      toast.error("Failed to assign subscription");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Assign Plan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Assign subscription plan</DialogTitle>
        <DialogDescription>
          Choose a plan for this hostel. The current active plan (if any) will
          be cancelled.
        </DialogDescription>

        <div className="py-4">
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger aria-label="Select a plan">
              <SelectValue placeholder="Select a plan…" />
            </SelectTrigger>
            <SelectContent>
              {availablePlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                  {plan.price
                    ? ` — Rs. ${plan.price}`
                    : " — Custom pricing"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPlan && (
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{selectedPlan.description}</p>
              <p>
                Students:{" "}
                {selectedPlan.maxStudents ?? "Unlimited"}
              </p>
              <p>
                Staff: {selectedPlan.maxStaff ?? "Unlimited"}
              </p>
              <p>
                Price:{" "}
                {selectedPlan.price
                  ? `Rs. ${selectedPlan.price}/month`
                  : "Custom pricing"}
              </p>
            </div>
          )}
        </div>

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
            disabled={!planId || isLoading}
            onClick={handleAssign}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Assign Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}