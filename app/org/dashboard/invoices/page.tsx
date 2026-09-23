import React from "react"
import Invoices from "./_components/invoices"

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{
    studentId: string
    page: string
    perPage: string
  }>
}) {
  return <Invoices searchParams={searchParams} />
}
