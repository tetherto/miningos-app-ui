import { describe, expect, it } from 'vitest'

import {
  calculateCostMetrics,
  createCostSummary,
  createYearMonthSet,
  filterCostsBySiteAndDateRange,
  processProductionCosts,
  type ProductionCostItem,
} from './costDataUtils'

describe('costDataUtils', () => {
  describe('createYearMonthSet', () => {
    it('should create set for single month', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-31')

      const result = createYearMonthSet(start, end)

      expect(result).toEqual(new Set(['2025-1']))
    })

    it('should create set for multiple months', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-03-31')

      const result = createYearMonthSet(start, end)

      expect(result).toEqual(new Set(['2025-1', '2025-2', '2025-3']))
    })

    it('should handle year boundary', () => {
      const start = new Date('2024-11-01')
      const end = new Date('2025-02-28')

      const result = createYearMonthSet(start, end)

      expect(result).toEqual(new Set(['2024-11', '2024-12', '2025-1', '2025-2']))
    })

    it('should handle same start and end date', () => {
      const date = new Date('2025-06-15')

      const result = createYearMonthSet(date, date)

      expect(result).toEqual(new Set(['2025-6']))
    })
  })

  describe('filterCostsBySiteAndDateRange', () => {
    const mockCosts: ProductionCostItem[] = [
      { site: 'Site-A', year: 2025, month: 1, energyCost: 1000, operationalCost: 2000 },
      { site: 'Site-A', year: 2025, month: 2, energyCost: 1100, operationalCost: 2100 },
      { site: 'Site-A', year: 2025, month: 3, energyCost: 1200, operationalCost: 2200 },
      { site: 'OtherSite', year: 2025, month: 1, energyCost: 500, operationalCost: 1000 },
      { site: 'Site-A', year: 2024, month: 12, energyCost: 900, operationalCost: 1900 },
    ]

    it('should filter by site name (case-insensitive)', () => {
      const yearMonthSet = new Set(['2025-1', '2025-2', '2025-3'])

      const result = filterCostsBySiteAndDateRange(mockCosts, 'site-a', yearMonthSet)

      expect(result).toHaveLength(3)
      expect(result.every((item) => item.site === 'Site-A')).toBe(true)
    })

    it('should filter by date range', () => {
      const yearMonthSet = new Set(['2025-1', '2025-2'])

      const result = filterCostsBySiteAndDateRange(mockCosts, 'Site-A', yearMonthSet)

      expect(result).toHaveLength(2)
      expect(result[0].month).toBe(1)
      expect(result[1].month).toBe(2)
    })

    it('should handle uppercase site name', () => {
      const yearMonthSet = new Set(['2025-1'])

      const result = filterCostsBySiteAndDateRange(mockCosts, 'SITE-A', yearMonthSet)

      expect(result).toHaveLength(1)
      expect(result[0].site).toBe('Site-A')
    })

    it('should return empty array when no matches', () => {
      const yearMonthSet = new Set(['2026-1'])

      const result = filterCostsBySiteAndDateRange(mockCosts, 'Site-A', yearMonthSet)

      expect(result).toEqual([])
    })

    it('should return empty array for non-existent site', () => {
      const yearMonthSet = new Set(['2025-1'])

      const result = filterCostsBySiteAndDateRange(mockCosts, 'NonExistent', yearMonthSet)

      expect(result).toEqual([])
    })
  })

  describe('createCostSummary', () => {
    it('should convert costs to time-series summary', () => {
      const costs: ProductionCostItem[] = [
        { site: 'Site-A', year: 2025, month: 1, energyCost: 1000, operationalCost: 2000 },
        { site: 'Site-A', year: 2025, month: 2, energyCost: 1100, operationalCost: 2100 },
      ]

      const result = createCostSummary(costs)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        ts: new Date(2025, 0, 1).getTime(), // January 1, 2025
        totalCost: 3000,
      })
      expect(result[1]).toEqual({
        ts: new Date(2025, 1, 1).getTime(), // February 1, 2025
        totalCost: 3200,
      })
    })

    it('should handle zero costs', () => {
      const costs: ProductionCostItem[] = [
        { site: 'Site-A', year: 2025, month: 1, energyCost: 0, operationalCost: 0 },
      ]

      const result = createCostSummary(costs)

      expect(result).toHaveLength(1)
      expect(result[0].totalCost).toBe(0)
    })

    it('should handle missing cost values', () => {
      const costs = [
        { site: 'Site-A', year: 2025, month: 1, energyCost: undefined, operationalCost: 1000 },
      ] as unknown as ProductionCostItem[]

      const result = createCostSummary(costs)

      expect(result[0].totalCost).toBe(1000)
    })

    it('should return empty array for empty input', () => {
      const result = createCostSummary([])

      expect(result).toEqual([])
    })
  })

  describe('processProductionCosts', () => {
    const mockCosts: ProductionCostItem[] = [
      { site: 'Site-A', year: 2025, month: 1, energyCost: 14000, operationalCost: 22000 },
      { site: 'Site-A', year: 2025, month: 2, energyCost: 14500, operationalCost: 23000 },
      { site: 'Site-A', year: 2025, month: 3, energyCost: 15000, operationalCost: 24000 },
      { site: 'OtherSite', year: 2025, month: 1, energyCost: 5000, operationalCost: 10000 },
    ]

    it('should process costs for valid inputs', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-02-28')

      const result = processProductionCosts(mockCosts, 'Site-A', startDate, endDate)

      expect(result.totalEnergyCost).toBe(28500) // 14000 + 14500
      expect(result.totalOperationalCost).toBe(45000) // 22000 + 23000
      expect(result.costSummary).toHaveLength(2)
    })

    it('should return empty result for undefined costs', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-02-28')

      const result = processProductionCosts(undefined, 'Site-A', startDate, endDate)

      expect(result).toEqual({
        totalEnergyCost: 0,
        totalOperationalCost: 0,
        costSummary: [],
      })
    })

    it('should return empty result for empty costs array', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-02-28')

      const result = processProductionCosts([], 'Site-A', startDate, endDate)

      expect(result).toEqual({
        totalEnergyCost: 0,
        totalOperationalCost: 0,
        costSummary: [],
      })
    })

    it('should return empty result for undefined siteId', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-02-28')

      const result = processProductionCosts(mockCosts, undefined, startDate, endDate)

      expect(result).toEqual({
        totalEnergyCost: 0,
        totalOperationalCost: 0,
        costSummary: [],
      })
    })

    it('should return empty result when no costs match filters', () => {
      const startDate = new Date('2026-01-01')
      const endDate = new Date('2026-02-28')

      const result = processProductionCosts(mockCosts, 'Site-A', startDate, endDate)

      expect(result).toEqual({
        totalEnergyCost: 0,
        totalOperationalCost: 0,
        costSummary: [],
      })
    })

    it('should handle single month range', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')

      const result = processProductionCosts(mockCosts, 'Site-A', startDate, endDate)

      expect(result.totalEnergyCost).toBe(14000)
      expect(result.totalOperationalCost).toBe(22000)
      expect(result.costSummary).toHaveLength(1)
    })

    it('should be case-insensitive for site name', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')

      const result = processProductionCosts(mockCosts, 'SITE-A', startDate, endDate)

      expect(result.totalEnergyCost).toBe(14000)
      expect(result.costSummary).toHaveLength(1)
    })
  })

  describe('calculateCostMetrics', () => {
    it('should calculate cost metrics correctly', () => {
      const totalEnergyCost = 186000
      const totalOperationalCost = 294000
      const avgPowerConsumptionMW = 0.141301
      const hoursInPeriod = 744 // ~31 days

      const result = calculateCostMetrics(
        totalEnergyCost,
        totalOperationalCost,
        avgPowerConsumptionMW,
        hoursInPeriod,
      )

      // Expected: (186000 + 294000) / (0.141301 * 744)
      expect(result.allInCost).toBeCloseTo(4565.865, 2)
      // Expected: 186000 / (0.141301 * 744)
      expect(result.energyCost).toBeCloseTo(1769.273, 2)
      // Expected: 294000 / (0.141301 * 744)
      expect(result.operationsCost).toBeCloseTo(2796.592, 2)
    })

    it('should return zero for zero denominator (zero consumption)', () => {
      const result = calculateCostMetrics(1000, 2000, 0, 744)

      expect(result).toEqual({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })
    })

    it('should return zero for zero denominator (zero hours)', () => {
      const result = calculateCostMetrics(1000, 2000, 0.141, 0)

      expect(result).toEqual({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })
    })

    it('should return zero for negative denominator', () => {
      const result = calculateCostMetrics(1000, 2000, -0.141, 744)

      expect(result).toEqual({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })
    })

    it('should handle zero costs', () => {
      const result = calculateCostMetrics(0, 0, 0.141, 744)

      expect(result).toEqual({
        allInCost: 0,
        energyCost: 0,
        operationsCost: 0,
      })
    })

    it('should handle large numbers', () => {
      const result = calculateCostMetrics(1000000, 2000000, 100, 8760) // 1 year

      // Expected: 3000000 / (100 * 8760) = 3.42
      expect(result.allInCost).toBeCloseTo(3.42, 2)
    })
  })
})
