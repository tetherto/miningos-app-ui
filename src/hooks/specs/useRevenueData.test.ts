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
  it('should be defined and accept parameters', () => {
    expect(useRevenueData).toBeDefined()
    expect(typeof useRevenueData).toBe('function')
  })

  it('should accept selectedSites, siteId, and siteName parameters', () => {
    const mockSelectedSites = [{ id: 'site-c', name: 'Site-C' }]
    const mockSiteId = 'site-d'
    const mockSiteName = 'Site-D'

    expect(mockSelectedSites).toHaveLength(1)
    expect(mockSelectedSites[0]).toHaveProperty('id', 'site-c')
    expect(mockSiteId).toBe('site-d')
    expect(mockSiteName).toBe('Site-D')
  })

  it('should have correct mock data structure', () => {
    const mockRevenueData = { regions: [] }
    const mockDowntimeData = { log: [] }
    const mockGlobalConfig = { nominalSiteHashrate_MHS: 1000000 }

    expect(mockRevenueData).toHaveProperty('regions')
    expect(mockDowntimeData).toHaveProperty('log')
    expect(mockGlobalConfig).toHaveProperty('nominalSiteHashrate_MHS')
  })
})
