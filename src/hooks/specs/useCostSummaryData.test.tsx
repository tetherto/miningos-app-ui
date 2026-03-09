import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { useCostSummaryData } from '../useCostSummaryData'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

vi.mock('@/app/services/api', () => ({
  useGetSiteQuery: () => ({ data: { site: 'test-site' }, isLoading: false }),
  useGetGlobalDataQuery: () => ({ data: [], isLoading: false }),
  useGetTailLogRangeAggrQuery: () => ({ data: null, isLoading: false }),
  useGetExtDataQuery: () => ({ data: [], isLoading: false }),
}))
vi.mock('../useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: () => ({
    dateRange: { start: Date.now() - 86400000 * 7, end: Date.now() },
    onTableDateRangeChange: vi.fn(),
    onDateRangeReset: vi.fn(),
  }),
}))
vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: () => ({
    siteId: undefined,
    site: null,
    selectedSites: [],
    siteList: [],
    isMultiSiteModeEnabled: true,
  }),
}))
vi.mock('@/MultiSiteViews/RevenueAndCost/Cost/hooks/useAvgAllInPowerCostData', () => ({
  useAvgAllInPowerCostData: () => ({ data: null, isLoading: false }),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { multiSite: multiSiteSlice.reducer },
    preloadedState: {
      multiSite: {
        timeframeType: 'week',
        dateRange: null,
        selectedSites: [],
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useCostSummaryData', () => {
  it('returns expected shape when multi-site mode is enabled', () => {
    const { result } = renderHook(() => useCostSummaryData(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isDataLoading')
    expect(result.current).toHaveProperty('isRevenueDataLoading')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('onTableDateRangeChange')
    expect(result.current).toHaveProperty('onDateRangeReset')
    expect(result.current).toHaveProperty('siteId')
    expect(result.current).toHaveProperty('site')
    expect(result.current).toHaveProperty('selectedSites')
    expect(result.current).toHaveProperty('siteList')
    expect(result.current.data).toHaveProperty('costData')
    expect(result.current.data).toHaveProperty('revenueData')
  })
})
