"use client";

import { CreditCard } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSearch } from "@/components/data-table/data-table-search";
import { useUrlParams } from "@/components/data-table/use-url-params";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanListItem, PlanStatusFilter } from "@/types/subscription-types";
import { columns } from "./subscription-columns";
import SubscriptionForm from "./subscriptions-form";

type SubscriptionManagementProps = {
  plans: PlanListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  activeStatus: PlanStatusFilter;
};

function StatusFilter({ value }: { value: PlanStatusFilter }) {
  const { push } = useUrlParams();

  function handleChange(next: string) {
    push({ status: next === "all" ? undefined : next, page: 1 });
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-36" aria-label="Filter by status">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function SubscriptionManagement({
  plans,
  pagination,
  activeStatus,
}: SubscriptionManagementProps) {
  return (
    <div className="mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="size-3.5" />
            Admin / Subscriptions
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Subscription Plans
          </h1>
        </div>{" "}
        <SubscriptionForm />
      </div>

      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <DataTableSearch placeholder="Search by plan name…" />
          <div className="flex items-center gap-2">
            <StatusFilter value={activeStatus} />

            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Showing {plans.length} of {pagination.total} plans
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={plans}
            rowCount={pagination.total}
            page={pagination.page}
            perPage={pagination.perPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
