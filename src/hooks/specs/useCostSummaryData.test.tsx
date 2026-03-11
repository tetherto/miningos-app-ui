import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useCostSummaryData } from '../useCostSummaryData'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

const mockFns = vi.hoisted(() => ({
  extDataQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false, isFetching: false })),
  globalDataQuery: vi.fn(() => ({ data: [], isLoading: false, isFetching: false })),
  tailLogRangeAggrQuery: vi.fn(() => ({ data: null, isLoading: false, isFetching: false })),
  siteQuery: vi.fn(() => ({ data: { site: 'test-site' }, isLoading: false })),
  useMultiSiteMode: vi.fn(() => ({
    siteId: undefined as string | undefined,
    site: null as unknown,
    selectedSites: [] as string[],
    siteList: [] as string[],
    isMultiSiteModeEnabled: true,
  })),
  useMultiSiteDateRange: vi.fn(() => ({
    dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() } as {
      start: number
      end: number
    } | null,
    onTableDateRangeChange: vi.fn(),
    onDateRangeReset: vi.fn(),
  })),
}))

vi.mock('@/app/services/api', () => ({
  useGetSiteQuery: mockFns.siteQuery,
  useGetGlobalDataQuery: mockFns.globalDataQuery,
  useGetTailLogRangeAggrQuery: mockFns.tailLogRangeAggrQuery,
  useGetExtDataQuery: mockFns.extDataQuery,
}))

vi.mock('../useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: mockFns.useMultiSiteDateRange,
}))

vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: mockFns.useMultiSiteMode,
}))

vi.mock('@/MultiSiteViews/RevenueAndCost/Cost/hooks/useAvgAllInPowerCostData', () => ({
  useAvgAllInPowerCostData: () => ({ data: null, isLoading: false }),
}))

vi.mock('@/app/utils/costDataUtils', () => ({
  calculateCostMetrics: vi.fn(() => ({ allInCost: 10, energyCost: 5, operationsCost: 5 })),
  processProductionCosts: vi.fn(() => ({
    totalEnergyCost: 100,
    totalOperationalCost: 50,
    costSummary: [{ ts: Date.now(), totalCost: 150 }],
  })),
}))

vi.mock('@/app/utils/powerConsumptionUtils', () => ({
  calculateAveragePowerMW: vi.fn(() => 1.5),
  extractPowermeterData: vi.fn(() => [{ ts: Date.now(), value: 1000 }]),
}))

const START = new Date('2024-01-01').getTime()
const END = new Date('2024-01-31').getTime()

const createWrapper = (timeframeType = 'week') => {
  const store = configureStore({
    reducer: { multiSite: multiSiteSlice.reducer },
    preloadedState: {
      multiSite: {
        timeframeType: timeframeType as 'year' | 'month' | 'week',
        dateRange: null,
        selectedSites: [] as string[],
        isManualSelection: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useCostSummaryData', () => {
  it('returns expected shape when multi-site mode is enabled (early return)', () => {
    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isDataLoading')
    expect(result.current).toHaveProperty('isRevenueDataLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('onTableDateRangeChange')
    expect(result.current).toHaveProperty('onDateRangeReset')
    expect(result.current.data).toHaveProperty('costData')
    expect(result.current.data).toHaveProperty('revenueData')
    expect(result.current.data.costData).toEqual({})
  })

  it('returns data for single-site mode with week timeframe (empty cost data)', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: 'site-1',
      site: 'Site 1',
      selectedSites: ['site-1'],
      siteList: ['site-1'],
      isMultiSiteModeEnabled: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: START, end: END },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })

    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper('week'),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data.costData).toEqual({})
    expect(result.current.data.energyCost).toBeNull()

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: true,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
  })

  it('returns data for single-site mode with month timeframe', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: 'site-1',
      site: 'Site 1',
      selectedSites: ['site-1'],
      siteList: ['site-1'],
      isMultiSiteModeEnabled: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: START, end: END },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
    mockFns.extDataQuery.mockReturnValue({
      data: [{ ts: START + 1000, priceUSD: 45000 }],
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper('month'),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data.btcData).toBeDefined()

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: true,
    })
    mockFns.extDataQuery.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      isFetching: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
  })

  it('returns data for single-site mode with year timeframe', () => {
    const yearStart = new Date('2024-01-01').getTime()
    const yearEnd = new Date('2024-12-31').getTime()
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: 'site-1',
      site: 'Site 1',
      selectedSites: ['site-1'],
      siteList: ['site-1'],
      isMultiSiteModeEnabled: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: yearStart, end: yearEnd },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
    mockFns.extDataQuery.mockReturnValue({
      data: [
        { ts: yearStart + 86400000, priceUSD: 40000 },
        { ts: yearStart + 86400000 * 60, priceUSD: 45000 },
      ],
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper('year'),
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data.btcData).toBeDefined()

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: true,
    })
    mockFns.extDataQuery.mockReturnValue({
      data: undefined as unknown,
      isLoading: false,
      isFetching: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
  })

  it('handles null dateRange gracefully', () => {
    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: false,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: null,
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })

    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper('week'),
    })

    expect(result.current.data).toBeDefined()

    mockFns.useMultiSiteMode.mockReturnValue({
      siteId: undefined,
      site: null,
      selectedSites: [],
      siteList: [],
      isMultiSiteModeEnabled: true,
    })
    mockFns.useMultiSiteDateRange.mockReturnValue({
      dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() },
      onTableDateRangeChange: vi.fn(),
      onDateRangeReset: vi.fn(),
    })
  })
})
