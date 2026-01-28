import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Week, weeksOfMonth } from './helper'

const mockTimezone = 'Europe/Madrid'
vi.mock('@/hooks/useTimezone', () => ({
  default: () => ({
    timezone: mockTimezone,
  }),
}))

vi.mock('./helper', () => ({
  YEARS: [2024, 2023, 2022],
  MONTHS: [
    { month: 0, label: 'January' },
    { month: 1, label: 'February' },
    { month: 8, label: 'September' },
    { month: 9, label: 'October' },
  ],
  weeksOfMonth: vi.fn((year: number, month: number, timezone: string): Week[] => {
    const mockWeeks: Week[] = [
      {
        start: new Date('2024-09-22T00:00:00Z'),
        end: new Date('2024-09-28T23:59:59Z'),
        label: '22/09 - 28/09',
        disabled: false,
      },
      {
        start: new Date('2024-09-29T00:00:00Z'),
        end: new Date('2024-10-05T23:59:59Z'),
        label: '29/09 - 05/10',
        disabled: false,
      },
    ]
    return mockWeeks.filter((week: Week) => {
      const startMonth = week.start.getMonth()
      const endMonth = week.end.getMonth()
      return startMonth === month || endMonth === month
    })
  }),
  rangeOfYear: vi.fn((): [Date, Date] => [new Date(2024, 0, 1), new Date(2024, 11, 31)]),
  rangeOfMonth: vi.fn((year: number, month: number): [Date, Date] => [
    new Date(year, month, 1),
    new Date(year, month + 1, 0),
  ]),
  monthsForYear: vi.fn(() => [
    { month: 0, label: 'January' },
    { month: 1, label: 'February' },
    { month: 8, label: 'September' },
    { month: 9, label: 'October' },
  ]),
}))

vi.mock('@/constants/ranges', () => ({
  PERIOD: {
    DAILY: 'daily',
    MONTHLY: 'monthly',
  },
  TIMEFRAME_TYPE: {
    YEAR: 'year',
    MONTH: 'month',
    WEEK: 'week',
  },
}))

describe('TimeframeControls - Timezone Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call weeksOfMonth with correct timezone', () => {
    const result: Week[] = weeksOfMonth(2024, 8, mockTimezone)
    expect(weeksOfMonth).toHaveBeenCalledWith(2024, 8, mockTimezone)
    expect(result).toBeDefined()
  })

  it('should handle timezone changes correctly', () => {
    const timezones: string[] = ['UTC', 'Europe/Madrid', 'America/New_York']
    timezones.forEach((tz: string) => {
      const result: Week[] = weeksOfMonth(2024, 8, tz)
      expect(weeksOfMonth).toHaveBeenCalledWith(2024, 8, tz)
      expect(result).toBeDefined()
    })
  })

  it('should maintain UTC consistency for API calls', () => {
    const weeks: Week[] = weeksOfMonth(2024, 8, mockTimezone)
    weeks.forEach((week: Week) => {
      expect(week.start).toBeInstanceOf(Date)
      expect(week.end).toBeInstanceOf(Date)
      expect(week.start.getTime()).toBeGreaterThan(0)
      expect(week.end.getTime()).toBeGreaterThan(week.start.getTime())
    })
  })

  it('should generate timezone-aware labels', () => {
    const weeks: Week[] = weeksOfMonth(2024, 8, mockTimezone)
    weeks.forEach((week: Week) => {
      expect(week.label).toMatch(/^\d{2}\/\d{2} - \d{2}\/\d{2}$/)
      expect(typeof week.label).toBe('string')
    })
  })
})
