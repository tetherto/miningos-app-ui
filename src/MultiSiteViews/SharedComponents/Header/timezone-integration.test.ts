import { beforeEach, describe, expect, it, vi } from 'vitest'

import { weeksOfMonth } from './helper'

import { getRangeTimestamps } from '@/app/utils/dateUtils'

interface Week {
  start: Date
  end: Date
  label: string
  disabled?: boolean
}

vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date: Date, timezone: string): Date => {
    const utcTime = date.getTime()

    switch (timezone) {
      case 'Europe/Madrid':
        return new Date(utcTime + 2 * 60 * 60 * 1000)
      case 'America/New_York':
        return new Date(utcTime - 4 * 60 * 60 * 1000)
      case 'Asia/Tokyo':
        return new Date(utcTime + 9 * 60 * 60 * 1000)
      default:
        return new Date(utcTime)
    }
  }),
}))

describe('Timezone Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Week calculation consistency across timezones', () => {
    it('should maintain UTC consistency for API calls', () => {
      const year = 2024
      const month = 8 // September

      const timezones: string[] = ['UTC', 'Europe/Madrid', 'America/New_York', 'Asia/Tokyo']

      timezones.forEach((timezone: string) => {
        const weeks: Week[] = weeksOfMonth(year, month, timezone)

        weeks.forEach((week: Week) => {
          expect(week.start).toBeInstanceOf(Date)
          expect(week.end).toBeInstanceOf(Date)
          expect(week.start.getTime()).toBeGreaterThan(0)
          expect(week.end.getTime()).toBeGreaterThan(week.start.getTime())
        })
      })
    })

    it('should generate different labels for different timezones', () => {
      const year = 2024
      const month = 8

      const utcWeeks: Week[] = weeksOfMonth(year, month, 'UTC')
      const madridWeeks: Week[] = weeksOfMonth(year, month, 'Europe/Madrid')

      expect(utcWeeks.length).toBe(madridWeeks.length)

      const utcLabels: string[] = utcWeeks.map((w: Week) => w.label)
      const madridLabels: string[] = madridWeeks.map((w: Week) => w.label)

      const allIdentical = utcLabels.every((label, index) => label === madridLabels[index])
      expect(allIdentical).toBe(false)
    })
  })

  describe('API request consistency', () => {
    it('should produce consistent API parameters across timezones', () => {
      const year = 2024
      const month = 8

      const utcWeeks: Week[] = weeksOfMonth(year, month, 'UTC')
      const madridWeeks: Week[] = weeksOfMonth(year, month, 'Europe/Madrid')

      const utcWeek: Week = utcWeeks[0]
      const madridWeek: Week = madridWeeks[0]

      const utcRange = getRangeTimestamps([utcWeek.start, utcWeek.end], 'UTC')
      const madridRange = getRangeTimestamps([madridWeek.start, madridWeek.end], 'Europe/Madrid')

      expect(utcRange[0]).not.toBeNull()
      expect(utcRange[1]).not.toBeNull()
      expect(madridRange[0]).not.toBeNull()
      expect(madridRange[1]).not.toBeNull()

      expect(utcRange[0]!.getTime()).toBe(madridRange[0]!.getTime())
      expect(utcRange[1]!.getTime()).toBe(madridRange[1]!.getTime())
    })

    it('should handle week boundary edge cases correctly', () => {
      const year = 2024
      const month = 8
      const timezone = 'Europe/Madrid'

      const weeks: Week[] = weeksOfMonth(year, month, timezone)

      const crossBoundaryWeek = weeks.find(
        (week: Week) => week.start.getMonth() !== week.end.getMonth(),
      )

      if (crossBoundaryWeek) {
        const startMonth = crossBoundaryWeek.start.getMonth()
        const endMonth = crossBoundaryWeek.end.getMonth()
        expect(startMonth === 8 || endMonth === 8).toBe(true)
      }
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle DST transitions correctly', () => {
      const year = 2024
      const month = 2 // March

      const utcWeeks: Week[] = weeksOfMonth(year, month, 'UTC')
      const madridWeeks: Week[] = weeksOfMonth(year, month, 'Europe/Madrid')

      expect(utcWeeks.length).toBeGreaterThan(0)
      expect(madridWeeks.length).toBeGreaterThan(0)

      const allWeeks: Week[] = [...utcWeeks, ...madridWeeks]
      allWeeks.forEach((week: Week) => {
        expect(week.start.getTime()).toBeGreaterThan(0)
        expect(week.end.getTime()).toBeGreaterThan(week.start.getTime())
        expect(week.label).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/)
      })
    })

    it('should maintain data integrity across timezone changes', () => {
      const year = 2024
      const month = 8

      const initialWeeks: Week[] = weeksOfMonth(year, month, 'UTC')
      const changedWeeks: Week[] = weeksOfMonth(year, month, 'Europe/Madrid')

      expect(initialWeeks.length).toBe(changedWeeks.length)

      initialWeeks.forEach((week, index) => {
        const changedWeek = changedWeeks[index]
        expect(week.start.getTime()).toBe(changedWeek.start.getTime())
        expect(week.end.getTime()).toBe(changedWeek.end.getTime())
      })
    })
  })

  describe('Performance and edge cases', () => {
    it('should handle invalid timezone gracefully', () => {
      const year = 2024
      const month = 8

      expect(() => weeksOfMonth(year, month, 'Invalid/Timezone')).not.toThrow()

      const weeks: Week[] = weeksOfMonth(year, month, 'Invalid/Timezone')
      expect(weeks).toBeDefined()
      expect(Array.isArray(weeks)).toBe(true)
    })

    it('should handle extreme dates', () => {
      const year = 2030
      const month = 11

      const weeks: Week[] = weeksOfMonth(year, month, 'Europe/Madrid')
      expect(weeks).toBeDefined()
      expect(Array.isArray(weeks)).toBe(true)

      weeks.forEach((week: Week) => {
        if (week.start > new Date()) {
          expect(week.disabled).toBe(true)
        }
      })
    })
  })
})
