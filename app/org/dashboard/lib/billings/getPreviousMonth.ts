export type PreviousMonthType = {
  periodStart: string
  periodEnd: string
  year: number
  month: number
  daysInMonth: number
}
export default function getPreviousMonth(): PreviousMonthType {
  const currentDate = new Date("2026-09-01")
  const previousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  )
  const year = previousMonth.getFullYear()
  const month = previousMonth.getMonth() + 1 // 1-12 (january is 1 and december is 12)

  const daysInMonth = new Date(year, month, 0).getDate() //last day of the month to calculating total days in the month

  const periodStart = `${year}-${String(month).padStart(2, "0")}-01` //YYYY-MM-DD matching db date format
  const periodEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}` //YYYY-MM-DD matching db date format

  return {
    periodStart,
    periodEnd,
    year,
    month,
    daysInMonth,
  }
}
