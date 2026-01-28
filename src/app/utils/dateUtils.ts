import { endOfDay } from 'date-fns/endOfDay'
import { isValid } from 'date-fns/isValid'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { toZonedTime } from 'date-fns-tz'

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
): [Date, Date] | [null, null] => {
  if (!range) return [null, null]

  const [startDate, endDate] = range

  // Check if this represents a full month selection
  // A full month starts on the 1st and ends on the last day of the month
  const isFullMonth =
    startDate.getDate() === 1 &&
    endDate.getDate() === new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()

  if (isFullMonth) {
    // For full month selections, preserve the exact month boundaries
    // Convert to start and end of the days in UTC, preserving month boundaries
    const startUTC = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0)
    const endUTC = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59, 999)

    return [startUTC, endUTC]
  }

  const todayInZone = startOfDay(toZonedTime(new Date(), timezone))
  // For other date ranges, use the standard timezone conversion
  const startOfUserDay = startOfDay(toZonedTime(startDate, timezone))

  let endOfDayInZone: Date
  if (endDate > todayInZone) {
    // if endDate is in the future → use yesterday
    const yesterday = subDays(todayInZone, 1)
    endOfDayInZone = endOfDay(yesterday)
  } else {
    // otherwise, use endDate
    endOfDayInZone = endOfDay(endDate)
  }

  return [startOfUserDay, endOfDayInZone]
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
