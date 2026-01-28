import { describe, expect, it } from 'vitest'

import { getCombinedHashpriceData, getMetrics } from '../useHashCostData'

describe('useHashCostData', () => {
  describe('getMetrics', () => {
    it('should return metrics with correct values and units', () => {
      const currency = 'USD'
      const avgHashCost = 0.1
      const avgHashRevenue = 0.2
      const avgNetworkHashprice = 0.3

      const metrics = getMetrics({
        currency,
        avgHashCost,
        avgHashRevenue,
        avgNetworkHashprice,
      })

      expect(metrics).toEqual({
        avgHashCost: {
          label: 'Avg Hash Cost',
          unit: `${currency}/PH/s/day`,
          value: avgHashCost,
          isHighlighted: true,
        },
        avgHashRevenue: {
          label: 'Avg Hash Revenue',
          unit: `${currency}/PH/s/day`,
          value: avgHashRevenue,
        },
        avgNetworkHashprice: {
          label: 'Avg Network Hashprice',
          unit: '$/PH/s/day',
          value: avgNetworkHashprice,
        },
      })
    })
  })

  describe('getCombinedHashpriceData', () => {
    it('should combine revenue and hash price data correctly', () => {
      const revenueData = [
        { ts: '2023-10-01', hashCostUSD_PHS_d: 100, hashRevenueUSD_PHS_d: 200 },
        { ts: '2023-10-02', hashCostUSD_PHS_d: 150, hashRevenueUSD_PHS_d: 250 },
      ]
      const hashPriceData = [
        { ts: '2023-10-01', hashprice: 300 },
        { ts: '2023-10-02', hashprice: 350 },
      ]

      const combinedData = getCombinedHashpriceData(
        revenueData as Array<{
          ts: string
          hashCostUSD_PHS_d: number
          hashRevenueUSD_PHS_d: number
        }>,
        hashPriceData as Array<{ ts: string; hashprice: number }>,
        'USD',
      )

      expect(combinedData).toEqual([
        {
          date: '2023-10-01',
          cost: 100,
          revenue: 200,
          networkHashprice: 300,
        },
        {
          date: '2023-10-02',
          cost: 150,
          revenue: 250,
          networkHashprice: 350,
        },
      ])
    })

    it('should handle empty data arrays', () => {
      const combinedData = getCombinedHashpriceData([], [])
      expect(combinedData).toEqual([])
    })
  })
})
