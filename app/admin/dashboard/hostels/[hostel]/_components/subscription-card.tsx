"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HostelDetail } from "@/types/hostels-types";

import AssignSubscriptionDialog from "./assign-subscription-dialog";
import CancelSubscriptionButton from "./cancel-subscription-button";

type SubscriptionCardProps = {
  hostelId: string;
  subscription: HostelDetail["subscription"];
  availablePlans: HostelDetail["availablePlans"];
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

export default function SubscriptionCard({
  hostelId,
  subscription,
  availablePlans,
}: SubscriptionCardProps) {
  if (subscription) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Current plan</CardDescription>
          </div>
          <Badge variant={statusBadgeVariant(subscription.status)}>
            {subscription.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {subscription.planName}
            </span>
            <span className="text-sm text-muted-foreground">
              Rs. {subscription.priceAtSignup}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Students limit:</span>{" "}
              {subscription.maxStudentsSnapshot ?? "Unlimited"}
            </div>
            <div>
              <span className="text-muted-foreground">Staff limit:</span>{" "}
              {subscription.maxStaffSnapshot ?? "Unlimited"}
            </div>
            <div>
              <span className="text-muted-foreground">Started:</span>{" "}
              {formatDate(subscription.startedAt)}
            </div>
            <div>
              <span className="text-muted-foreground">Next billing:</span>{" "}
              {subscription.nextBillingDate}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <AssignSubscriptionDialog
              hostelId={hostelId}
              availablePlans={availablePlans}
            />
            {subscription.status === "active" && (
              <CancelSubscriptionButton
                subscriptionId={subscription.id}
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>No plan assigned</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          This hostel does not have an active subscription plan.
        </p>
        <AssignSubscriptionDialog
          hostelId={hostelId}
          availablePlans={availablePlans}
        />
      </CardContent>
    </Card>
  );
}