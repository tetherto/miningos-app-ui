import { describe, expect, test } from 'vitest'

import { COLOR } from '@/constants/colors'
import { PERIOD } from '@/constants/ranges'
import { createSubsidyFeesData } from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'
import type { RevenueData } from '@/types'

describe('Subsidy Fees Chart Dataset', () => {
  describe('createSubsidyFeesData', () => {
    test('should create subsidy and fees data from single region with single entry', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000, // Jan 20, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.05,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: {
            value: 0.45, // 0.5 - 0.05
            color: COLOR.INDIGO,
          },
          Fees: {
            value: 0.05,
            color: COLOR.POOL,
          },
        },
      })
    })

    test('should aggregate subsidy and fees across multiple entries in single region', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000, // Jan 20, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.0625, // 1/16 - exact in binary
              },
              {
                ts: 1755820800000, // Jan 21, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.75, // 3/4 - exact in binary
                totalFeesBTC: 0.125, // 1/8 - exact in binary
              },
              {
                ts: 1755907200000, // Jan 22, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.25, // 1/4 - exact in binary
                totalFeesBTC: 0.0625, // 1/16 - exact in binary
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(1.25) // (0.5-0.0625) + (0.75-0.125) + (0.25-0.0625) = 0.4375 + 0.625 + 0.1875
      expect(result.dataset.Fees.value).toBe(0.25) // 0.0625 + 0.125 + 0.0625
    })

    test('should aggregate subsidy and fees across multiple regions', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE1',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.0625, // 1/16 - exact in binary
              },
            ],
          },
          {
            region: 'SITE2',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.25, // 1/4 - exact in binary
                totalFeesBTC: 0.0625, // 1/16 - exact in binary
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0.625) // (0.5-0.0625) + (0.25-0.0625) = 0.4375 + 0.1875
      expect(result.dataset.Fees.value).toBe(0.125) // 0.0625 + 0.0625
    })

    test('should handle entries with zero fees', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0.5) // 0.5 - 0
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle entries with zero revenue', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0,
                totalFeesBTC: 0,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0)
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle entries where fees exceed revenue (negative subsidy)', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.3,
                totalFeesBTC: 0.5, // Fees exceed revenue
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      // Subsidy should be 0.3 - 0.5 = -0.2, but the function calculates it as is
      // Note: The function doesn't clamp negative values, so subsidy can be negative
      expect(result.dataset.Subsidy.value).toBe(-0.2) // 0.3 - 0.5
      expect(result.dataset.Fees.value).toBe(0.5)
    })

    test('should handle missing totalFeesBTC field (defaults to 0)', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                // totalFeesBTC is missing
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0.5) // 0.5 - 0
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle missing totalRevenueBTC field (defaults to 0)', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalFeesBTC: 0.05,
                // totalRevenueBTC is missing
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(-0.05) // 0 - 0.05
      expect(result.dataset.Fees.value).toBe(0.05)
    })

    test('should handle empty log array', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0)
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle missing log property', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            // log is missing
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0)
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle empty regions array', () => {
      const revenueData: RevenueData = {
        regions: [],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0)
      expect(result.dataset.Fees.value).toBe(0)
    })

    test('should handle missing regions property', () => {
      const revenueData = {} as RevenueData

      const result = createSubsidyFeesData(revenueData)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: {
            value: 0,
            color: COLOR.INDIGO,
          },
          Fees: {
            value: 0,
            color: COLOR.POOL,
          },
        },
      })
    })

    test('should handle null/undefined revenueData', () => {
      const result1 = createSubsidyFeesData(null as unknown as RevenueData)
      const result2 = createSubsidyFeesData(undefined as unknown as RevenueData)

      expect(result1.dataset.Subsidy.value).toBe(0)
      expect(result1.dataset.Fees.value).toBe(0)
      expect(result2.dataset.Subsidy.value).toBe(0)
      expect(result2.dataset.Fees.value).toBe(0)
    })

    test('should work with monthly period data', () => {
      const janStart = new Date(2025, 0, 1).getTime() // Jan 1, 2025
      const febStart = new Date(2025, 1, 1).getTime() // Feb 1, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: janStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.5, // 1 + 0.5 - exact in binary
                totalFeesBTC: 0.125, // 1/8 - exact in binary
              },
              {
                ts: febStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 2.0,
                totalFeesBTC: 0.25, // 1/4 - exact in binary
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(3.125) // (1.5-0.125) + (2.0-0.25) = 1.375 + 1.75
      expect(result.dataset.Fees.value).toBe(0.375) // 0.125 + 0.25
    })

    test('should work with yearly period data (aggregated by monthly)', () => {
      const janStart = new Date(2025, 0, 1).getTime()
      const febStart = new Date(2025, 1, 1).getTime()
      const marStart = new Date(2025, 2, 1).getTime()
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: janStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.5, // 1 + 0.5 - exact in binary
                totalFeesBTC: 0.125, // 1/8 - exact in binary
              },
              {
                ts: febStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 2.0,
                totalFeesBTC: 0.25, // 1/4 - exact in binary
              },
              {
                ts: marStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.75, // 1 + 0.75 - exact in binary
                totalFeesBTC: 0.125, // 1/8 - exact in binary
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(4.75) // (1.5-0.125) + (2.0-0.25) + (1.75-0.125) = 1.375 + 1.75 + 1.625
      expect(result.dataset.Fees.value).toBe(0.5) // 0.125 + 0.25 + 0.125
    })

    test('should maintain correct color values', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.05,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.color).toBe(COLOR.INDIGO)
      expect(result.dataset.Fees.color).toBe(COLOR.POOL)
    })

    test('should maintain correct unit and label structure', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.05,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.unit).toBe('BTC')
      expect(result.label).toBe(null)
      expect(result.value).toBe(null)
      expect(result.dataset).toHaveProperty('Subsidy')
      expect(result.dataset).toHaveProperty('Fees')
    })

    test('should handle large values correctly', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 100.5,
                totalFeesBTC: 10.05,
              },
              {
                ts: 1755820800000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 200.7,
                totalFeesBTC: 20.07,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(271.08) // (100.5-10.05) + (200.7-20.07) = 90.45 + 180.63
      expect(result.dataset.Fees.value).toBe(30.12) // 10.05 + 20.07
    })

    test('should handle very small values correctly', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.0001,
                totalFeesBTC: 0.00001,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(0.00009) // 0.0001 - 0.00001
      expect(result.dataset.Fees.value).toBe(0.00001)
    })

    test('should handle mixed periods in same dataset', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
                totalFeesBTC: 0.05,
              },
              {
                ts: new Date(2025, 0, 1).getTime(),
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.5,
                totalFeesBTC: 0.15,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(revenueData)

      expect(result.dataset.Subsidy.value).toBe(1.8) // (0.5-0.05) + (1.5-0.15) = 0.45 + 1.35
      expect(result.dataset.Fees.value).toBe(0.2) // 0.05 + 0.15
    })
  })
})
