import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { useHashRevenueChartData } from '../hooks/useHashRevenueChartData'
import {
  getLogSummary,
  proceedSiteHashRevenueData,
  processHashPricesData,
  processTailLogData,
} from '../utils/hashRevenueCost.utils'
import { getHashRevenueMetrics } from '../utils/hashRevenueCostHelpers'

import { useGetExtDataQuery, useGetTailLogRangeAggrQuery } from '@/app/services/api'

vi.mock('@/app/services/api', () => ({
  useGetExtDataQuery: vi.fn(),
  useGetTailLogRangeAggrQuery: vi.fn(),
}))

vi.mock('../utils/hashRevenueCost.utils.ts', async () => {
  const actual = await vi.importActual('../utils/hashRevenueCost.utils.ts')
  return {
    ...actual,
    processTailLogData: vi.fn(),
    proceedSiteHashRevenueData: vi.fn(),
    processHashPricesData: vi.fn(),
    getLogSummary: vi.fn(),
    getMetrics: vi.fn(),
  }
})

vi.mock('../utils/hashRevenueCostHelpers.ts', async () => {
  const actual = await vi.importActual('../utils/hashRevenueCostHelpers.ts')
  return {
    ...actual,
    getHashRevenueMetrics: vi.fn(),
  }
})

const mockedUseGetExtDataQuery = vi.mocked(useGetExtDataQuery) as unknown as Mock
const mockedUseGetTailLogRangeAggrQuery = vi.mocked(useGetTailLogRangeAggrQuery) as unknown as Mock
const mockedProceedSiteHashRevenueData = vi.mocked(proceedSiteHashRevenueData) as unknown as Mock
const mockedProcessHashPricesData = vi.mocked(processHashPricesData) as unknown as Mock
const mockedGetMetrics = vi.mocked(getHashRevenueMetrics) as unknown as Mock
const mockedGetLogSummary = vi.mocked(getLogSummary) as unknown as Mock
const mockedProcessTailLogData = processTailLogData as unknown as Mock

describe('useHashRevenueChartData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const dateRange = { start: 1000, end: 2000 }
  const currency = 'USD'

  it('returns correct transformed data', () => {
    mockedUseGetExtDataQuery
      .mockReturnValueOnce({ data: [['tx']], isLoading: false })
      .mockReturnValueOnce({ data: [['prices']], isLoading: false })
      .mockReturnValueOnce({ data: [['hashrate']], isLoading: false })
      .mockReturnValueOnce({ data: [['blocks']], isLoading: false })

    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: [['tail']],
      isLoading: false,
    })

    mockedProcessTailLogData.mockReturnValue({ 1000: { hashrateMHS: 1e9 } })

    mockedProceedSiteHashRevenueData.mockReturnValue([{ ts: 1000, hashRevenueUSD_PHS_d: 10 }])

    mockedProcessHashPricesData.mockReturnValue([{ ts: 1000, hashprice: 20, priceUSD: 200 }])

    mockedGetLogSummary
      .mockReturnValueOnce({ avg: { hashRevenueUSD_PHS_d: 10 } })
      .mockReturnValueOnce({ avg: { hashprice: 20, priceUSD: 200 } })

    mockedGetMetrics.mockReturnValue({
      avgHashRevenue: { value: 10 },
      avgNetworkHashprice: { value: 20 },
    })

    const { result } = renderHook(() =>
      useHashRevenueChartData({
        dateRange: { ...dateRange, period: 'day' },
        currency,
      }),
    )

    expect(result.current.hashRevueData).toEqual([{ ts: 1000, hashRevenueUSD_PHS_d: 10 }])

    expect(result.current.historicalHashPriceData).toEqual([
      { ts: 1000, hashprice: 20, priceUSD: 200 },
    ])

    expect(result.current.metrics.avgHashRevenue.value).toBe(10)
    expect(result.current.metrics.avgNetworkHashprice.value).toBe(20)
  })

  it('sets loading flags correctly', () => {
    mockedUseGetExtDataQuery.mockReturnValue({
      data: null,
      isLoading: true,
    })

    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: null,
      isLoading: true,
    })

    const { result } = renderHook(() =>
      useHashRevenueChartData({
        dateRange: { ...dateRange, period: 'day' },
        currency,
      }),
    )

    expect(result.current.isHashRevenueLoading).toBe(true)
    expect(result.current.isHistoricalPriceLoading).toBe(true)
  })

  it('passes correct params to RTK Query hooks', () => {
    mockedUseGetExtDataQuery.mockReturnValue({ data: [], isLoading: false })
    mockedUseGetExtDataQuery.mockReturnValue({ data: [], isLoading: false })
    mockedUseGetExtDataQuery.mockReturnValue({ data: [], isLoading: false })
    mockedUseGetExtDataQuery.mockReturnValue({ data: [], isLoading: false })

    mockedUseGetTailLogRangeAggrQuery.mockReturnValue({
      data: [],
      isLoading: false,
    })

    renderHook(() =>
      useHashRevenueChartData({
        dateRange: { ...dateRange, period: 'day' },
        currency,
      }),
    )

    expect(mockedUseGetExtDataQuery).toHaveBeenCalled()
    expect(mockedUseGetTailLogRangeAggrQuery).toHaveBeenCalled()
  })
})
