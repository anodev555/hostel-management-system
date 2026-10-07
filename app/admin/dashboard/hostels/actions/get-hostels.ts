"use server";

import db from "@/db";
import { member, organization, student, user } from "@/db/schema";
import { withAuth } from "@/lib/withAuth";
import { ActionResponse } from "@/types/action-response";
import {
  HostelStatusFilter,
  ListHostelsInput,
  HostelListPayload,
  HostelListItem,
} from "@/types/hostels-types";
import { and, count, desc, eq, ilike, inArray, ne, or, SQL } from "drizzle-orm";

function buildSearchCondition(search: string): SQL | undefined {
  const term = search.trim();
  if (!term) return undefined;
  const pattern = `%${term}%`;
  return or(
    ilike(organization.name, pattern),
    ilike(organization.slug, pattern),
    ilike(organization.location, pattern),
  );
}

function buildStatusCondition(status: HostelStatusFilter): SQL | undefined {
  if (status === "active") return eq(organization.isActive, true);
  if (status === "inactive") return eq(organization.isActive, false);
  return undefined;
}

function combineConditions(conditions: (SQL | undefined)[]) {
  const active = conditions.filter((c): c is SQL => Boolean(c));
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  return and(...active);
}

export const GetHostelsAction = withAuth<
  ListHostelsInput,
  ActionResponse<HostelListPayload>
>({
  roles: ["superAdmin"],
})(async ({ data }): Promise<ActionResponse<HostelListPayload>> => {
  try {
    const search = data?.search?.trim() ?? "";
    const status: HostelStatusFilter = data?.status ?? "all";
    const perPage = Math.min(Math.max(Number(data?.perPage) || 5, 1), 20);
    const requestedPage = Math.max(Number(data?.page) || 1, 1);

    const where = combineConditions([
      buildSearchCondition(search),
      buildStatusCondition(status),
    ]);

    // Total matching rows (for pagination)
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(organization)
      .where(where);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * perPage;

    // Global metrics for the top cards (not search-filtered)
    const [metricsRows, activeRows, inactiveRows, studentRows] =
      await Promise.all([
        db.select({ value: count() }).from(organization),
        db
          .select({ value: count() })
          .from(organization)
          .where(eq(organization.isActive, true)),
        db
          .select({ value: count() })
          .from(organization)
          .where(eq(organization.isActive, false)),
        db.select({ value: count() }).from(student),
      ]);

    const orgRows = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        location: organization.location,
        isActive: organization.isActive,
        createdAt: organization.createdAt,
      })
      .from(organization)
      .where(where)
      .orderBy(desc(organization.createdAt))
      .limit(perPage)
      .offset(offset);

    const orgIds = orgRows.map((row) => row.id);

    const studentCounts = orgIds.length
      ? await db
          .select({
            organizationId: student.organizationId,
            value: count(),
          })
          .from(student)
          .where(inArray(student.organizationId, orgIds))
          .groupBy(student.organizationId)
      : [];

    const staffCounts = orgIds.length
      ? await db
          .select({
            organizationId: member.organizationId,
            value: count(),
          })
          .from(member)
          .where(
            and(
              inArray(member.organizationId, orgIds),
              ne(member.role, "owner"),
            ),
          )
          .groupBy(member.organizationId)
      : [];

    const owners = orgIds.length
      ? await db
          .select({
            organizationId: member.organizationId,
            ownerId: user.id,
            ownerName: user.name,
            ownerUsername: user.username,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(
            and(
              inArray(member.organizationId, orgIds),
              eq(member.role, "owner"),
            ),
          )
      : [];

    const studentCountByOrg = new Map(
      studentCounts.map((row) => [row.organizationId, Number(row.value)]),
    );
    const staffCountByOrg = new Map(
      staffCounts.map((row) => [row.organizationId, Number(row.value)]),
    );
    const ownerByOrg = new Map(owners.map((row) => [row.organizationId, row]));

    const hostels: HostelListItem[] = orgRows.map((row) => {
      const owner = ownerByOrg.get(row.id);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        logo: row.logo,
        location: row.location,
        isActive: row.isActive,
        createdAt: row.createdAt,
        totalStudents: studentCountByOrg.get(row.id) ?? 0,
        staffCount: staffCountByOrg.get(row.id) ?? 0,
        ownerId: owner?.ownerId ?? null,
        ownerName: owner?.ownerName ?? null,
        ownerUsername: owner?.ownerUsername ?? null,
      };
    });

    return {
      success: true,
      data: {
        hostels,
        pagination: { page, perPage, total, totalPages },
        metrics: {
          total: Number(metricsRows[0]?.value ?? 0),
          active: Number(activeRows[0]?.value ?? 0),
          inactive: Number(inactiveRows[0]?.value ?? 0),
          totalStudents: Number(studentRows[0]?.value ?? 0),
        },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch hostels",
    };
  }
});
