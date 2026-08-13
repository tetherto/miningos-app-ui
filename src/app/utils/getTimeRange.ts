import { add } from 'date-fns/add'
import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'
import { subDays } from 'date-fns/subDays'
import { subHours } from 'date-fns/subHours'
import { subMonths } from 'date-fns/subMonths'

import { getTimeRoundedToMinute } from './dateTimeUtils'

export const TimeRangeTypes = {
  DAY: 'day',
  MINUTE: 'minute',
} as const

export type TimeRangeType = (typeof TimeRangeTypes)[keyof typeof TimeRangeTypes]

interface TimeRange {
  start: number
  end: number
}

export const getTimeRange = (
  latestTimeStampMs: number | undefined,
  oldTimeStampMs: number | undefined,
): TimeRangeType => {
  if (!latestTimeStampMs || !oldTimeStampMs) {
    return TimeRangeTypes.DAY
  }
  const range = latestTimeStampMs - oldTimeStampMs
  // If range is 0 (single data point), default to DAY
  if (range === 0) {
    return TimeRangeTypes.DAY
  }
  let timeRange: TimeRangeType = TimeRangeTypes.DAY
  if (range <= 24 * 60 * 60 * 1000) {
    timeRange = TimeRangeTypes.MINUTE
  }
  return timeRange
}

export const getLastHours = (hours = 1): TimeRange => {
  const now = getTimeRoundedToMinute()
  const start = getTimeRoundedToMinute(subHours(now, hours))
  return { start, end: now }
}

export const getLastDays = (days = 1): TimeRange => {
  const now = getTimeRoundedToMinute()
  const start = getTimeRoundedToMinute(subDays(now, days))
  return { start, end: now }
}

export const getLastMonth = (): TimeRange => {
  const now = getTimeRoundedToMinute()
  const start = getTimeRoundedToMinute(subMonths(now, 1))
  return { start, end: now }
}

export const getYesterdaysTimeRange = (): TimeRange => {
  const currentDate = new Date()
  const yesterday = subDays(currentDate, 1)
  const start = getTimeRoundedToMinute(startOfDay(yesterday))
  const end = getTimeRoundedToMinute(endOfDay(yesterday))
  return { start, end }
}

/**
 * Returns a time range for the last N days ending at the end of yesterday.
 * Useful for reports that exclude the current (incomplete) day.
 * @param days - Number of days to include in the range (default: 7)
 * @param [referenceDate] - Reference date to calculate from (default: current date). Useful for testing.
 * @returns TimeRange with start at beginning of (days-1) days ago and end at end of yesterday
 */
export const getLastNDaysEndingYesterday = (days = 7, referenceDate = new Date()): TimeRange => {
  const yesterday = subDays(referenceDate, 1)
  const start = startOfDay(subDays(yesterday, days - 1)).getTime()
  const end = endOfDay(yesterday).getTime()
  return { start, end }
}

const isValidDate = (dateString: string): boolean => {
  const parsedDate = new Date(dateString)
  return !isNaN(parsedDate.getTime())
}

export const getTimeDistance = (
  cardActionId: string,
  getFormattedDate: (date: Date, timezone: string, format: string) => string,
  timezone: string,
): string | undefined => {
  const isValidTimeId = isValidDate(cardActionId)
  if (!isValidTimeId) return

  const date = new Date(cardActionId)

  const formattedDate = getFormattedDate(date, timezone, 'dd MMM yyyy')
  const formattedTime = getFormattedDate(date, timezone, 'HH:mm:ss')

  return `${formattedDate}, ${formattedTime}`
}

/**
 * Iterates over timestamps from startTs to endTs.
 * The timestamps are separated by the given duration.
 * @param {int} startTs timestamp to start iteration at
 * @param {int} endTs timestamp to end iteration at
 * @param {object} duration date-fns duration obj
 */
export function* timeRangeWalker(
  startTs: number,
  endTs: number,
  duration: Parameters<typeof add>[1],
): Generator<number> {
  if (!startTs || !endTs) {
    throw new Error('startTs, endTs must be provided')
  }

  let currentTs = startTs
  yield currentTs

  while (currentTs <= endTs) {
    const currentDate = new Date(currentTs)
    currentTs = add(currentDate, duration).valueOf()
    yield currentTs
  }
}
