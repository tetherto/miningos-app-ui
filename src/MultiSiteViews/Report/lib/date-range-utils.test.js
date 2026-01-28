import { generateTimeRange, fillMissingPeriodsInAggregated } from './date-range-utils'

describe('date-range-utils', () => {
  describe('generateTimeRange', () => {
    it('should generate a complete range of days', () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-03'
      const result = generateTimeRange(startDate, endDate, 'daily', 'dd-MM')

      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('01-01')
      expect(result[1].label).toBe('02-01')
      expect(result[2].label).toBe('03-01')
    })

    it('should generate a complete range of weeks', () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-15'
      const result = generateTimeRange(startDate, endDate, 'weekly', 'dd-MM')

      expect(result.length).toBeGreaterThan(1)
      expect(result[0].label).toBeDefined()
    })

    it('should generate a complete range of months', () => {
      const startDate = '2024-01-01'
      const endDate = '2024-03-01'
      const result = generateTimeRange(startDate, endDate, 'monthly', 'MM-dd')

      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('01-01')
      expect(result[1].label).toBe('02-01')
      expect(result[2].label).toBe('03-01')
    })

    it('should return empty array for invalid dates', () => {
      const result = generateTimeRange('invalid', 'invalid', 'daily', 'dd-MM')
      expect(result).toHaveLength(0)
    })
  })

  describe('fillMissingPeriodsInAggregated', () => {
    it('should fill missing days with zero values', () => {
      const existingData = [
        { label: '01-01', ts: 1704067200000, value: 100, other: 50 },
        { label: '03-01', ts: 1704240000000, value: 200, other: 75 },
      ]

      const startDate = '2024-01-01'
      const endDate = '2024-01-03'

      const result = fillMissingPeriodsInAggregated(
        existingData,
        startDate,
        endDate,
        'daily',
        'dd-MM',
      )

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ label: '01-01', ts: 1704067200000, value: 100, other: 50 })
      expect(result[1]).toEqual({ label: '02-01', ts: 1704153600000, value: 0, other: 0 })
      expect(result[2]).toEqual({ label: '03-01', ts: 1704240000000, value: 200, other: 75 })
    })

    it('should fill missing months with zero values', () => {
      const existingData = [
        { label: '01-01', ts: 1704067200000, value: 100, other: 50 },
        { label: '03-01', ts: 1706745600000, value: 200, other: 75 },
      ]

      const startDate = '2024-01-01'
      const endDate = '2024-03-01'

      const result = fillMissingPeriodsInAggregated(
        existingData,
        startDate,
        endDate,
        'monthly',
        'MM-dd',
      )

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ label: '01-01', ts: 1704067200000, value: 100, other: 50 })
      expect(result[1]).toEqual({ label: '02-01', ts: 1706745600000, value: 0, other: 0 })
      expect(result[2]).toEqual({ label: '03-01', ts: 1706745600000, value: 200, other: 75 })
    })

    it('should handle empty data for daily period', () => {
      const result = fillMissingPeriodsInAggregated(
        [],
        '2024-01-01',
        '2024-01-03',
        'daily',
        'dd-MM',
      )
      expect(result).toHaveLength(3)
      expect(result[0].label).toBe('01-01')
      expect(result[0].producedBTC).toBe(0)
      expect(result[0].ebitdaSell).toBe(0)
      expect(result[0].ebitdaHodl).toBe(0)
    })

    it('should return original data if no date range provided', () => {
      const existingData = [{ label: '01-01', value: 100 }]
      const result = fillMissingPeriodsInAggregated(existingData, null, null, 'daily', 'dd-MM')
      expect(result).toEqual(existingData)
    })
  })
})
