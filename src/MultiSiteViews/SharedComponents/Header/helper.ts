import { toZonedTime } from 'date-fns-tz'
import _filter from 'lodash/filter.js'
import _padStart from 'lodash/padStart.js'

const MS_IN_DAY = 24 * 60 * 60 * 1000

export interface Month {
  month: number
  label: string
}

export interface Week {
  start: Date
  end: Date
  label: string
  disabled?: boolean
}

export const YEARS: number[] = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)
export const CURRENT_YEAR = new Date().getFullYear()
export const PAST_YEARS: number[] = _filter(YEARS, (y: number) => y !== CURRENT_YEAR)

export const MONTHS: Month[] = Array.from({ length: 12 }, (_, i) => ({
  month: i,
  label: new Date(YEARS[0], i, 1).toLocaleString('en', { month: 'long' }),
}))

export const endOfYesterday = (): Date => {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  d.setTime(d.getTime() - MS_IN_DAY)
  return d
}

export const YESTERDAY: Date = endOfYesterday()
const CURRENT_MONTH = YESTERDAY.getMonth()
const LAST_VISIBLE_MONTH_IN_CUR_YEAR = CURRENT_MONTH
const CUR_YEAR = YESTERDAY.getFullYear()

export const capToYesterday = (d: Date): Date =>
  new Date(Math.min(d.getTime(), endOfYesterday().getTime()))

export const rangeOfYear = (year: number): [Date, Date] => {
  const start = new Date(year, 0, 1, 0, 0, 0, 0)
  const end = capToYesterday(new Date(year, 11, 31, 23, 59, 59, 999))
  return [start, end]
}

export const rangeOfMonth = (year: number, month: number): [Date, Date] => {
  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end = capToYesterday(new Date(year, month + 1, 0, 23, 59, 59, 999))
  return [start, end]
}

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export const weeksOfMonth = (year: number, month: number, timezone = 'UTC'): Week[] => {
  const firstDay = new Date(year, month, 1)
  firstDay.setHours(0, 0, 0, 0)
  const lastDay = new Date(year, month + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  const eoy = endOfYesterday()

  const firstDayInTz = toZonedTime(firstDay, timezone)
  const firstWeekStart = new Date(firstDayInTz)

  const dayOfWeek = firstWeekStart.getDay()
  const mondayBasedDay = (dayOfWeek + 6) % 7
  firstWeekStart.setDate(firstWeekStart.getDate() - mondayBasedDay)

  const result: Week[] = []
  let ws = firstWeekStart

  for (let i = 0; i < 6; i++) {
    if (ws.getTime() > eoy.getTime()) break

    const we = addDays(ws, 6)
    const overlaps = we >= firstDay && ws <= lastDay
    if (!overlaps) {
      ws = addDays(ws, 7)
      continue
    }

    const start = new Date(ws)
    start.setHours(0, 0, 0, 0)
    const end = capToYesterday(new Date(we.setHours(23, 59, 59, 999)))

    const startInTz = toZonedTime(start, timezone)
    const endInTz = toZonedTime(end, timezone)

    const weekStartMonth = startInTz.getMonth()
    const weekEndMonth = endInTz.getMonth()

    if (weekStartMonth === month || weekEndMonth === month) {
      const pad = (n: number) => _padStart(String(n), 2, '0')
      const label = `${pad(startInTz.getDate())}/${pad(startInTz.getMonth() + 1)} - ${pad(endInTz.getDate())}/${pad(endInTz.getMonth() + 1)}`

      result.push({
        start,
        end,
        label,
        disabled: start > eoy,
      })
    }

    ws = addDays(ws, 7)
  }

  return result
}

export const monthsForYear = (y: number): Month[] => {
  if (y === CUR_YEAR) {
    if (LAST_VISIBLE_MONTH_IN_CUR_YEAR < 0) return []
    return _filter(MONTHS, ({ month }) => month <= LAST_VISIBLE_MONTH_IN_CUR_YEAR)
  }
  return MONTHS
}
