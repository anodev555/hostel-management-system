"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { updateRoomStatusAction } from "../action/rooms";

export default function RoomStatusSwitch({
  roomId,
  status,
}: {
  roomId: string;
  status: string;
}) {
  const [isActive, setIsActive] = useState(status === "active");
  const [isPending, setIsPending] = useState(false);

  async function handleCheckedChange(checked: boolean) {
    if (isPending) return;
    const nextStatus = checked ? "active" : "inactive";
    const previous = isActive;
    setIsActive(checked);
    setIsPending(true);
    try {
      const response = await updateRoomStatusAction({
        roomId,
        status: nextStatus,
      });
      if (response.success) {
        toast.success(response.message ?? `Room marked as ${nextStatus}`);
      } else {
        setIsActive(previous);
        toast.error(response.message ?? "Failed to update room status");
      }
    } catch (error) {
      setIsActive(previous);
      toast.error(
        error instanceof Error ? error.message : "Failed to update room status",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <span
      className="inline-flex"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Switch
        size="sm"
        checked={isActive}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
        aria-label={isActive ? "Mark room inactive" : "Mark room active"}
        title={isActive ? "Mark room inactive" : "Mark room active"}
      />
    </span>
  );
}
