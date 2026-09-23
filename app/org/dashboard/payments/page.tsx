import React from "react"
import Payment from "./_components/payment"

export default function page({
  searchParams,
}: {
  searchParams: Promise<{
    page: string
    perPage: string
    studentId: string
  }>
}) {
  return <Payment searchParams={searchParams} />
}
