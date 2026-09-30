"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { checkoutVisitorAction } from "../action/visitors";
import { PermissionGate } from "@/lib/permissions/permission-gate";

export default function VisitorCheckoutButton({
  visitorId,
}: {
  visitorId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await checkoutVisitorAction({ id: visitorId });
      if (response.success) {
        toast.success(response.message || "Visitor checked out successfully");
      } else {
        toast.error(response.message || "Failed to check out visitor");
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
    <PermissionGate resource="visitor" action="checkout">
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        disabled={isLoading}
        onClick={handleCheckout}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Check Out
      </Button>
    </PermissionGate>
  );
}
