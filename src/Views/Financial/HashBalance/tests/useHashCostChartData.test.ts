import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { useHashCostChartData } from '../hooks/useHashCostChartData'

import {
  useGetExtDataQuery,
  useGetGlobalDataQuery,
  useGetSiteQuery,
  useGetTailLogRangeAggrQuery,
} from '@/app/services/api'

vi.mock('@/app/services/api', () => ({
  useGetSiteQuery: vi.fn(),
  useGetExtDataQuery: vi.fn(),
  useGetTailLogRangeAggrQuery: vi.fn(),
  useGetGlobalDataQuery: vi.fn(),
}))

vi.mock('../utils/hashCost.utils.ts', () => ({
  generateLogEntries: vi.fn(() => [{ ts: 1, hashCostUSD_PHS_d: 10, hashRevenueUSD_PHS_d: 20 }]),
  getCombinedHashpriceData: vi.fn(() => [{ date: '2025-01-01', cost: 10 }]),
}))

vi.mock('../utils/hashRevenueCost.utils', () => ({
  mergeDataSources: vi.fn(() => [{ ts: 1 }]),
  aggregateByPeriod: vi.fn(() => [{ ts: 1 }]),
  processTransactionData: vi.fn(() => [{ ts: 1 }]),
  processTailLogData: vi.fn(() => [{ ts: 1 }]),
  processHashPricesData: vi.fn(() => [{ ts: 1, hashprice: 100 }]),
  getLogSummary: vi.fn(() => ({
    avg: { hashCostUSD_PHS_d: 5, hashRevenueUSD_PHS_d: 6, hashprice: 7 },
  })),
}))

vi.mock('../utils/hashRevenueCostHelpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/hashRevenueCostHelpers')>()
  return {
    ...actual,
    getHashCostMetrics: vi.fn(({ avgHashCost, avgHashRevenue, avgNetworkHashprice }) => ({
      cost: avgHashCost,
      revenue: avgHashRevenue,
      network: avgNetworkHashprice,
    })),
    buildHistoricalBlockSizesParams: vi.fn(() => ({})),
  }
})

const mockedUseGetExtDataQuery = vi.mocked(useGetExtDataQuery) as unknown as Mock
const mockedUseGetTailLogRangeAggrQuery = vi.mocked(useGetTailLogRangeAggrQuery) as unknown as Mock
const mockedUseGetSiteQuery = vi.mocked(useGetSiteQuery) as unknown as Mock
const mockedUseGetGlobalDataQuery = vi.mocked(useGetGlobalDataQuery) as unknown as Mock

describe('useHashCostChartData', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedUseGetSiteQuery.mockReturnValue({ data: { site: 'SITE_1' } })

    mockedUseGetExtDataQuery.mockReturnValue({
      data: [{ entry: 1 }],
      isLoading: false,
    })

    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: [{ ts: 1 }],
      isLoading: false,
    })

    mockedUseGetGlobalDataQuery.mockReturnValue({
      data: [{ site: 'SITE_1', cost: 123 }],
      isLoading: false,
    })
  })

  it('should return empty data for week timeframe', () => {
    const { result } = renderHook(() =>
      useHashCostChartData({
        dateRange: { start: 1764748109619, end: 1764748109619, period: 'day' },
        timeFrameType: 'week',
      }),
    )

    expect(result.current.data).toEqual([])
    expect(result.current.metrics).toEqual({})
    expect(result.current.isLoading).toBe(false)
  })

  it('should return correct data + metrics for year timeframe', () => {
    const { result } = renderHook(() =>
      useHashCostChartData({
        dateRange: { start: 1764748109619, end: 1764748109619, period: 'day' },
        timeFrameType: 'year',
      }),
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toEqual([{ date: '2025-01-01', cost: 10 }])
    expect(result.current.metrics).toEqual({
      cost: 5,
      revenue: 6,
      network: 7,
    })
  })

  it('should reflect loading state from any of the queries', () => {
    mockedUseGetExtDataQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
    })

    const { result } = renderHook(() =>
      useHashCostChartData({
        dateRange: { start: 1764748109619, end: 1764748109619, period: 'day' },
        timeFrameType: 'year',
      }),
    )

    expect(result.current.isLoading).toBe(true)
  })
})
