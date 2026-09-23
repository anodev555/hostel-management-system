import React from "react"
import InvoiceList from "./invoice-list"
import { getInvoicesPerStudent } from "../action/invoice"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"

export default async function Invoices({
  searchParams,
}: {
  searchParams: Promise<{
    studentId: string
    page: string
    perPage: string
  }>
}) {
  try {
    const { studentId, page, perPage } = await searchParams
    const response = await getInvoicesPerStudent({
      studentId,
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 12,
    })
    if (!response.success) {
      return <ErrorPage message={response.message} />
    }
    const { student, invoices, summary } = response.data
    return (
      <InvoiceList student={student} invoices={invoices} summary={summary} />
    )
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
