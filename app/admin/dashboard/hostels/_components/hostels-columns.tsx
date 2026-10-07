"use client";

import { Eye, MapPinHouse, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { features } from "@/components/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HostelListItem } from "@/types/hostels-types";
import HostelStatusSwitch from "./hostelstatus-switch";
import Link from "next/link";

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const columns: ColumnDef<typeof features, HostelListItem>[] = [
  {
    accessorKey: "name",
    header: "Hostel",
    cell: ({ row }) => {
      const hostel = row.original;
      return (
        <Link
          href={`/admin/dashboard/hostels/${row.original.id}`}
          className="font-medium"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              {hostel.logo ? (
                <AvatarImage src={`/${hostel.logo}`} alt={hostel.name} />
              ) : null}
              <AvatarFallback>{hostel.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-primary">{hostel.name}</span>
              <span className="text-xs text-muted-foreground">
                {hostel.slug}
              </span>
            </div>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "ownerName",
    header: "Owner / Lead",
    cell: ({ row }) => {
      const hostel = row.original;
      if (!hostel.ownerName) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-col">
          {hostel.ownerName}

          {hostel.ownerUsername ? (
            <span className="text-xs text-muted-foreground">
              @{hostel.ownerUsername}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) =>
      row.original.location ? (
        <span className="flex items-center gap-1">
          <MapPinHouse className="size-4" />
          {row.original.location}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "capacity",
    header: "Students / Staff",
    cell: ({ row }) => {
      const hostel = row.original;
      return (
        <div>
          <span className="flex items-center gap-1">
            <Users className="size-4" />
            {hostel.totalStudents} students
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-4" />
            {hostel.staffCount} staff
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <HostelStatusSwitch
          hostelId={row.original.id}
          isActive={row.original.isActive}
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
