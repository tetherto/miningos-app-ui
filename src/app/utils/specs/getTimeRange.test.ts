import { endOfDay } from 'date-fns/endOfDay'
import { startOfDay } from 'date-fns/startOfDay'

import {
  getLastDays,
  getLastNDaysEndingYesterday,
  getTimeRange,
  getYesterdaysTimeRange,
  TimeRangeTypes,
} from '../getTimeRange'

describe('getTimeRange', () => {
  it('should return DAY for undefined timestamps', () => {
    expect(getTimeRange(undefined, undefined)).toBe(TimeRangeTypes.DAY)
  })

  it('should return DAY for range of 0 (single data point)', () => {
    const timestamp = 1647717913000
    expect(getTimeRange(timestamp, timestamp)).toBe(TimeRangeTypes.DAY)
  })

  it('should return MINUTE for range less than 24 hours', () => {
    const end = 1647717913000
    const start = end - 12 * 60 * 60 * 1000 // 12 hours before
    expect(getTimeRange(end, start)).toBe(TimeRangeTypes.MINUTE)
  })

  it('should return DAY for range greater than 24 hours', () => {
    const end = 1647717913000
    const start = end - 48 * 60 * 60 * 1000 // 48 hours before
    expect(getTimeRange(end, start)).toBe(TimeRangeTypes.DAY)
  })
})

describe('getLastDays', () => {
  it('should return a time range for the specified number of days', () => {
    const result = getLastDays(3)
    expect(result).toHaveProperty('start')
    expect(result).toHaveProperty('end')
    expect(result.end).toBeGreaterThan(result.start)
  })

  it('should default to 1 day', () => {
    const result = getLastDays()
    const oneDayMs = 24 * 60 * 60 * 1000
    expect(result.end - result.start).toBeLessThanOrEqual(oneDayMs)
  })
})

describe('getYesterdaysTimeRange', () => {
  it('should return start and end of yesterday', () => {
    const result = getYesterdaysTimeRange()
    expect(result).toHaveProperty('start')
    expect(result).toHaveProperty('end')
    expect(result.end).toBeGreaterThan(result.start)
  })
})

describe('getLastNDaysEndingYesterday', () => {
  it('should return 7 days by default ending at end of yesterday', () => {
    const referenceDate = new Date('2025-01-15T12:00:00Z')
    const result = getLastNDaysEndingYesterday(7, referenceDate)

    // Yesterday is Jan 14, 2025
    // 7 days ending yesterday means Jan 8 to Jan 14
    const expectedStart = startOfDay(new Date('2025-01-08T00:00:00Z')).getTime()
    const expectedEnd = endOfDay(new Date('2025-01-14T00:00:00Z')).getTime()

    expect(result.start).toBe(expectedStart)
    expect(result.end).toBe(expectedEnd)
  })

  it('should return correct range for 1 day (just yesterday)', () => {
    const referenceDate = new Date('2025-01-15T12:00:00Z')
    const result = getLastNDaysEndingYesterday(1, referenceDate)

    // 1 day ending yesterday means just Jan 14
    const expectedStart = startOfDay(new Date('2025-01-14T00:00:00Z')).getTime()
    const expectedEnd = endOfDay(new Date('2025-01-14T00:00:00Z')).getTime()

    expect(result.start).toBe(expectedStart)
    expect(result.end).toBe(expectedEnd)
  })

  it('should return correct range for 30 days', () => {
    const referenceDate = new Date('2025-01-31T12:00:00Z')
    const result = getLastNDaysEndingYesterday(30, referenceDate)

    // Yesterday is Jan 30, 2025
    // 30 days ending yesterday means Jan 1 to Jan 30
    const expectedStart = startOfDay(new Date('2025-01-01T00:00:00Z')).getTime()
    const expectedEnd = endOfDay(new Date('2025-01-30T00:00:00Z')).getTime()

    expect(result.start).toBe(expectedStart)
    expect(result.end).toBe(expectedEnd)
  })

  it('should handle month boundaries correctly', () => {
    const referenceDate = new Date('2025-02-03T12:00:00Z')
    const result = getLastNDaysEndingYesterday(7, referenceDate)

    // Yesterday is Feb 2, 2025
    // 7 days ending yesterday means Jan 27 to Feb 2
    const expectedStart = startOfDay(new Date('2025-01-27T00:00:00Z')).getTime()
    const expectedEnd = endOfDay(new Date('2025-02-02T00:00:00Z')).getTime()

    expect(result.start).toBe(expectedStart)
    expect(result.end).toBe(expectedEnd)
  })

  it('should use current date when referenceDate is not provided', () => {
    const result = getLastNDaysEndingYesterday(7)

    expect(result).toHaveProperty('start')
    expect(result).toHaveProperty('end')
    expect(result.end).toBeGreaterThan(result.start)

    // The range should be approximately 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const rangeDuration = result.end - result.start
    expect(rangeDuration).toBeLessThanOrEqual(sevenDaysMs)
    expect(rangeDuration).toBeGreaterThan(6 * 24 * 60 * 60 * 1000) // At least 6 days
  })
})
