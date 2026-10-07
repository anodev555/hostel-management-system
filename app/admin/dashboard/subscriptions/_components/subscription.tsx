import { PlanStatusFilter } from "@/types/subscription-types";

import { GetSubscriptionsAction } from "../actions/get-subscriptions";
import SubscriptionManagement from "./subscription-management";

type SubscriptionProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    status?: string;
  }>;
};

const VALID_STATUSES: PlanStatusFilter[] = ["all", "active", "inactive"];

export default async function Subscription({
  searchParams,
}: SubscriptionProps) {
  const params = (await searchParams) ?? {};
  const search = params.search ?? "";
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 5;
  const status: PlanStatusFilter = VALID_STATUSES.includes(
    params.status as PlanStatusFilter,
  )
    ? (params.status as PlanStatusFilter)
    : "all";

  const result = await GetSubscriptionsAction({ search, page, perPage, status });

  if (!result.success) {
    return (
      <div className="mx-auto w-full max-w-7xl py-10">
        <p className="text-sm text-destructive">
          {result.message || "Failed to load subscription plans."}
        </p>
      </div>
    );
  }

  return (
    <SubscriptionManagement
      plans={result.data.plans}
      pagination={result.data.pagination}
      activeStatus={status}
    />
  );
}
