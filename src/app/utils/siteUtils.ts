import _isNull from 'lodash/isNull'
import _reduce from 'lodash/reduce'
import _size from 'lodash/size'

import type { Interval } from './utils.types'

interface StartupLog {
  ts: number
  aggrCount: number
  full_mining_startup_count: number
}

interface SiteRunningAccumulator {
  ranges: Interval[]
  currentStart: number | null
}

export const getSiteRunningRanges = (
  startupLogs: StartupLog[],
  skipRange = 60 * 60 * 1000,
): Interval[] =>
  _reduce(
    startupLogs,
    (acc, log, idx, arr) => {
      const isRunning = log.aggrCount === log.full_mining_startup_count

      if (isRunning && _isNull(acc.currentStart)) {
        return { ...acc, currentStart: log.ts }
      }

      if (!isRunning && !_isNull(acc.currentStart)) {
        const rawStart = acc.currentStart + skipRange
        const rawEnd = log.ts - skipRange
        const valid = rawEnd > rawStart

        return {
          ranges: valid ? [...acc.ranges, { start: rawStart, end: rawEnd }] : acc.ranges,
          currentStart: null,
        }
      }

      if (idx === _size(arr) - 1 && isRunning && !_isNull(acc.currentStart)) {
        const rawStart = acc.currentStart + skipRange
        const rawEnd = log.ts - skipRange
        const valid = rawEnd > rawStart

        return {
          ranges: valid ? [...acc.ranges, { start: rawStart, end: rawEnd }] : acc.ranges,
          currentStart: null,
        }
      }

      return acc
    },
    { ranges: [], currentStart: null } as SiteRunningAccumulator,
  ).ranges

interface Latest24HoursAccumulator {
  result: Interval[]
  remaining: number
}

export const getLatest24HoursRanges = (ranges: Interval[]): Interval[] => {
  const totalDurationNeeded = 24 * 60 * 60 * 1000 // 24 hours in ms

  const sorted = [...ranges].sort((a, b) => b.end - a.end) // Sort latest first

  const { result } = _reduce(
    sorted,
    ({ result, remaining }, range) => {
      const duration = range.end - range.start

      if (remaining <= 0) {
        return { result, remaining }
      }

      if (duration <= remaining) {
        return {
          result: [...result, range],
          remaining: remaining - duration,
        }
      }

      return {
        result: [...result, { start: range.end - remaining, end: range.end }],
        remaining: 0,
      }
    },
    { result: [], remaining: totalDurationNeeded } as Latest24HoursAccumulator,
  )

  return result.sort((a, b) => a.start - b.start) // Earliest to latest
}
