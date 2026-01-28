import { getTimeRoundedToMinute, getNextHourRange } from '../dateTimeUtils'

describe('dateUtils', () => {
  describe('getTimeRoundedToMinute', () => {
    it('should round the time to the nearest minute', () => {
      const date = new Date('2023-03-15T12:34:56.789Z')
      const expectedTime = new Date('2023-03-15T12:34:00.000Z').getTime()
      expect(getTimeRoundedToMinute(date)).toBe(expectedTime)
    })

    it('should return the current time rounded to the nearest minute if no date is provided', () => {
      const date = new Date()
      date.setSeconds(0)
      date.setMilliseconds(0)
      expect(getTimeRoundedToMinute()).toBe(date.getTime())
    })
  })

  describe('getNextHourRange', () => {
    it('should return the correct next hour range in default timezone', () => {
      const timestampMs = 1647717913000
      const result = getNextHourRange(timestampMs)
      expect(result.start).toBe('17:00')
      expect(result.end).toBe('18:00')
      expect(result.formatted).toBe('17:00 - 18:00')
    })

    it('should return the empty string for invalid timestamp', () => {
      const invalidTimestamp = undefined
      const result = getNextHourRange(invalidTimestamp)
      expect(result.formatted).toBe('')
    })
  })
})
