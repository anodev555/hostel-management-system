"use client";

import { SearchBar } from "@/components/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  TableHeader,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { usePermissions } from "@/lib/permissions/usePermissions";
import { StaffItem } from "@/types/staff-type";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateStaffStatusAction } from "../action/update-staffstatus";
import { toast } from "sonner";

export default function StaffList({ staffs }: { staffs: StaffItem[] }) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [isPending, startTransition] = useTransition();
  const handleStaffStatusChange = async (checked: boolean, staffId: string) => {
    if(isPending) return
    startTransition(async () => {
     const response = await updateStaffStatusAction({ status: checked, staffId });
     if(response.success){
      toast.success(response.message)
      
     }else{
      toast.error(response.message)
     }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
      <div className="flex flex-col gap-2">
        <SearchBar
          param="search"
          placeholder="name or username"
          className="max-w-md"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffs.length > 0 ? (
            staffs.map((staff) => (
              <TableRow
                key={staff.id}
                onClick={() => {
                  if (hasPermission("staff", "update")) {
                    router.push(`/org/dashboard/staff/${staff.id}`);
                  }
                }}
              >
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <Avatar>
                      <AvatarImage src={staff.staffImage ?? ""} />
                      <AvatarFallback>
                        {(staff.staffName?.charAt(0) ?? "") +
                          (staff.staffName?.charAt(1) ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium capitalize">
                      {staff.staffName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{staff.staffUsername}</span>
                </TableCell>
                <TableCell>
                  <span>{staff.staffRole}</span>
                </TableCell>
                <TableCell>
                  <span>{staff.staffPhone}</span>
                </TableCell>
                <TableCell>
                  <Switch
                  disabled={isPending}
                    checked={staff.isActive}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onCheckedChange={(checked) => {
                      handleStaffStatusChange(checked, staff.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No staff found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
