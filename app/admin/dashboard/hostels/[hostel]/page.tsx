import React from "react";
import HostelDetail from "./_components/hosteldetail";

export default function Page({
  params,
}: {
  params: Promise<{ hostel: string }>;
}) {
  return (
    <div>
      <HostelDetail />
    </div>
  );
}
