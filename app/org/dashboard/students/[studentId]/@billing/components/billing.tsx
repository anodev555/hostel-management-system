import React from "react"
import { getStudentBills } from "../action/billing"
import ErrorPage from "@/utils/error-page"
import BillingManagement from "./billing-management"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Billing({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  try {
    const studentId = (await params).studentId

    if (!studentId) {
      return <ErrorPage message="Missing student ID" />
    }

    const response = await getStudentBills({ studentId })

    if (!response.success) {
      return <ErrorPage message={response.message} />
    }

    return <BillingManagement studentId={studentId} bills={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
