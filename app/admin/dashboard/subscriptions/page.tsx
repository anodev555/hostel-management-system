import { Suspense } from "react";

import Subscription from "./_components/subscription";

type SubscriptionPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    status?: string;
  }>;
};

export default function Page({ searchParams }: SubscriptionPageProps) {
  return (
    <div className="py-2">
      <Suspense fallback={<p className="text-sm">Loading plans…</p>}>
        <Subscription searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
