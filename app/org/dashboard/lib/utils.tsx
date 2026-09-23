import { Badge } from "@/components/ui/badge"
import { Banknote } from "lucide-react"

export function formatRupee(amount: number | string): string {
  return `Rs. ${amount.toString()}`
}

export function money(value: number) {
  return value.toFixed(2)
}
export function formatDateYearMonth(paidAt: Date) {
  const date = new Date(paidAt)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
  return formattedDate
}

export function formatStatus(status: string) {
  return (
    <>
      {status === "paid" && (
        <Badge className="bg-green-500 text-white">Paid</Badge>
      )}

      {status === "unpaid" && (
        <Badge className="bg-red-500 text-white">Unpaid</Badge>
      )}
      {status === "partial" && (
        <Badge className="bg-yellow-500 text-white">Partial</Badge>
      )}
      {status === "void" && (
        <Badge className="bg-gray-500 text-white">Void</Badge>
      )}
    </>
  )
}

export function formatYearMonth(
  periodYear: number,
  periodMonth: number
): string {
  const date = new Date(periodYear, periodMonth - 1, 1)

  const monthname = date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })
  return monthname
}

export function formatPaymentMethod(method: string) {
  return (
    <>
      {method === "cash" && (
        <Badge className="bg-green-500 text-white">Cash</Badge>
      )}
      {method === "esewa" && (
        <Badge
          variant="outline"
          className="inline-flex items-center bg-white px-2 py-3"
        >
          <img
            src="/icons/esewa.png"
            alt="eSewa"
            className="h-4 w-auto object-contain"
          />
          eSewa
        </Badge>
      )}
      {method === "khalti" && (
        <Badge
          variant="outline"
          className="inline-flex items-center bg-white px-2 py-3"
        >
          <img
            src="/icons/khalti.jpeg"
            alt="eSewa"
            className="h-4 w-auto object-cover"
          />
          <span className="text-xs font-bold text-red-600 dark:text-red-400">
            Khalti
          </span>
        </Badge>
      )}
      {method === "bank_transfer" && (
        <Badge className="bg-yellow-500 text-white">
          {" "}
          Bank <Banknote className="h-4 w-4" />{" "}
        </Badge>
      )}
      {method === "cheque" && (
        <Badge className="bg-gray-500 text-white">Cheque</Badge>
      )}
      {method === "other" && (
        <Badge className="bg-gray-500 text-white">Other</Badge>
      )}
    </>
  )
}
//for pagination
export function parsePage(value: string | undefined) {
  const page = Math.trunc(Number(value))
  if (!Number.isFinite(page) || page < 1) return 1
  return page
}

export function parsePerPage(value: string | undefined) {
  const perPage = Math.trunc(Number(value))
  if (!Number.isFinite(perPage) || perPage < 1) return 5
  return Math.min(perPage, 20)
}
