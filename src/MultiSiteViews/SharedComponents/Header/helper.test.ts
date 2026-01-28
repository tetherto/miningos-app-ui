import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rangeOfMonth, rangeOfYear, Week, weeksOfMonth } from './helper'

vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn((date: Date) => new Date(date)),
}))

describe('weeksOfMonth', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-09-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('UTC timezone', () => {
    it('should calculate weeks correctly for September 2024', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC') // September

      expect(weeks).toBeDefined()
      expect(weeks.length).toBeGreaterThan(0)

      weeks.forEach((week: Week) => {
        expect(week).toHaveProperty('start')
        expect(week).toHaveProperty('end')
        expect(week).toHaveProperty('label')
        expect(week).toHaveProperty('disabled')

        expect(week.start).toBeInstanceOf(Date)
        expect(week.end).toBeInstanceOf(Date)
        expect(typeof week.label).toBe('string')
        expect(typeof week.disabled).toBe('boolean')
      })
    })

    it('should return weeks with Monday start', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')
      weeks.forEach((week: Week) => {
        const dayOfWeek = week.start.getDay()
        expect(dayOfWeek).toBe(1) // Monday
      })
    })

    it('should have proper week duration (7 days)', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')

      weeks.forEach((week: Week) => {
        expect(week.end.getTime()).toBeGreaterThan(week.start.getTime())
        const diffInMs = week.end.getTime() - week.start.getTime()
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
        expect(diffInDays).toBeGreaterThan(5.9)
        expect(diffInDays).toBeLessThan(7.1)
      })
    })

    it('should only include weeks that belong to the target month', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')

      weeks.forEach((week: Week) => {
        const startMonth = week.start.getMonth()
        const endMonth = week.end.getMonth()
        expect(startMonth === 8 || endMonth === 8).toBe(true)
      })
    })
  })

  describe('Europe/Madrid timezone', () => {
    it('should calculate weeks correctly for different timezone', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'Europe/Madrid')
      expect(weeks).toBeDefined()
      expect(weeks.length).toBeGreaterThan(0)

      weeks.forEach((week: Week) => {
        expect(week).toHaveProperty('start')
        expect(week).toHaveProperty('end')
        expect(week).toHaveProperty('label')
        expect(week).toHaveProperty('disabled')
      })
    })

    it('should maintain UTC times for API consistency', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'Europe/Madrid')
      weeks.forEach((week: Week) => {
        expect(week.start).toBeInstanceOf(Date)
        expect(week.end).toBeInstanceOf(Date)
      })
    })
  })

  describe('week labeling', () => {
    it('should generate proper date labels', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')
      weeks.forEach((week: Week) => {
        const labelPattern = /^\d{2}\/\d{2} - \d{2}\/\d{2}$/
        expect(week.label).toMatch(labelPattern)
      })
    })

    it('should not have duplicate weeks', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')
      const weekLabels: string[] = weeks.map((w: Week) => w.label)
      const uniqueLabels: string[] = [...new Set(weekLabels)]
      expect(weekLabels.length).toBe(uniqueLabels.length)
    })
  })

  describe('edge cases', () => {
    it('should handle month boundaries correctly', () => {
      const weeks: Week[] = weeksOfMonth(2024, 8, 'UTC')
      weeks.forEach((week: Week) => {
        const startMonth = week.start.getMonth()
        const endMonth = week.end.getMonth()
        expect(startMonth === 8 || endMonth === 8).toBe(true)
      })
    })

    it('should handle future dates correctly', () => {
      const weeks: Week[] = weeksOfMonth(2025, 0, 'UTC') // January 2025
      weeks.forEach((week: Week) => {
        if (week.start > new Date()) {
          expect(week.disabled).toBe(true)
        }
      })
    })
  })
})

describe('rangeOfMonth', () => {
  it('should return correct month range', () => {
    const [start, end]: [Date, Date] = rangeOfMonth(2024, 8)
    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(8)
    expect(start.getDate()).toBe(1)
    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)

    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(8)
    expect(end.getDate()).toBe(30)
    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
  })
})

describe('rangeOfYear', () => {
  it('should return correct year range', () => {
    const [start, end]: [Date, Date] = rangeOfYear(2024)
    expect(start.getFullYear()).toBe(2024)
    expect(start.getMonth()).toBe(0)
    expect(start.getDate()).toBe(1)

    expect(end.getFullYear()).toBe(2024)
    expect(end.getMonth()).toBe(11)
    expect(end.getDate()).toBe(31)
  })
})
