"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/pagination-controls";
import { GetAllVisitorsResponse } from "@/types/visitor-type";
import VisitorCheckinForm from "./visitor-checkin-form";
import VisitorCheckoutButton from "./visitor-checkout-button";
import DeleteVisitorDialog from "./visitor-delete-dialog";
import VisitorFilter from "./visitor-filter";
import { PermissionGate } from "@/lib/permissions/permission-gate";

function formatDateTime(value: Date | string | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function VisitorManagement({
  visitorsData,
}: {
  visitorsData: GetAllVisitorsResponse;
}) {
  const { visitors, totalPages, total, insideCount } = visitorsData;
  const checkedOutCount = total - insideCount;

  return (
    <div className="w-full flex-col space-y-4">
      {/* header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitors</h1>
          <p className="text-sm text-gray-500">
            Track visitor check-ins and check-outs in your hostel
          </p>
        </div>
        <div>
          <PermissionGate resource="visitor" action="create">
            <VisitorCheckinForm />
          </PermissionGate>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Currently inside
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{insideCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{checkedOutCount}</p>
          </CardContent>
        </Card>
      </div>

      <VisitorFilter />

      <div className="w-full space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Check-in</TableHead>
              <PermissionGate resource="visitor" action="checkout">
                <TableHead>Status</TableHead>
              </PermissionGate>
              <PermissionGate resource="visitor" action="delete">
                <TableHead>Actions</TableHead>
              </PermissionGate>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visitors.length > 0 ? (
              visitors.map((visitor) => {
                const isInside = !visitor.checkoutAt;
                return (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <div className="font-medium">{visitor.visitorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {visitor.age != null ? `Age ${visitor.age}` : "Age —"}
                        {visitor.expectedVisitDuration
                          ? ` · ~${visitor.expectedVisitDuration}`
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {visitor.relation}
                    </TableCell>
                    <TableCell>{visitor.studentName}</TableCell>
                    <TableCell
                      className="max-w-55 truncate"
                      title={visitor.reason}
                    >
                      {visitor.reason}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(visitor.checkinAt)}
                    </TableCell>

                    <TableCell>
                      {isInside ? (
                        <Badge className="bg-green-500 text-white">
                          Inside
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          title={`Checked out ${formatDateTime(visitor.checkoutAt)}`}
                        >
                          Checked out
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isInside && (
                          <VisitorCheckoutButton visitorId={visitor.id} />
                        )}
                        <PermissionGate resource="visitor" action="delete">
                          <DeleteVisitorDialog visitorId={visitor.id} />
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No visitors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow></TableRow>
          </TableFooter>
        </Table>
        <PaginationControls totalPages={totalPages} />
      </div>
    </div>
  );
}
