import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useSiteOperationsBase } from '../useSiteOperationsBase'

vi.mock('../useMultiSiteDateRange', () => ({
  useMultiSiteDateRange: () => ({
    dateRange: { start: 0, end: 1000, period: 'daily' },
    onTableDateRangeChange: vi.fn(),
    timeframeType: 'daily',
  }),
}))

const mockUseMultiSiteMode = vi.fn(() => ({
  site: null as unknown,
  siteId: null as unknown,
  isLoading: false,
  siteSelectOptions: [],
}))

vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: () => mockUseMultiSiteMode(),
}))

vi.mock('../useMultiSiteRTRequestParams', () => ({
  __esModule: true,
  default: () => ({
    buildRequestParams: (params: unknown) => params,
  }),
}))

vi.mock('../MultiSiteViews/SiteOperations/SiteOperations.helper', () => ({
  getSiteOperationConfigStart: () => 0,
  getSiteOperationConfigEnd: () => 1000,
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      multiSite: () => ({ selectedSites: [] }),
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useSiteOperationsBase', () => {
  it('returns site, dateRange, requestParams and loading state', () => {
    const { result } = renderHook(() => useSiteOperationsBase(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('site')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('onTableDateRangeChange')
    expect(result.current).toHaveProperty('siteSelectOptions')
    expect(result.current).toHaveProperty('selectedSites')
    expect(result.current).toHaveProperty('requestParams')
    expect(result.current).toHaveProperty('isLoadingSiteList')
    expect(result.current).toHaveProperty('timeframeType')
  })

  it('builds requestParams with date range and sites', () => {
    const { result } = renderHook(() => useSiteOperationsBase(), {
      wrapper: createWrapper(),
    })
    expect(result.current.requestParams).toBeDefined()
    expect(result.current.requestParams).toHaveProperty('start')
    expect(result.current.requestParams).toHaveProperty('end')
    expect(result.current.requestParams).toHaveProperty('period')
  })

  it('uses siteId as sites when siteId is truthy', () => {
    mockUseMultiSiteMode.mockReturnValueOnce({
      site: { id: 'site-1' },
      siteId: 'site-1',
      isLoading: false,
      siteSelectOptions: [],
    })
    const { result } = renderHook(() => useSiteOperationsBase(), {
      wrapper: createWrapper(),
    })
    const params = result.current.requestParams as { sites?: string[] }
    expect(params.sites).toContain('site-1')
  })
})
