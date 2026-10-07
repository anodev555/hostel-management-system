"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";

import { features } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { PlanListItem } from "@/types/subscription-types";
import SubscriptionEditForm from "./update/subscription-editform";
import SubscriptionDelete from "./update/subscription-delete";
import PlanStatusSwitch from "./update/subscription-switch";

function formatPrice(value: string | null) {
  if (value === null) return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return `Rs. ${num.toLocaleString("en-NP")}`;
}

function formatCap(value: number | null) {
  if (value === null) return "Unlimited";
  return value.toLocaleString();
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const columns: ColumnDef<typeof features, PlanListItem>[] = [
  {
    accessorKey: "name",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-primary">{plan.name}</span>
          {plan.description ? (
            <span className="max-w-64 truncate text-xs text-muted-foreground">
              {plan.description}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatPrice(row.original.price)}</span>
    ),
  },
  {
    id: "caps",
    header: "Students / Staff",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span>{formatCap(plan.maxStudents)} students</span>
          <span className="text-xs text-muted-foreground">
            {formatCap(plan.maxStaff)} staff
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "subscriberCount",
    header: "Hostels",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 tabular-nums">
        <Users className="size-4 text-muted-foreground" />
        {row.original.subscriberCount}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <PlanStatusSwitch
          planId={row.original.id}
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <SubscriptionEditForm plan={row.original} />
        <SubscriptionDelete plan={row.original} />
      </div>
    ),
  },
];
