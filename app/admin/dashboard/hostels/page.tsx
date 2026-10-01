import React, { Suspense } from "react";
import Hostels from "./_components/hostels";

export default function HostelPage() {
  return (
    <div>
      <Suspense>
        <Hostels />
      </Suspense>
    </div>
  );
}
