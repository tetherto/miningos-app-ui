import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { getCombinedHashpriceData, getMetrics, useHashCostData } from '../useHashCostData'

vi.mock('@/app/services/api', () => ({
  useGetRevenueQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  useGetBtcDataHashPriceQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
}))
vi.mock('../useMultiSiteRTRequestParams', () => ({
  default: () => ({ buildRequestParams: (p: unknown) => p, isLoading: false }),
}))

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

    it('skips revenue items with invalid timestamps', () => {
      const revenueData = [{ ts: 'not-a-date', hashCostUSD_PHS_d: 100, hashRevenueUSD_PHS_d: 200 }]
      const result = getCombinedHashpriceData(revenueData, [])
      expect(result).toEqual([])
    })

    it('skips revenue items with null timestamp', () => {
      const revenueData = [{ ts: null, hashCostUSD_PHS_d: 100 }]
      const result = getCombinedHashpriceData(revenueData as never, [])
      expect(result).toEqual([])
    })

    it('uses fallback date from dateRange.start for hash price items with invalid timestamp', () => {
      // When both revenue ts and hashprice ts are invalid, falls back to dateRange.start + index
      // with valid start date, we get 1 entry
      const hashPriceData = [{ ts: 'invalid', hashprice: 300 }]
      const result = getCombinedHashpriceData([], hashPriceData, 'USD', {
        start: new Date('2024-01-15').getTime(),
      })
      expect(result).toHaveLength(1)
      expect(result[0].networkHashprice).toBe(300)
    })

    it('skips hash price items when no valid date can be derived (no dateRange.start)', () => {
      const hashPriceData = [{ ts: 'invalid', hashprice: 300 }]
      const result = getCombinedHashpriceData([], hashPriceData, 'USD', { start: 'invalid-date' })
      expect(result).toEqual([])
    })

    it('handles null cost/revenue values with ?? null fallback', () => {
      const revenueData = [
        { ts: '2024-01-15', hashCostUSD_PHS_d: null, hashRevenueUSD_PHS_d: null },
      ]
      const result = getCombinedHashpriceData(revenueData as never, [])
      expect(result).toHaveLength(1)
      expect(result[0].cost).toBeNull()
      expect(result[0].revenue).toBeNull()
    })
  })

  describe('useHashCostData', () => {
    const createWrapper =
      (siteId = 'site-1') =>
      ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/sites/${siteId}`]}>
          <Routes>
            <Route path="/sites/:siteId" element={children} />
          </Routes>
        </MemoryRouter>
      )

    it('returns isLoading, data, and metrics', () => {
      const { result } = renderHook(
        () => useHashCostData({ dateRange: { start: 0, end: Date.now(), period: 'daily' } }),
        { wrapper: createWrapper() },
      )
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('metrics')
    })

    it('skips queries when dateRange has no start or end', () => {
      const { result } = renderHook(() => useHashCostData({ dateRange: {} }), {
        wrapper: createWrapper(),
      })
      expect(result.current.isLoading).toBe(false)
    })
  })
})
