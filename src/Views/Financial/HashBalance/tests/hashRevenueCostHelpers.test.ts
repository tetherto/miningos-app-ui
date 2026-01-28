import { describe, expect, it } from 'vitest'

import { getStartOfDay } from '../../common/financial.helpers'
import { HashrateData, RevenueRecord } from '../types/HashBalance.types'
import {
  aggregateByPeriod,
  buildHistoricalBlockSizesParams,
  buildHistoricalHashRateParams,
  getDefaultRange,
  getHashCostMetrics,
  getHashRevenueMetrics,
  getPeriodEndDate,
  getPeriodKey,
  getPeriodPrice,
  mergeDataSources,
  safeDiv,
  tsToMonthYear,
} from '../utils/hashRevenueCostHelpers'

import { getBeginningOfMonth, getEndOfYesterday } from '@/app/utils/dateUtils'
import { PERIOD, TIMEFRAME_TYPE } from '@/constants/ranges'
import { CURRENCY, UNITS } from '@/constants/units'
import { rangeOfYear } from '@/MultiSiteViews/SharedComponents/Header/helper'

vi.mock('@/app/utils/dateUtils', () => ({
  getBeginningOfMonth: vi.fn(),
  getEndOfYesterday: vi.fn(),
}))

vi.mock('@/MultiSiteViews/SharedComponents/Header/helper', () => ({
  rangeOfYear: vi.fn(),
}))

