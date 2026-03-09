import {
  getLabelFormat,
  generateTimeRange,
  generateMonthRange,
  fillMissingMonths,
  fillMissingMonthsInAggregated,
  fillMissingPeriodsInAggregated,
} from '../date-range-utils'
import { PERIOD } from '@/constants/ranges'

describe('date-range-utils', () => {
  describe('getLabelFormat', () => {
    it('returns MM-yy for monthly period', () => {
      expect(getLabelFormat(PERIOD.MONTHLY)).toBe('MM-yy')
    })
    it('returns dd-MM for other periods', () => {
      expect(getLabelFormat('daily')).toBe('dd-MM')
      expect(getLabelFormat('weekly')).toBe('dd-MM')
    })
  })

  describe('generateTimeRange', () => {
    it('returns empty array for invalid dates', () => {
      expect(generateTimeRange('invalid', 'invalid')).toEqual([])
      expect(generateTimeRange(NaN as never, new Date())).toEqual([])
    })
    it('returns daily periods by default', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-03')
      const result = generateTimeRange(start, end)
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0]).toHaveProperty('label')
      expect(result[0]).toHaveProperty('ts')
      expect(result[0]).toHaveProperty('date')
    })
    it('returns monthly periods when period is monthly', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-03-01')
      const result = generateTimeRange(start, end, PERIOD.MONTHLY)
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('generateMonthRange', () => {
    it('returns month range between start and end', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-03-01')
      const result = generateMonthRange(start, end)
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result[0].label).toBeDefined()
      expect(result[0].ts).toBeDefined()
    })
  })

  describe('fillMissingMonths', () => {
    it('fills missing months with zero value', () => {
      const existingData = [{ label: '01-01', ts: 1704067200000, value: 100 }]
      const start = new Date('2024-01-01')
      const end = new Date('2024-03-01')
      const result = fillMissingMonths(existingData, start, end)
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.some((r) => r.value === 0)).toBe(true)
    })
  })

  describe('fillMissingMonthsInAggregated', () => {
    it('returns original data when no start/end', () => {
      const data = [{ label: '01-01', ts: 1, producedBTC: 0 }] as never[]
      expect(fillMissingMonthsInAggregated(data, null, null)).toEqual(data)
      expect(fillMissingMonthsInAggregated(data, undefined, undefined)).toEqual(data)
    })
    it('returns zero-filled items when aggregatedData empty', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-02-01')
      const result = fillMissingMonthsInAggregated([], start, end)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('producedBTC', 0)
    })
  })

  describe('fillMissingPeriodsInAggregated', () => {
    it('returns original data when no start/end', () => {
      const data = [{ label: '01-01', ts: 1 }] as never[]
      expect(fillMissingPeriodsInAggregated(data, null, null)).toEqual(data)
    })
    it('returns zero-filled items when aggregatedData empty and dates provided', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-05')
      const result = fillMissingPeriodsInAggregated([], start, end, 'daily')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
