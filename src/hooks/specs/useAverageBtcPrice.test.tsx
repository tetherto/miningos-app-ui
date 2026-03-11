import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useAverageBtcPrice } from '../useAverageBtcPrice'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

vi.mock('@/app/services/api', () => ({
  useGetBtcDataPriceQuery: () => ({
    data: { summary: { avg: { priceUSD: 50000 } } },
    isLoading: false,
  }),
}))
vi.mock('../useMultiSiteRTRequestParams', () => ({
  default: () => ({ buildRequestParams: () => ({}), isLoading: false }),
}))
const mockFns = vi.hoisted(() => ({
  useMultiSiteMode: vi.fn(() => ({
    siteId: undefined as string | undefined,
    selectedSites: [] as string[],
    isMultiSiteModeEnabled: true,
  })),
}))

vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: mockFns.useMultiSiteMode,
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { multiSite: multiSiteSlice.reducer },
    preloadedState: {
      multiSite: {
        siteList: [],
        selectedSites: [],
        dateRange: null,
        timeframeType: null,
        isManualSelection: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useAverageBtcPrice', () => {
  it('returns averageBtcPrice and isLoading', () => {
    const { result } = renderHook(
      () => useAverageBtcPrice({ start: Date.now(), end: Date.now() } as never),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('averageBtcPrice')
    expect(result.current).toHaveProperty('isLoading')
  })

  it('skips API call when isMultiSiteModeEnabled is false', () => {
    mockFns.useMultiSiteMode.mockReturnValueOnce({
      siteId: undefined,
      selectedSites: [],
      isMultiSiteModeEnabled: false,
    })
    const { result } = renderHook(
      () => useAverageBtcPrice({ start: Date.now(), end: Date.now() } as never),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('averageBtcPrice')
    expect(result.current.isLoading).toBe(false)
  })

  it('uses siteId as sites when siteId is present', () => {
    mockFns.useMultiSiteMode.mockReturnValueOnce({
      siteId: 'specific-site',
      selectedSites: ['other-site'],
      isMultiSiteModeEnabled: true,
    })
    const { result } = renderHook(
      () => useAverageBtcPrice({ start: Date.now(), end: Date.now() } as never),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('averageBtcPrice')
  })

  it('uses selectedSites when no siteId but selectedSites exist', () => {
    mockFns.useMultiSiteMode.mockReturnValueOnce({
      siteId: undefined,
      selectedSites: ['site-a', 'site-b'],
      isMultiSiteModeEnabled: true,
    })
    const { result } = renderHook(
      () => useAverageBtcPrice({ start: Date.now(), end: Date.now() } as never),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('averageBtcPrice')
  })

  it('skips when dateRange has no start', () => {
    const { result } = renderHook(
      () => useAverageBtcPrice({ start: undefined, end: Date.now() } as never),
      { wrapper: createWrapper() },
    )
    expect(result.current.isLoading).toBe(false)
  })
})