describe('hashRevenueCostHelpers', () => {
  describe('safeDiv', () => {
    it('divides numbers when valid', () => {
      expect(safeDiv(10, 2)).toBe(5)
    })

    it('returns null for invalid inputs', () => {
      expect(safeDiv(10, 0)).toBe(null)
      expect(safeDiv(null, 2)).toBe(null)
      expect(safeDiv(10, undefined)).toBe(null)
    })
  })

  describe('parameter builders', () => {
    const range = { start: 1000, end: 2000 }

    it('buildHistoricalHashRateParams', () => {
      expect(buildHistoricalHashRateParams(range)).toEqual({
        type: 'mempool',
        query: JSON.stringify({ key: 'HISTORICAL_HASHRATE', start: 1000, end: 2000 }),
      })
    })

    it('buildHistoricalBlockSizesParams', () => {
      expect(buildHistoricalBlockSizesParams(range)).toEqual({
        type: 'mempool',
        query: JSON.stringify({ key: 'HISTORICAL_BLOCKSIZES', start: 1000, end: 2000 }),
      })
    })
  })

  describe('metrics builders', () => {
    it('getHashCostMetrics returns proper structure', () => {
      const result = getHashCostMetrics({
        avgHashCost: 10,
        avgHashRevenue: 20,
        avgNetworkHashprice: 30,
      })

      expect(result.avgHashCost.unit).toBe(`${CURRENCY.USD}/${UNITS.HASHRATE_PH_S}/day`)
      expect(result.avgHashCost.value).toBe(10)
      expect(result.avgHashCost.isHighlighted).toBe(true)
    })

    it('getHashRevenueMetrics returns proper structure', () => {
      const result = getHashRevenueMetrics({
        currency: 'USD',
        avgHashRevenue: 50,
        avgNetworkHashprice: 5,
      })

      expect(result.avgHashRevenue.value).toBe(50)
      expect(result.avgNetworkHashprice.unit).toBe('USD/PH/s/day')
      expect(result.avgNetworkHashprice.value).toBe(5)
    })
  })

  describe('tsToMonthYear', () => {
    it('returns correct month and year', () => {
      const ts = new Date('2024-08-15').getTime().toString()
      expect(tsToMonthYear(ts)).toEqual({ month: 8, year: 2024 })
    })
  })

  describe('getPeriodKey', () => {
    const ts = new Date('2024-08-15').getTime()

    it('daily returns start of day', () => {
      expect(getPeriodKey(ts, PERIOD.DAILY)).toBe(getStartOfDay(ts))
    })

    it('monthly returns 1st of month', () => {
      const expected = new Date(2024, 7, 1).getTime()
      expect(getPeriodKey(ts, PERIOD.MONTHLY)).toBe(expected)
    })

    it('yearly returns 1st of year', () => {
      const expected = new Date(2024, 0, 1).getTime()
      expect(getPeriodKey(ts, PERIOD.YEARLY)).toBe(expected)
    })
  })

  describe('getPeriodEndDate', () => {
    it('returns next month for MONTHLY', () => {
      const ts = new Date('2024-05-01').getTime()
      const res = getPeriodEndDate(ts, PERIOD.MONTHLY)
      expect(res.getMonth()).toBe(5)
    })

    it('returns next year for YEARLY', () => {
      const ts = new Date('2024-01-01').getTime()
      const res = getPeriodEndDate(ts, PERIOD.YEARLY)
      expect(res.getFullYear()).toBe(2025)
    })

    it('returns same date for DAILY', () => {
      const ts = new Date('2024-01-01').getTime()
      const res = getPeriodEndDate(ts, PERIOD.DAILY)
      expect(res.getTime()).toBe(ts)
    })
  })

  describe('getDefaultRange', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return DAILY period for MONTH timeframe', () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-30')

      vi.mocked(getBeginningOfMonth).mockReturnValue(startDate)
      vi.mocked(getEndOfYesterday).mockReturnValue(endDate)

      const result = getDefaultRange(TIMEFRAME_TYPE.MONTH)

      expect(result).toEqual({
        period: PERIOD.DAILY,
        start: startDate.getTime(),
        end: endDate.getTime(),
      })
    })

    it('should return DAILY period for WEEK timeframe', () => {
      const startDate = new Date('2025-02-01')
      const endDate = new Date('2025-02-10')

      vi.mocked(getBeginningOfMonth).mockReturnValue(startDate)
      vi.mocked(getEndOfYesterday).mockReturnValue(endDate)

      const result = getDefaultRange(TIMEFRAME_TYPE.WEEK)

      expect(result.period).toBe(PERIOD.DAILY)
      expect(result.start).toBe(startDate.getTime())
      expect(result.end).toBe(endDate.getTime())
    })

    it('should return MONTHLY period for YEAR or null timeframe', () => {
      const yearStart = new Date('2025-01-01')
      const yearEnd = new Date('2025-12-31')

      vi.mocked(rangeOfYear).mockReturnValue([yearStart, yearEnd])

      const result = getDefaultRange(null)

      expect(result).toEqual({
        period: PERIOD.MONTHLY,
        start: yearStart.getTime(),
        end: yearEnd.getTime(),
      })
    })
  })

  describe('mergeDataSources', () => {
    it('should merge tail log and transaction data by union of keys', () => {
      const tailLogData = {
        '1000': { sitePowerW: 10, hashrateMHS: 20 },
        '2000': { sitePowerW: 30, hashrateMHS: 40 },
      } as unknown as HashrateData

      const transactionData = {
        '2000': { totalRevenueBTC: 1, totalFeesBTC: 0.1 },
        '3000': { totalRevenueBTC: 2, totalFeesBTC: 0.2 },
      } as unknown as RevenueRecord

      const result = mergeDataSources(tailLogData, transactionData)

      expect(result).toEqual({
        '1000': {
          '1000': {
            sitePowerW: 10,
            hashrateMHS: 20,
            totalRevenueBTC: 0,
            totalFeesBTC: 0,
          },
        },
        '2000': {
          '2000': {
            sitePowerW: 30,
            hashrateMHS: 40,
            totalRevenueBTC: 1,
            totalFeesBTC: 0.1,
          },
        },
        '3000': {
          '3000': {
            sitePowerW: 0,
            hashrateMHS: 0,
            totalRevenueBTC: 2,
            totalFeesBTC: 0.2,
          },
        },
      })
    })
  })

  describe('aggregateByPeriod', () => {
    const inputData = {
      '1000': {
        '1000': {
          totalRevenueBTC: 1,
          totalFeesBTC: 0.1,
          sitePowerW: 10,
          hashrateMHS: 20,
        },
      },
      '2000': {
        '2000': {
          totalRevenueBTC: 3,
          totalFeesBTC: 0.3,
          sitePowerW: 30,
          hashrateMHS: 40,
        },
      },
    }

    it('should return daily data without aggregation', () => {
      const result = aggregateByPeriod(inputData, PERIOD.DAILY)

      expect(result).toEqual({
        '1000': {
          totalRevenueBTC: 1,
          totalFeesBTC: 0.1,
          sitePowerW: 10,
          hashrateMHS: 20,
        },
        '2000': {
          totalRevenueBTC: 3,
          totalFeesBTC: 0.3,
          sitePowerW: 30,
          hashrateMHS: 40,
        },
      })
    })

    it('should aggregate values and average power/hashrate for non-daily period', () => {
      const result = aggregateByPeriod(inputData, PERIOD.MONTHLY)

      expect(result).toEqual({
        '0': {
          totalRevenueBTC: 4,
          totalFeesBTC: 0.4,
          sitePowerW: 20, // (10 + 30) / 2
          hashrateMHS: 30, // (20 + 40) / 2
        },
      })
    })
  })

  describe('getPeriodPrice', () => {
    const prices = [
      { ts: 1000, priceUSD: 30000 },
      { ts: 2000, priceUSD: 32000 },
      { ts: 3000, priceUSD: 34000 },
    ]

    it('should return exact price for DAILY period', () => {
      const result = getPeriodPrice(prices, 2000, PERIOD.DAILY)
      expect(result).toBe(32000)
    })

    it('should return average price for non-daily period', () => {
      const result = getPeriodPrice(prices, 0, PERIOD.MONTHLY)

      expect(result).toBe((30000 + 32000 + 34000) / 3)
    })

    it('should fallback to exact timestamp price when no values found', () => {
      const result = getPeriodPrice(prices, 2000, PERIOD.MONTHLY)

      expect(result).toBe(33000)
    })

    it('should return 0 when no price found', () => {
      const result = getPeriodPrice([], 9999, PERIOD.DAILY)
      expect(result).toBe(0)
    })
  })
})
