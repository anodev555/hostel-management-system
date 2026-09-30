"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon, LogOut } from "lucide-react";
import { format } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { markStaffLeftAction } from "../action/mark-staff-left";

export default function MarkStaffLeftDialog({ memberId }: { memberId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastWorkingDay, setLastWorkingDay] = useState<Date>(new Date());
  const router = useRouter();

  async function handleMarkLeft() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await markStaffLeftAction({
        staffId: memberId,
        lastWorkingDay: format(lastWorkingDay, "yyyy-MM-dd"),
      });
      if (response.success) {
        toast.success(response.message ?? "Staff marked as left");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(response.message ?? "Failed to mark staff as left");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to mark staff as left",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) setLastWorkingDay(new Date());
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={isSubmitting}>
          <LogOut className="size-4 mr-2" />
          Mark as Left
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark staff as left?</DialogTitle>
          <DialogDescription>
            This ends all salary contracts as of the last working day and
            deactivates login. The staff record and history are kept.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Last working day</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-60 justify-start text-left font-normal",
                  !lastWorkingDay && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {lastWorkingDay
                  ? format(lastWorkingDay, "MMM dd, yyyy")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={lastWorkingDay}
                onSelect={(date) => date && setLastWorkingDay(date)}
                disabled={(date) => date > new Date()}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </Field>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={handleMarkLeft}
          >
            {isSubmitting ? "Saving..." : "Confirm Left"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
