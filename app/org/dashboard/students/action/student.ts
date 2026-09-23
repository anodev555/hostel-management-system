"use server"

import db from "@/db"
import {
  room,
  student,
  studentRoomAssignment,
  studentTuitionAssignment,
  tuitionPlan,
} from "@/db/schema"
import { withAuth } from "@/lib/withAuth"
import { ActionResponse } from "@/types/action-response"
import { eq, and, isNull, desc, or, ilike, count } from "drizzle-orm"
import { StudentListItem } from "@/types/student-type"
import z from "zod"
interface GetStudentsActionParams {
  page?: string
  perPage?: string
  search?: string
  status?: string
}

type GetStudentsResponse = {
  students: StudentListItem[]
  total: number
  totalPages: number
}
export const getStudentsAction = withAuth<
  GetStudentsActionParams,
  ActionResponse<GetStudentsResponse>
>({
  roles: ["orgUser"],
  permissions: {
    student: ["read"],
  },
  requireActiveOrg: true,
})(async ({
  data,
  organizationId,
}): Promise<ActionResponse<GetStudentsResponse>> => {
  if (!organizationId) {
    return {
      success: false,
      message: "Organization not found!",
    }
  }

  try {
    const parsedPerPage = Number(data?.perPage)
    const per_page =
      Number.isFinite(parsedPerPage) && parsedPerPage > 0
        ? Math.min(Math.trunc(parsedPerPage), 20)
        : 5
    const parsedPage = Number(data?.page)
    const currentPage =
      Number.isFinite(parsedPage) && parsedPage >= 1
        ? Math.trunc(parsedPage)
        : 1
    const offset = (currentPage - 1) * per_page
    const search = data?.search?.trim()
    const studentStatusSchema = z.enum([
      "active",
      "inactive",
      "suspended",
      "checkedOut",
    ])
    const parsedStatus = studentStatusSchema.safeParse(data?.status)
    const status = parsedStatus.success ? parsedStatus.data : undefined
    const whereClause = and(
      eq(student.organizationId, organizationId),
      search
        ? or(
            ilike(student.fullName, `%${search}%`),
            ilike(student.addmissionNumber, `%${search}%`)
          )
        : undefined,
      status ? eq(student.status, status) : undefined
    )

    const [students, [{ total }], [{ totalSearch }]] = await Promise.all([
      db
        .select({
          id: student.id,
          name: student.fullName,
          profileImageUrl: student.profileImage,
          college: student.collegeOrSchool,
          course: student.course,
          addmissionDate: student.addmissionDate,
          gender: student.gender,
          status: student.status,
          phoneNumber: student.studentPhone,
          roomNumber: room.roomNumber,
          tuitionPlan: tuitionPlan.name,
        })
        .from(student)
        .leftJoin(
          studentRoomAssignment,
          and(
            eq(student.id, studentRoomAssignment.studentId),
            eq(studentRoomAssignment.status, "assigned"),
            isNull(studentRoomAssignment.endDate)
          )
        )
        .leftJoin(room, eq(studentRoomAssignment.roomId, room.id))
        .leftJoin(
          studentTuitionAssignment,
          and(
            eq(student.id, studentTuitionAssignment.studentId),
            eq(studentTuitionAssignment.status, "assigned"),
            isNull(studentTuitionAssignment.endDate)
          )
        )
        .leftJoin(
          tuitionPlan,
          eq(studentTuitionAssignment.tuitionPlanId, tuitionPlan.id)
        )
        .limit(per_page)
        .offset(offset)
        .orderBy(desc(student.createdAt))
        .where(whereClause),

      db
        .select({ total: count() })
        .from(student)
        .where(eq(student.organizationId, organizationId)),
      db.select({ totalSearch: count() }).from(student).where(whereClause),
    ])

    const totalPages = Math.ceil(totalSearch / per_page)

    return {
      success: true,
      message: "Students fetched successfully",
      data: {
        students,
        total,
        totalPages,
      },
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: `${error instanceof Error ? error.message : "Something went wrong!"}`,
    }
  }
})
