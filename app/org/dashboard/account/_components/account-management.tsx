"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrgSubscriptionInfo } from "../action/org-subscription";

type AccountManagementProps = {
  subscription: OrgSubscriptionInfo | null;
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

function statusBadgeVariant(status: string) {
  switch (status) {
    case "active":
      return "default" as const;
    case "past_due":
      return "outline" as const;
    case "cancelled":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export default function AccountManagement({
  subscription,
}: AccountManagementProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">
          Your organization&apos;s subscription and billing details.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>Current plan details</CardDescription>
          </div>
          {subscription && (
            <Badge variant={statusBadgeVariant(subscription.status)}>
              {subscription.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {subscription.planName}
                </span>
                <span className="text-lg text-muted-foreground">
                  Rs. {subscription.price}
                </span>
              </div>

              {subscription.description && (
                <p className="text-sm text-muted-foreground">
                  {subscription.description}
                </p>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Students limit:</span>{" "}
                  <span className="font-medium">
                    {subscription.maxStudents ?? "Unlimited"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Staff limit:</span>{" "}
                  <span className="font-medium">
                    {subscription.maxStaff ?? "Unlimited"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Started:</span>{" "}
                  <span className="font-medium">
                    {formatDate(subscription.startedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Next billing:</span>{" "}
                  <span className="font-medium">
                    {subscription.nextBillingDate}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active subscription plan. Contact your admin to assign a plan.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}