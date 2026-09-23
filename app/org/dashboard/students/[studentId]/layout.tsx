import React from "react"

export default function StudentLayout({
  overview,
  billing,
  payments,
}: {
  overview: React.ReactNode
  billing: React.ReactNode
  payments: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>{overview}</div>
      <div>{billing}</div>
    </div>
  )
}
