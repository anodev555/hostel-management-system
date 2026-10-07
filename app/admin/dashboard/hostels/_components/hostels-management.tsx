"use client";

import {
  Building,
  Building2,
  CircleCheck,
  CircleOff,
  Users,
} from "lucide-react";

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
import {
  HostelListItem,
  HostelListMetrics,
  HostelStatusFilter,
} from "@/types/hostels-types";
import { CreateHostelDialog } from "./create-hostel-dialog";
import { columns } from "./hostels-columns";

type HostelsManagementProps = {
  hostels: HostelListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  metrics: HostelListMetrics;
  activeStatus: HostelStatusFilter;
};

function StatusFilter({ value }: { value: HostelStatusFilter }) {
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

export function HostelsManagement({
  hostels,
  pagination,
  metrics,
  activeStatus,
}: HostelsManagementProps) {
  const totalHostels = Math.max(metrics.total, 0);
  const activeShare = totalHostels
    ? Math.round((metrics.active / totalHostels) * 100)
    : 0;

  const metricCards = [
    {
      label: "Total hostels",
      value: metrics.total,
      hint: "All registered organizations",
      icon: Building2,
      accent: "bg-primary",
      chip: "bg-primary/10 text-primary",
    },
    {
      label: "Active hostels",
      value: metrics.active,
      hint: `${activeShare}% of total`,
      icon: CircleCheck,
      accent: "bg-emerald-500",
      chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Inactive hostels",
      value: metrics.inactive,
      hint: totalHostels
        ? `${100 - activeShare}% of total`
        : "Suspended or draft",
      icon: CircleOff,
      accent: "bg-destructive",
      chip: "bg-destructive/10 text-destructive",
    },
    {
      label: "Enrolled students",
      value: metrics.totalStudents,
      hint: "Across every hostel",
      icon: Users,
      accent: "bg-sky-500",
      chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div className="mx-auto flex  flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building className="size-3.5" />
            Admin / Hostels
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Hostels Directory
          </h1>
        </div>
        <CreateHostelDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card
            key={metric.label}
            className="relative overflow-hidden py-5 transition-shadow hover:shadow-md"
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 ${metric.accent}`}
              aria-hidden="true"
            />
            <CardContent className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {metric.label}
                </p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {metric.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{metric.hint}</p>
              </div>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${metric.chip}`}
              >
                <metric.icon className="size-4" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col    lg:flex-row lg:items-center lg:justify-between">
          <DataTableSearch placeholder="Search by hostel name, slug, or city…" />
          <div className="flex items-center gap-2">
            <StatusFilter value={activeStatus} />
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Showing {hostels.length} of {pagination.total} hostels
            </span>
          </div>
        </CardHeader>
        <CardContent className="">
          <DataTable
            columns={columns}
            data={hostels}
            rowCount={pagination.total}
            page={pagination.page}
            perPage={pagination.perPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
