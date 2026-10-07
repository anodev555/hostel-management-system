import { HostelStatusFilter } from "@/types/hostels-types";

import { HostelsManagement } from "./hostels-management";
import { GetHostelsAction } from "../actions/get-hostels";
type HostelsProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    status?: string;
  }>;
};

const VALID_STATUSES: HostelStatusFilter[] = ["all", "active", "inactive"];

export default async function Hostels({ searchParams }: HostelsProps) {
  const params = (await searchParams) ?? {};
  const search = params.search ?? "";
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 5;
  const status: HostelStatusFilter = VALID_STATUSES.includes(
    params.status as HostelStatusFilter,
  )
    ? (params.status as HostelStatusFilter)
    : "all";

  const result = await GetHostelsAction({ search, page, perPage, status });

  if (!result.success) {
    return (
      <div className="mx-auto w-full max-w-7xl py-10">
        <p className="text-sm text-destructive">
          {result.message || "Failed to load hostels."}
        </p>
      </div>
    );
  }

  return (
    <HostelsManagement
      hostels={result.data.hostels}
      pagination={result.data.pagination}
      metrics={result.data.metrics}
      activeStatus={status}
    />
  );
}
