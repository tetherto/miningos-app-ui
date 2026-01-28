import { describe, expect, it } from 'vitest'

import type { BitcoinHashPricesData, SiteFinancialMetrics } from '../types/HashBalance.types'
import { generateLogEntries, getCombinedHashpriceData } from '../utils/hashCost.utils'

import { PERIOD } from '@/constants/ranges'
import type { ProductionCostData } from '@/types'

describe('HashRevenueCost Utils → generateLogEntries', () => {
  it('generates correct log entries based on merged & aggregated data', () => {
    const period = PERIOD.DAILY

    const data = {
      1700000000000: {
        totalRevenueBTC: 0.01,
        totalFeesBTC: 0.001,
        sitePowerW: 500000, // 500 kW
        hashrateMHS: 300000000, // 300M MH/s → 0.3 PH/s
      },
      1700000001000: {
        totalRevenueBTC: 0.02,
        totalFeesBTC: 0.002,
        sitePowerW: 600000,
        hashrateMHS: 400000000,
      },
    }

    const btcPricesData = [
      { ts: 1700000000000, priceUSD: 30000 },
      { ts: 1700000001000, priceUSD: 31000 },
    ]

    const costsData = [
      {
        month: 12,
        year: 2023,
        energyCost: 100,
        operationalCost: 100,
      },
      {
        month: 11,
        year: 2023,
        energyCost: 100,
        operationalCost: 100,
      },
      {
        month: 10,
        year: 2023,
        energyCost: 100,
        operationalCost: 100,
      },
      {
        month: 9,
        year: 2023,
        energyCost: 100,
        operationalCost: 100,
      },
    ] as ProductionCostData[]

    const result = generateLogEntries({
      data,
      period,
      btcPricesData,
      costsData,
      timeFrameType: 'week',
    })

    expect(result.length).toBe(2)

    const entry1 = result[0]
    const entry2 = result[1]

    expect(entry1.ts).toBe(1700000000000)
    expect(entry1.totalRevenueBTC).toBe(0.01)
    expect(entry1.totalFeesBTC).toBe(0.001)
    expect(entry1.hashrateMHS).toBe(300000000)
    expect(entry1.sitePowerW).toBe(500000)
    expect(entry1.blockSize).toBe(undefined) // blockSize not returned directly, used internally

    // USD revenue should match BTC * price
    expect(entry1.revenueUSD).toBeCloseTo(0.01 * 30000)

    expect(entry2.ts).toBe(1700000001000)
    expect(entry2.totalRevenueBTC).toBe(0.02)
    expect(entry2.totalFeesBTC).toBe(0.002)
    expect(entry2.hashrateMHS).toBe(400000000)

    // USD revenue should match BTC * price
    expect(entry2.revenueUSD).toBeCloseTo(0.02 * 31000)

    // Should include costs
    expect(entry2.totalCostsUSD).toBe(0)
  })

  describe('getCombinedHashpriceData', () => {
    it('should return combined hashprice + revenue data with closest timestamp match', () => {
      const revenueData = [
        {
          ts: '2025-01-01T00:00:00Z',
          hashCostUSD_PHS_d: 10,
          hashRevenueUSD_PHS_d: 20,
        },
        {
          ts: '2025-01-02T00:00:00Z',
          hashCostUSD_PHS_d: 11,
          hashRevenueUSD_PHS_d: 21,
        },
      ] as unknown as SiteFinancialMetrics[]

      const hashPriceData = [
        { ts: '2025-01-01T00:00:05Z', hashprice: 100 },
        { ts: '2025-01-02T00:00:30Z', hashprice: 200 },
      ] as unknown as BitcoinHashPricesData[]

      const result = getCombinedHashpriceData(revenueData, hashPriceData)

      expect(result).toEqual([
        {
          date: '2025-01-01',
          cost: 10,
          revenue: 20,
          networkHashprice: 100,
        },
        {
          date: '2025-01-02',
          cost: 11,
          revenue: 21,
          networkHashprice: 200,
        },
      ])
    })

    it('should return null for networkHashprice if no matching hashprice data exists', () => {
      const revenueData = [
        {
          ts: '2025-01-01T00:00:00Z',
          hashCostUSD_PHS_d: 10,
          hashRevenueUSD_PHS_d: 20,
        },
      ] as unknown as SiteFinancialMetrics[]

      const hashPriceData = [] as unknown as BitcoinHashPricesData[]

      const result = getCombinedHashpriceData(revenueData, hashPriceData)

      expect(result).toEqual([
        {
          date: '2025-01-01',
          cost: 10,
          revenue: 20,
          networkHashprice: null,
        },
      ])
    })

    it('should return empty array if revenueData is empty', () => {
      const hashPriceData = [
        { ts: '2025-01-01', hashprice: 100 },
      ] as unknown as BitcoinHashPricesData[]
      const result = getCombinedHashpriceData([], hashPriceData)

      expect(result).toEqual([])
    })
  })
})
