"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function push(updates: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { push, searchParams };
}
