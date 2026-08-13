import { endOfDay } from 'date-fns/endOfDay'
import { endOfMonth } from 'date-fns/endOfMonth'
import { getDate } from 'date-fns/getDate'
import { getDaysInMonth } from 'date-fns/getDaysInMonth'
import { getMonth } from 'date-fns/getMonth'
import { getYear } from 'date-fns/getYear'
import { isAfter } from 'date-fns/isAfter'
import { isValid } from 'date-fns/isValid'
import { startOfDay } from 'date-fns/startOfDay'
import { startOfMonth } from 'date-fns/startOfMonth'
import { subDays } from 'date-fns/subDays'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export const isValidTimestamp = (timestamp: number | string | Date): boolean => {
  const date = new Date(timestamp)
  return isValid(date)
}

/**
 * Parses month labels commonly used in UI sorting.
 *
 * Supported formats:
 * - "MM-YY" (e.g. "01-26") → assumes 2000–2099
 * - "MM-YYYY" (e.g. "01-2025")
 *
 * Returns the first day of the parsed month in the local timezone.
 */
export const parseMonthLabelToDate = (label: unknown): Date | null => {
  if (typeof label !== 'string') return null

  const mmYy = /^(\d{2})-(\d{2})$/
  const mmYyyy = /^(\d{2})-(\d{4})$/

  const matchMmYy = label.match(mmYy)
  const matchMmYyyy = label.match(mmYyyy)

  if (matchMmYyyy) {
    const [, mm, yyyy] = matchMmYyyy
    const month = parseInt(mm, 10)
    const year = parseInt(yyyy, 10)
    return new Date(year, month - 1)
  }

  if (matchMmYy) {
    const [, mm, yy] = matchMmYy
    const month = parseInt(mm, 10)
    const year = 2000 + parseInt(yy, 10)
    return new Date(year, month - 1)
  }

  return null
}

export const getRangeTimestamps = (
  range: [Date, Date] | null | undefined,
  timezone: string,
  preserveUTC: boolean = false,
): [Date, Date] | [null, null] => {
  if (!range) return [null, null]

  const [startDate, endDate] = range

  // If dates are already normalized (from pre-calculated sources like weeksOfMonth),
  // preserve their UTC timestamps without re-interpreting them
  if (preserveUTC) {
    return [startDate, endDate]
  }

  // Date picker gives us Date objects that represent the user's selection.
  // The year/month/day values in these Date objects are what the user selected,
  // regardless of the browser's timezone. We need to extract these values and
  // treat them as being in the target timezone (e.g., America/Bahia).
  const startYear = getYear(startDate)
  const startMonth = getMonth(startDate)
  const startDay = getDate(startDate)

  const endYear = getYear(endDate)
  const endMonth = getMonth(endDate)
  const endDay = getDate(endDate)

  // Check if this represents a full month selection
  const startMonthDate = new Date(startYear, startMonth, 1)
  const isFullMonth = startDay === 1 && endDay === getDaysInMonth(startMonthDate)

  if (isFullMonth) {
    // Full month: create dates representing start/end of month in target timezone
    const startInZone = startOfMonth(startMonthDate)
    const endInZone = endOfMonth(startMonthDate)

    // Convert from target timezone to UTC
    return [fromZonedTime(startInZone, timezone), fromZonedTime(endInZone, timezone)]
  }

  // For non-full-month ranges, create dates representing start/end of day in target timezone
  const startInZone = startOfDay(new Date(startYear, startMonth, startDay))
  const endInZone = endOfDay(new Date(endYear, endMonth, endDay))

  // Convert from target timezone to UTC
  const startUtc = fromZonedTime(startInZone, timezone)
  const endUtc = fromZonedTime(endInZone, timezone)

  // Check if end date is in the future (using target timezone for consistency)
  const now = new Date()
  const nowInTargetZone = toZonedTime(now, timezone)
  const nowInZone = startOfDay(nowInTargetZone)
  const nowUtc = fromZonedTime(nowInZone, timezone)

  const endDateInZone = startOfDay(new Date(endYear, endMonth, endDay))
  const endDateUtc = fromZonedTime(endDateInZone, timezone)

  let finalEndUtc: Date
  if (isAfter(endDateUtc, nowUtc)) {
    // if endDate is in the future → use yesterday in target timezone
    const yesterdayInZone = endOfDay(subDays(nowInTargetZone, 1))
    finalEndUtc = fromZonedTime(yesterdayInZone, timezone)
  } else {
    // otherwise, use endDate
    finalEndUtc = endUtc
  }

  return [startUtc, finalEndUtc]
}

export const getPastDateFromDate = ({
  dateTs = Date.now(),
  days,
}: {
  dateTs?: number
  days: number
}): Date => new Date(dateTs - days * 24 * 60 * 60 * 1000)

export const getEndOfYesterday = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  date.setHours(23, 59, 59, 999) // end of the day
  return date
}

export const getBeginningOfMonth = (date: Date = new Date()): Date => {
  const beginningOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  beginningOfMonth.setHours(0, 0, 0, 0) // start of the day

  return beginningOfMonth
}
