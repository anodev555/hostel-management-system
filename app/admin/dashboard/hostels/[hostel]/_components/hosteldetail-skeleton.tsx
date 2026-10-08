import { Skeleton } from "@/components/ui/skeleton";

export default function HostelDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-12 w-32" />
    </div>
  );
}