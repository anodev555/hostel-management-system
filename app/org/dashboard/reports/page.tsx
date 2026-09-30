import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import ReportsLoader from "./_components/reports-loader";

function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-12 w-full max-w-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    fromYear?: string;
    fromMonth?: string;
    toYear?: string;
    toMonth?: string;
  }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
