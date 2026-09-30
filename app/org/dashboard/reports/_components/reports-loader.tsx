import { getReportsDataAction } from "../action/reports"
import { defaultRange } from "../schema/report-schema"
import ErrorPage from "@/utils/error-page"
import { ErrorResolver } from "@/utils/error-resolver"
import Reports from "./reports"

export default async function ReportsLoader({
  searchParams,
}: {
  searchParams: Promise<{
    fromYear?: string
    fromMonth?: string
    toYear?: string
    toMonth?: string
  }>
}) {
  const params = await searchParams
  const fallback = defaultRange()

  // Missing or unparseable params fall back to the last 6 months so the page
  // is always renderable on a cold load. The action re-validates the range.
  const toInt = (value: string | undefined, fallbackValue: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && Number.isInteger(parsed)
      ? parsed
      : fallbackValue
  }

  const range = {
    fromYear: toInt(params.fromYear, fallback.from.year),
    fromMonth: toInt(params.fromMonth, fallback.from.month),
    toYear: toInt(params.toYear, fallback.to.year),
    toMonth: toInt(params.toMonth, fallback.to.month),
  }

  try {
    const response = await getReportsDataAction(range)

    if (!response.success) {
      return <ErrorPage message={response.message || "Failed to load reports"} />
    }

    return <Reports data={response.data} />
  } catch (error) {
    return <ErrorResolver error={error} />
  }
}
