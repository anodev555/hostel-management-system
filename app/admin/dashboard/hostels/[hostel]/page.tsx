import { Suspense } from "react";
import HostelDetail from "./_components/hosteldetail";
import HostelDetailSkeleton from "./_components/hosteldetail-skeleton";

export default function Page({
  params,
}: {
  params: Promise<{ hostel: string }>;
}) {
  return (
    <Suspense fallback={<HostelDetailSkeleton />}>
      <HostelDetail params={params} />
    </Suspense>
  );
}