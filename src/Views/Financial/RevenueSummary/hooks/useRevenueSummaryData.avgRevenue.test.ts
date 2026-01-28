import { describe, expect, test } from 'vitest'

import type { DateRange } from '../RevenueSummary.types'

import { mockHistoricalPricesData, mockTailLogRangeAggrData, mockTransactionsData } from './mocks'
import { getStartOfDay } from './revenueSummaryHelpers'
import {
  calculateAvgRevenueMetrics,
  calculateDailyRevenueRatios,
  getNumberOfPeriods,
  processTailLogData,
  processTransactionData,
} from './useRevenueSummaryData'

import { PERIOD } from '@/constants/ranges'
import type {
  HashrateAggregateResponse,
  MinerHistoricalPriceResponse,
  MinerTransactionResponse,
} from '@/types'

describe('Avg Revenue Calculations - At Prod. Date Price', () => {
  describe('getNumberOfPeriods', () => {
    test('should return 7 for weekly period', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1756339200000,
        period: PERIOD.WEEKLY,
      }
      const result = getNumberOfPeriods(dateRange, PERIOD.WEEKLY)
      expect(result).toBe(7)
    })

    test('should return 12 for yearly period', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1787270400000,
        period: PERIOD.YEARLY,
      }
      const result = getNumberOfPeriods(dateRange, PERIOD.YEARLY)
      expect(result).toBe(12)
    })

    test('should return correct number of days for monthly period', () => {
      // January 2025 has 31 days
      const dateRange: DateRange = {
        start: new Date(2025, 0, 1).getTime(),
        end: new Date(2025, 0, 31).getTime(),
        period: PERIOD.MONTHLY,
      }
      const result = getNumberOfPeriods(dateRange, PERIOD.MONTHLY)
      expect(result).toBe(31)
    })

    test('should return correct number of days for February (non-leap year)', () => {
      // February 2025 has 28 days (not a leap year)
      const dateRange: DateRange = {
        start: new Date(2025, 1, 1).getTime(),
        end: new Date(2025, 1, 28).getTime(),
        period: PERIOD.MONTHLY,
      }
      const result = getNumberOfPeriods(dateRange, PERIOD.MONTHLY)
      expect(result).toBe(28)
    })

    test('should return 1 for daily period', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1755820800000,
        period: PERIOD.DAILY,
      }
      const result = getNumberOfPeriods(dateRange, PERIOD.DAILY)
      expect(result).toBe(1)
    })
  })

  describe('calculateDailyRevenueRatios', () => {
    test('should calculate daily ratios correctly', () => {
      const dayTs = getStartOfDay(1755734400000)

      const processedTransactionData = {
        [dayTs]: {
          ts: dayTs,
          totalRevenueBTC: 0.5,
          totalFeesBTC: 0.01,
        },
      }

      const processedTailLogData = {
        [dayTs]: {
          ts: dayTs,
          hashrateMHS: 50000000000000, // 50 PH/s
          sitePowerW: 10000000, // 10 MW
        },
      }

      const processedPrices = [
        {
          ts: dayTs,
          priceUSD: 50000,
        },
      ]

      const ratios = calculateDailyRevenueRatios(
        processedTransactionData,
        processedTailLogData,
        processedPrices,
      )

      expect(ratios).toHaveLength(1)
      expect(ratios[0].dayTs).toBe(dayTs)

      // revenueUSD = 0.5 * 50000 = 25000
      // energyRatio = revenueUSD / sitePowerMW = 25000 / 10 = 2500 $/MW
      expect(ratios[0].energyRatio).toBeCloseTo(2500, 10)

      // hashRatio = revenueUSD / hashratePHS
      // hashratePHS = hashrateMHS / 1e9 = 50000000000000 / 1e9 = 50000 PH/s
      // hashRatio = 25000 / 50000 = 0.5 $/PH/s
      expect(ratios[0].hashRatio).toBeCloseTo(0.5, 10)
    })

    test('should skip days without matching data', () => {
      const dayTs1 = getStartOfDay(1755734400000)
      const dayTs2 = getStartOfDay(1755820800000)

      const processedTransactionData = {
        [dayTs1]: {
          ts: dayTs1,
          totalRevenueBTC: 0.5,
          totalFeesBTC: 0.01,
        },
      }

      const processedTailLogData = {
        [dayTs2]: {
          ts: dayTs2,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
      }

      const processedPrices = [
        {
          ts: dayTs1,
          priceUSD: 50000,
        },
      ]

      const ratios = calculateDailyRevenueRatios(
        processedTransactionData,
        processedTailLogData,
        processedPrices,
      )

      // Should return empty array since dayTs1 has no tail log data
      expect(ratios).toHaveLength(0)
    })

    test('should skip days with zero price', () => {
      const dayTs = getStartOfDay(1755734400000)

      const processedTransactionData = {
        [dayTs]: {
          ts: dayTs,
          totalRevenueBTC: 0.5,
          totalFeesBTC: 0.01,
        },
      }

      const processedTailLogData = {
        [dayTs]: {
          ts: dayTs,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
      }

      const processedPrices = [
        {
          ts: dayTs,
          priceUSD: 0,
        },
      ]

      const ratios = calculateDailyRevenueRatios(
        processedTransactionData,
        processedTailLogData,
        processedPrices,
      )

      expect(ratios).toHaveLength(0)
    })

    test('should skip days with zero revenue', () => {
      const dayTs = getStartOfDay(1755734400000)

      const processedTransactionData = {
        [dayTs]: {
          ts: dayTs,
          totalRevenueBTC: 0,
          totalFeesBTC: 0,
        },
      }

      const processedTailLogData = {
        [dayTs]: {
          ts: dayTs,
          hashrateMHS: 50000000000000,
          sitePowerW: 10000000,
        },
      }

      const processedPrices = [
        {
          ts: dayTs,
          priceUSD: 50000,
        },
      ]

      const ratios = calculateDailyRevenueRatios(
        processedTransactionData,
        processedTailLogData,
        processedPrices,
      )

      expect(ratios).toHaveLength(0)
    })
  })

  describe('calculateAvgRevenueMetrics', () => {
    test('should calculate average energy revenue correctly for weekly period', () => {
      const dayTs1 = getStartOfDay(1755734400000)
      const dayTs2 = getStartOfDay(1755820800000)

      const dailyRatios = [
        {
          dayTs: dayTs1,
          energyRatio: 0.0025, // $/W
          hashRatio: 5e-10, // $/MH/s
        },
        {
          dayTs: dayTs2,
          energyRatio: 0.003, // $/W
          hashRatio: 6e-10, // $/MH/s
        },
      ]

      const dateRange: DateRange = {
        start: dayTs1,
        end: dayTs2,
        period: PERIOD.WEEKLY,
      }

      const avgBTCPriceUSD = 50000 // Test BTC price
      const result = calculateAvgRevenueMetrics(
        dailyRatios,
        dateRange,
        PERIOD.WEEKLY,
        avgBTCPriceUSD,
      )

      // Average energyRatio = (0.0025 + 0.003) / 7 = 0.0007857...
      // Convert to $/MWh: 0.0007857 * 1e6 / 24 = 32.74...
      const expectedEnergy = (((0.0025 + 0.003) / 7) * 1e6) / 24
      expect(result.avgEnergyRevenue).toBeCloseTo(expectedEnergy, 2)

      // Average hashRatio = (5e-10 + 6e-10) / 7 = 1.571e-10
      // Convert to $/PH/s/day: (1.571e-10 / 1e9) * 86400 = 0.01357...
      const expectedHash = ((5e-10 + 6e-10) / 7 / 1e9) * 86400
      expect(result.avgHashRevenue).toBeCloseTo(expectedHash, 5)

      // Verify Sats conversions
      const expectedEnergySats = (expectedEnergy / avgBTCPriceUSD) * 100000000
      expect(result.avgEnergyRevenueSats).toBeCloseTo(expectedEnergySats, 0)

      const expectedHashSats = (expectedHash / avgBTCPriceUSD) * 100000000
      expect(result.avgHashRevenueSats).toBeCloseTo(expectedHashSats, 0)
    })

    test('should calculate average revenue correctly for monthly period', () => {
      const dayTs1 = getStartOfDay(new Date(2025, 0, 1).getTime())
      const dayTs2 = getStartOfDay(new Date(2025, 0, 2).getTime())

      const dailyRatios = [
        {
          dayTs: dayTs1,
          energyRatio: 0.0025,
          hashRatio: 5e-10,
        },
        {
          dayTs: dayTs2,
          energyRatio: 0.003,
          hashRatio: 6e-10,
        },
      ]

      const dateRange: DateRange = {
        start: dayTs1,
        end: new Date(2025, 0, 31).getTime(),
        period: PERIOD.MONTHLY,
      }

      const avgBTCPriceUSD = 50000 // Test BTC price
      const result = calculateAvgRevenueMetrics(
        dailyRatios,
        dateRange,
        PERIOD.MONTHLY,
        avgBTCPriceUSD,
      )

      // January has 31 days
      // Average energyRatio = (0.0025 + 0.003) / 31 = 0.0001774...
      const expectedEnergy = (((0.0025 + 0.003) / 31) * 1e6) / 24
      expect(result.avgEnergyRevenue).toBeCloseTo(expectedEnergy, 2)

      const expectedHash = ((5e-10 + 6e-10) / 31 / 1e9) * 86400
      expect(result.avgHashRevenue).toBeCloseTo(expectedHash, 5)

      // Verify Sats conversions
      const expectedEnergySats = (expectedEnergy / avgBTCPriceUSD) * 100000000
      expect(result.avgEnergyRevenueSats).toBeCloseTo(expectedEnergySats, 0)

      const expectedHashSats = (expectedHash / avgBTCPriceUSD) * 100000000
      expect(result.avgHashRevenueSats).toBeCloseTo(expectedHashSats, 0)
    })

    test('should return zero for empty ratios', () => {
      const dateRange: DateRange = {
        start: 1755734400000,
        end: 1755820800000,
        period: PERIOD.WEEKLY,
      }

      const avgBTCPriceUSD = 50000 // Test BTC price
      const result = calculateAvgRevenueMetrics([], dateRange, PERIOD.WEEKLY, avgBTCPriceUSD)

      expect(result.avgEnergyRevenue).toBe(0)
      expect(result.avgHashRevenue).toBe(0)
      expect(result.avgEnergyRevenueSats).toBe(0)
      expect(result.avgHashRevenueSats).toBe(0)
    })
  })

  describe('Integration test with mock data', () => {
    test('should calculate avgEnergyRevenueAtProdDate and avgHashRevenueAtProdDate', () => {
      // Process mock data
      const processedTransactionData = processTransactionData(
        mockTransactionsData as MinerTransactionResponse,
      )
      const processedTailLogData = processTailLogData(
        mockTailLogRangeAggrData as HashrateAggregateResponse,
      )

      // Process prices - need to convert mock format
      const pricesArray = mockHistoricalPricesData.data?.[0] || []
      const processedPrices = pricesArray.map((p: { ts: number; priceUSD: number }) => ({
        ts: getStartOfDay(p.ts),
        priceUSD: p.priceUSD,
      }))

      // Calculate daily ratios
      const dailyRatios = calculateDailyRevenueRatios(
        processedTransactionData,
        processedTailLogData,
        processedPrices,
      )

      expect(dailyRatios.length).toBeGreaterThan(0)

      // Create a date range for the current month
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const firstDay = new Date(currentYear, currentMonth, 1).getTime()
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getTime()

      const dateRange: DateRange = {
        start: firstDay,
        end: lastDay,
        period: PERIOD.MONTHLY,
      }

      // Calculate average BTC price from processed prices
      const avgBTCPriceUSD =
        processedPrices.length > 0
          ? processedPrices.reduce((sum, p) => sum + p.priceUSD, 0) / processedPrices.length
          : 50000

      // Calculate averages
      const result = calculateAvgRevenueMetrics(
        dailyRatios,
        dateRange,
        PERIOD.MONTHLY,
        avgBTCPriceUSD,
      )

      // Verify results are positive numbers
      expect(result.avgEnergyRevenue).toBeGreaterThan(0)
      expect(result.avgHashRevenue).toBeGreaterThan(0)
      expect(result.avgEnergyRevenueSats).toBeGreaterThan(0)
      expect(result.avgHashRevenueSats).toBeGreaterThan(0)

      // Verify units are reasonable
      // Energy should be in $/MWh (typically ranges from tens to hundreds)
      expect(result.avgEnergyRevenue).toBeLessThan(10000) // Sanity check

      // Hash should be in $/PH/s/day (typically ranges from 0.01 to 100)
      expect(result.avgHashRevenue).toBeLessThan(1000) // Sanity check

      // Verify Sats conversions are reasonable
      // Sats values should be proportional to USD values
      const expectedEnergySats = (result.avgEnergyRevenue / avgBTCPriceUSD) * 100000000
      expect(result.avgEnergyRevenueSats).toBeCloseTo(expectedEnergySats, 0)

      const expectedHashSats = (result.avgHashRevenue / avgBTCPriceUSD) * 100000000
      expect(result.avgHashRevenueSats).toBeCloseTo(expectedHashSats, 0)
    })
  })
})
