"use client";

import {
  ArrowLeft,
  Building2,
  CircleCheck,
  CircleOff,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HostelDetail } from "@/types/hostels-types";

import OwnerTable from "./owner-table";
import OwnerResetPasswordDialog from "./reset-owner-password-dialog";
import SubscriptionCard from "./subscription-card";
import DeleteHostelDialog from "./delete-hostel-dialog";

type HostelDetailManagementProps = {
  data: HostelDetail;
};

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HostelDetailManagement({
  data,
}: HostelDetailManagementProps) {
  const hostel = data;

  return (
    <div className="w-full flex  flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/dashboard/hostels"
          className="flex items-center gap-1 hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Hostels
        </Link>
        <span>/</span>
        <span className="text-foreground">{hostel.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Building2 className="size-6 text-primary" />
            {hostel.name}
          </h1>
          <p className="text-sm text-muted-foreground">@{hostel.slug}</p>
        </div>
        <Badge variant={hostel.isActive ? "default" : "secondary"}>
          {hostel.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Top row: Hostel Info + Subscription */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hostel Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hostel Information</CardTitle>
            <CardDescription>Overview of the organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Location
              </p>
              <p className="font-medium">{hostel.location ?? "—"}</p>
            </div>

            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Users className="size-5 text-sky-500" />
                <div>
                  <p className="text-lg font-bold">{hostel.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Users className="size-5 text-amber-500" />
                <div>
                  <p className="text-lg font-bold">{hostel.staffCount}</p>
                  <p className="text-xs text-muted-foreground">Staff</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <SubscriptionCard
          hostelId={hostel.id}
          subscription={hostel.subscription}
          availablePlans={hostel.availablePlans}
        />
      </div>

      {/* Owner Details */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Details</CardTitle>
          <CardDescription>Information about the hostel owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hostel.owner ? (
            <>
              <OwnerTable owner={hostel.owner} />
              <div className="flex justify-end">
                <OwnerResetPasswordDialog
                  owner={hostel.owner}
                  hostelId={hostel.id}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No owner assigned to this hostel.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Action */}
      <div className="flex justify-end border-t pt-6">
        <DeleteHostelDialog hostelId={hostel.id} hostelName={hostel.name} />
      </div>
    </div>
  );
}
