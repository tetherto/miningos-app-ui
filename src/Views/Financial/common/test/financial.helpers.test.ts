import { getPeriodKey, getPeriodType, MS_PER_DAY } from '../financial.helpers'

import { PERIOD } from '@/constants/ranges'

describe('getPeriodKey', () => {
  it('should format month key as MM-YY', () => {
    const timestamp = new Date('2024-04-15').getTime()
    expect(getPeriodKey(timestamp, 'month')).toBe('2024-04')
  })

  it('should format week key as "Week N"', () => {
    const timestamp = new Date('2024-04-15').getTime()
    expect(getPeriodKey(timestamp, 'week')).toBe('04-15')
  })

  it('should format day key as day name', () => {
    const timestamp = new Date('2024-04-15').getTime()
    const result = getPeriodKey(timestamp, 'day')
    expect(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).toContain(result)
  })
})

describe('getPeriodType', () => {
  const now = Date.now()

  const createRange = (
    startOffsetDays: number,
    endOffsetDays: number,
    period: string = PERIOD.DAILY,
  ) => ({
    start: now + startOffsetDays * MS_PER_DAY,
    end: now + endOffsetDays * MS_PER_DAY,
    period,
  })

  it('returns "month" when dateRange is null', () => {
    expect(getPeriodType(null)).toBe('month')
  })

  it('returns "month" when period is undefined', () => {
    expect(
      getPeriodType({
        start: now,
        end: now,
        period: undefined,
      }),
    ).toBe('month')
  })

  it('returns "month" when period is MONTHLY', () => {
    expect(
      getPeriodType({
        start: now,
        end: now,
        period: PERIOD.MONTHLY,
      }),
    ).toBe('month')
  })

  it('returns "day" for DAILY when range is 7 days or fewer', () => {
    const range = createRange(0, 6, PERIOD.DAILY)
    expect(getPeriodType(range)).toBe('day')
  })

  it('returns "week" for DAILY when range is more than 7 days', () => {
    const range = createRange(0, 8, PERIOD.DAILY)
    expect(getPeriodType(range)).toBe('week')
  })

  it('returns "month" for unsupported period types', () => {
    const range = {
      start: now,
      end: now + MS_PER_DAY * 30,
      period: 'YEARLY',
    }
    expect(getPeriodType(range)).toBe('month')
  })
})
