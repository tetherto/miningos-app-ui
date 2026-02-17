import { toZonedTime } from 'date-fns-tz'

import { getLastMinuteTime } from '../dateTimeUtils'
import { getRangeTimestamps, isValidTimestamp, parseMonthLabelToDate } from '../dateUtils'

describe('isValidTimestamp', () => {
  it('should return true for a valid timestamp', () => {
    const validTimestamp = 1647717913000
    expect(isValidTimestamp(validTimestamp)).toBe(true)
  })

  it('should return false for undefined', () => {
    const invalidTimestamp = undefined
    expect(isValidTimestamp(invalidTimestamp as unknown as number)).toBe(false)
  })

  it('should return false for NaN', () => {
    const invalidTimestamp = NaN
    expect(isValidTimestamp(invalidTimestamp)).toBe(false)
  })

  it('should return false for a string', () => {
    const invalidTimestamp = 'not_a_timestamp'
    expect(isValidTimestamp(invalidTimestamp as unknown as number)).toBe(false)
  })
})

describe('getRangeTimestamps', () => {
  const timezone = 'Europe/Berlin'

  it('returns full month correctly', () => {
    const startDate = new Date(2025, 7, 1) // Aug 1, 2025 in local timezone
    const endDate = new Date(2025, 7, 31) // Aug 31, 2025 in local timezone

    const [startUTC, endUTC] = getRangeTimestamps([startDate, endDate], timezone)

    expect(startUTC).not.toBeNull()
    expect(endUTC).not.toBeNull()

    if (startUTC && endUTC) {
      const startInBerlin = toZonedTime(startUTC, timezone)
      const endInBerlin = toZonedTime(endUTC, timezone)

      expect(startInBerlin.getFullYear()).toBe(2025)
      expect(startInBerlin.getMonth()).toBe(7) // August (0-indexed)
      expect(startInBerlin.getDate()).toBe(1)
      expect(startInBerlin.getHours()).toBe(0)

      expect(endInBerlin.getFullYear()).toBe(2025)
      expect(endInBerlin.getMonth()).toBe(7) // August
      expect(endInBerlin.getDate()).toBe(31)
      expect(endInBerlin.getHours()).toBe(23)
      expect(endInBerlin.getMinutes()).toBe(59)
      expect(endInBerlin.getSeconds()).toBe(59)
    }
  })

  it('returns non-full-month range correctly with timezone awareness', () => {
    // Test case: Feb 6-7, 2026
    // This should correctly convert to UTC timestamps that represent Feb 6-7 in the target timezone
    const startDate = new Date(2026, 1, 6) // Feb 6, 2026 in local timezone
    const endDate = new Date(2026, 1, 7) // Feb 7, 2026 in local timezone

    const [startUTC, endUTC] = getRangeTimestamps([startDate, endDate], timezone)

    expect(startUTC).not.toBeNull()
    expect(endUTC).not.toBeNull()

    if (startUTC && endUTC) {
      const startInBerlin = toZonedTime(startUTC, timezone)
      const endInBerlin = toZonedTime(endUTC, timezone)

      // Verify that the dates in the target timezone match what was selected
      expect(startInBerlin.getFullYear()).toBe(2026)
      expect(startInBerlin.getMonth()).toBe(1) // February (0-indexed)
      expect(startInBerlin.getDate()).toBe(6)
      expect(startInBerlin.getHours()).toBe(0)
      expect(startInBerlin.getMinutes()).toBe(0)
      expect(startInBerlin.getSeconds()).toBe(0)

      expect(endInBerlin.getFullYear()).toBe(2026)
      expect(endInBerlin.getMonth()).toBe(1) // February
      expect(endInBerlin.getDate()).toBe(7)
      expect(endInBerlin.getHours()).toBe(23)
      expect(endInBerlin.getMinutes()).toBe(59)
      expect(endInBerlin.getSeconds()).toBe(59)
    }
  })
})

describe('parseMonthLabelToDate', () => {
  it('parses MM-YYYY', () => {
    const d = parseMonthLabelToDate('01-2025')
    expect(d).not.toBeNull()
    expect(d?.getFullYear()).toBe(2025)
    expect(d?.getMonth()).toBe(0)
    expect(d?.getDate()).toBe(1)
  })

  it('parses MM-YY as 2000–2099', () => {
    const d = parseMonthLabelToDate('12-24')
    expect(d).not.toBeNull()
    expect(d?.getFullYear()).toBe(2024)
    expect(d?.getMonth()).toBe(11)
    expect(d?.getDate()).toBe(1)
  })

  it('returns null for non-matching inputs', () => {
    expect(parseMonthLabelToDate('Apr 2024')).toBeNull()
    expect(parseMonthLabelToDate('1-2025')).toBeNull()
    expect(parseMonthLabelToDate(undefined)).toBeNull()
  })
})

describe('getLastMinuteTime', () => {
  it('should return start of the last minute', () => {
    const date = new Date(2000, 1, 1, 13, 5)
    vi.setSystemTime(date)

    expect(getLastMinuteTime().valueOf()).toBe(new Date(2000, 1, 1, 13, 4).valueOf())
  })
})
