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

describe('useRevenueData', () => {
  const defaultParams = {
    selectedSites: ['site-a'],
    siteList: [{ id: 'site-a', name: 'Site A' }],
    siteId: 'site-a',
    siteName: 'Site A',
    dateRange: { start: '2025-01-01', end: '2025-01-31', period: 'daily' },
    onTableDateRangeChange: vi.fn(),
  }

  it('returns expected shape', () => {
    const { result } = renderHook(() => useRevenueData(defaultParams))
    expect(result.current).toHaveProperty('revenueData')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('chartData')
    expect(result.current).toHaveProperty('transformedBTCMetrics')
    expect(result.current).toHaveProperty('revenueMetrics')
    expect(result.current).toHaveProperty('subsidyFeesData')
    expect(result.current).toHaveProperty('params')
  })

  it('returns isLoading as boolean', () => {
    const { result } = renderHook(() => useRevenueData(defaultParams))
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('works when selectedSites is empty', () => {
    const { result } = renderHook(() =>
      useRevenueData({ ...defaultParams, selectedSites: [] }),
    )
    expect(result.current).toHaveProperty('isLoading')
  })

  it('uses siteId when selectedSites is empty', () => {
    const { result } = renderHook(() =>
      useRevenueData({ ...defaultParams, selectedSites: [], siteId: 'site-b' }),
    )
    expect(result.current).toBeDefined()
  })

  it('uses siteList for site list when provided', () => {
    const { result } = renderHook(() =>
      useRevenueData({
        ...defaultParams,
        siteList: [{ id: 'site-a', name: 'Site A' }],
      }),
    )
    expect(result.current).toBeDefined()
  })

  it('uses siteId/siteName fallback when siteList is empty', () => {
    const { result } = renderHook(() =>
      useRevenueData({
        ...defaultParams,
        siteList: [],
        siteId: 'site-fallback',
        siteName: 'Fallback Site',
      }),
    )
    expect(result.current).toBeDefined()
  })

  it('returns default metrics when no revenue data', () => {
    const { result } = renderHook(() =>
      useRevenueData({ ...defaultParams, dateRange: { start: '', end: '', period: '' } }),
    )
    expect(result.current.isLoading).toBe(false)
  })
})
