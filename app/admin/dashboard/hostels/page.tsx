import React, { Suspense } from "react";
import Hostels from "./_components/hostels";

type HostelPageProps = {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    status?: string;
  }>;
};

export default function HostelPage({ searchParams }: HostelPageProps) {
  return (
    <div className="py-2">
      <Suspense fallback={<p className="text-sm">Loading hostels…</p>}>
        <Hostels searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
