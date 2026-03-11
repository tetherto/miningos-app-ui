import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getMetrics, useCostData } from '@/hooks/useCostData'

const mockFns = vi.hoisted(() => ({
  useMultiSiteMode: vi.fn(() => ({
    siteId: undefined,
    site: null,
    selectedSites: [],
    siteList: [],
    isMultiSiteModeEnabled: false,
  })),
  useMultiSiteDateRange: vi.fn(() => ({
    dateRange: { start: Date.now() - 86400000, end: Date.now() },
    onTableDateRangeChange: vi.fn(),
  })),
  useMultiSiteRTRequestParams: vi.fn(() => ({
    buildRequestParams: vi.fn(() => ({ sites: [], start: 0, end: 0 })),
    isLoading: false,
  })),
  btcDataQuery: vi.fn(() => ({ data: null, isLoading: false, isFetching: false })),
  costOperationalEnergyQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    isFetching: false,
  })),
  useEnergyCostData: vi.fn(() => ({
    costData: {},
    revenueData: [],
    isRevenueDataLoading: false,
    isLoading: false,
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetBtcDataHashPriceQuery: mockFns.btcDataQuery,
  useGetCostOperationalEnergyQuery: mockFns.costOperationalEnergyQuery,
}))

vi.mock('@/hooks/useMultiSiteMode', () => ({
  useMultiSiteMode: (...args: unknown[]) => mockFns.useMultiSiteMode(...args),
}))

vi.mock('@/hooks/useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: (...args: unknown[]) => mockFns.useMultiSiteDateRange(...args),
}))

vi.mock('@/hooks/useMultiSiteRTRequestParams', () => ({
  default: (...args: unknown[]) => mockFns.useMultiSiteRTRequestParams(...args),
}))

vi.mock('@/hooks/useEnergyCostData', () => ({
  useEnergyCostData: (...args: unknown[]) => mockFns.useEnergyCostData(...args),
}))

describe('getMetrics', () => {
  it('should return metrics with correct values', () => {
    const metrics = getMetrics({
      allInCost: 100,
      energyCost: 50,
      operationsCost: 30,
    })

    expect(metrics).toEqual({
      totalBtc: {
        label: 'All-in Cost',
        unit: '$/MWh',
        value: 100,
        isHighlighted: true,
      },
      energyCostBtc: {
        label: 'Energy Cost',
        unit: '$/MWh',
        value: 50,
      },
      operationsCostBtc: {
        label: 'Operations Cost',
        unit: '$/MWh',
        value: 30,
      },
    })
  })

  it('should handle zero values correctly', () => {
    const metrics = getMetrics({
      allInCost: 0,
      energyCost: 0,
      operationsCost: 0,
    })

    expect(metrics.totalBtc.value).toBe(0)
    expect(metrics.energyCostBtc.value).toBe(0)
    expect(metrics.operationsCostBtc.value).toBe(0)
  })

  it('handles null values', () => {
    const metrics = getMetrics({ allInCost: null, energyCost: null, operationsCost: null })
    expect(metrics.totalBtc.value).toBeNull()
  })
})

describe('useCostData', () => {
  it('returns early when single-site mode (isMultiSiteModeEnabled=false)', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: false,
    })

    const { result } = renderHook(() => useCostData())
    expect(result.current.data.costData).toEqual({})
    expect(result.current.data.energyCost).toBe(0)
    expect(result.current.isDataLoading).toBe(false)
  })

  it('processes cost data when multi-site mode is enabled', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: 'site-1',
      site: 'Site 1',
      selectedSites: ['site-1'],
      siteList: ['site-1'],
      isMultiSiteModeEnabled: true,
    })
    mockFns.costOperationalEnergyQuery.mockReturnValue({
      data: {
        'site-1': {
          allInCostsUSD: 200,
          energyCostsUSD: 100,
          operationalCostsUSD: 50,
          avgEfficiency: 30,
        },
      },
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useCostData())
    expect(result.current.data).toBeDefined()
    expect(result.current.metrcis).toBeDefined()

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: false,
    })
    mockFns.costOperationalEnergyQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
    })
  })

  it('uses siteId as sites when selectedSites is empty', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: 'site-1',
      site: 'Site 1',
      selectedSites: [],
      siteList: ['site-1'],
      isMultiSiteModeEnabled: true,
    })

    const { result } = renderHook(() => useCostData())
    expect(result.current.siteId).toBe('site-1')

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: false,
    })
  })
})
