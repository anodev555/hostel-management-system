"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HostelDetail } from "@/types/hostels-types";

type OwnerTableProps = {
  owner: NonNullable<HostelDetail["owner"]>;
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

export default function OwnerTable({ owner }: OwnerTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">{owner.name}</TableCell>
            <TableCell>{owner.email}</TableCell>
            <TableCell>{owner.phone ?? "—"}</TableCell>
            <TableCell>{owner.username ? `@${owner.username}` : "—"}</TableCell>
            <TableCell>
              <Badge variant={owner.isActive ? "default" : "secondary"}>
                {owner.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(owner.createdAt)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}