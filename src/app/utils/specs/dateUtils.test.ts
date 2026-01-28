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
    const startDate = new Date('2025-08-01T05:00:00Z') // Aug 1
    const endDate = new Date('2025-08-31T20:00:00Z') // Aug 31

    const [startUTC, endUTC] = getRangeTimestamps([startDate, endDate], timezone)

    expect(startUTC).not.toBeNull()
    expect(endUTC).not.toBeNull()

    if (startUTC && endUTC) {
      expect(startUTC.getFullYear()).toBe(2025)
      expect(startUTC.getMonth()).toBe(7) // August (0-indexed)
      expect(startUTC.getDate()).toBe(1)
      expect(startUTC.getHours()).toBe(0)

      expect(endUTC.getFullYear()).toBe(2025)
      expect(endUTC.getMonth()).toBe(7) // August
      expect(endUTC.getDate()).toBe(31)
      expect(endUTC.getHours()).toBe(23)
      expect(endUTC.getMinutes()).toBe(59)
      expect(endUTC.getSeconds()).toBe(59)
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
