import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { useAverageBtcPrice } from '../useAverageBtcPrice'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

vi.mock('@/app/services/api', () => ({
  useGetBtcDataPriceQuery: () => ({ data: { summary: { avg: { priceUSD: 50000 } } }, isLoading: false }),
}))
vi.mock('../useMultiSiteRTRequestParams', () => ({
  default: () => ({ buildRequestParams: () => ({}), isLoading: false }),
}))
vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: () => ({
    siteId: undefined,
    selectedSites: [],
    isMultiSiteModeEnabled: true,
  }),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { multiSite: multiSiteSlice.reducer },
    preloadedState: { multiSite: { siteList: [], selectedSites: [], dateRange: null, timeframeType: null, isManualSelection: false } },
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
})
