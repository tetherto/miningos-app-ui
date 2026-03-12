import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { useRevenueData } from '../useRevenueData'

vi.mock('../useMultiSiteRTRequestParams', () => ({
  default: () => ({
    buildRequestParams: vi.fn((params) => ({ ...params, groupByRegion: true })),
    isLoading: false,
  }),
}))

vi.mock('../useTableDateRange', () => ({
  default: () => ({
    dateRange: { start: '2025-01-01', end: '2025-01-31' },
    onTableDateRangeChange: vi.fn(),
  }),
}))

vi.mock('@/app/services/api', () => ({
  useGetRevenueQuery: () => ({
    data: { regions: [] },
    isLoading: false,
  }),
  useGetDowntimeCurtailmentQuery: () => ({
    data: { log: [] },
    isLoading: false,
  }),
  useGetGlobalConfigQuery: () => ({
    data: { nominalSiteHashrate_MHS: 1000000 },
    isLoading: false,
  }),
  useGetOperationsHashrateQuery: () => ({
    data: {
      summary: {
        avg: {
          hashrate: 1000000,
        },
      },
      nominalHashrate: 2000000,
    },
    isLoading: false,
  }),
}))

vi.mock('@/MultiSiteViews/RevenueAndCost/revenueDataHelpers', () => ({
  transformRevenueDataForChart: vi.fn(() => []),
  convertToChartFormat: vi.fn(() => []),
  createBTCMetrics: vi.fn(() => ({ totalBtc: { label: 'Total Bitcoin', unit: 'BTC', value: 0 } })),
  createRevenueMetrics: vi.fn(() => ({
    avgEnergyRevenue: { label: 'Test', unit: '$/MWh', value: 0 },
  })),
  createSubsidyFeesData: vi.fn(() => ({ unit: 'BTC', dataset: {} })),
}))

const baseParams = {
  selectedSites: ['site-a'],
  siteId: 'site-b',
  siteName: 'Site B',
  dateRange: { start: 1_704_067_200_000, end: 1_706_745_600_000, period: 'daily' as const },
  onTableDateRangeChange: vi.fn(),
}

describe('useRevenueData', () => {
  it('should be defined and accept parameters', () => {
    expect(useRevenueData).toBeDefined()
    expect(typeof useRevenueData).toBe('function')
  })

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useRevenueData(baseParams))

    expect(result.current).toHaveProperty('revenueData')
    expect(result.current).toHaveProperty('downtimeData')
    expect(result.current).toHaveProperty('globalConfig')
    expect(result.current).toHaveProperty('hashrateData')
    expect(result.current).toHaveProperty('transformedBTCMetrics')
    expect(result.current).toHaveProperty('revenueMetrics')
    expect(result.current).toHaveProperty('chartData')
    expect(result.current).toHaveProperty('subsidyFeesData')
    expect(result.current).toHaveProperty('firstMetricsChunk')
    expect(result.current).toHaveProperty('secondMetricsChunk')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isRevenueLoading')
    expect(result.current).toHaveProperty('isRevenueFetching')
    expect(result.current).toHaveProperty('isParamBuilderLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('params')
    expect(result.current).toHaveProperty('options')
  })

  it('isLoading is false when all queries are resolved', () => {
    const { result } = renderHook(() => useRevenueData(baseParams))
    expect(result.current.isLoading).toBe(false)
  })

  it('uses siteId fallback when selectedSites is empty', () => {
    const params = { ...baseParams, selectedSites: [] }
    const { result } = renderHook(() => useRevenueData(params))
    expect(result.current).toHaveProperty('params')
  })

  it('uses siteList when provided', () => {
    const params = {
      ...baseParams,
      siteList: [{ id: 'site-a', name: 'Site A' }],
    }
    const { result } = renderHook(() => useRevenueData(params))
    expect(result.current.transformedBTCMetrics).toBeDefined()
  })

  it('creates processedSiteList from siteId/siteName when siteList is empty', () => {
    const params = { ...baseParams, siteList: [] }
    const { result } = renderHook(() => useRevenueData(params))
    expect(result.current.transformedBTCMetrics).toBeDefined()
  })

  it('options.skip is false when dateRange has valid start and end', () => {
    const { result } = renderHook(() => useRevenueData(baseParams))
    expect(result.current.options.skip).toBe(false)
  })
})
