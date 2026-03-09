import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import useMultiSiteRTRequestParams from '../useMultiSiteRTRequestParams'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: () => ({
    siteList: [{ id: 's1' }],
    isLoading: false,
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

describe('useMultiSiteRTRequestParams', () => {
  it('returns isLoading and buildRequestParams', () => {
    const { result } = renderHook(() => useMultiSiteRTRequestParams(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('buildRequestParams')
    expect(typeof result.current.buildRequestParams).toBe('function')
  })

  it('buildRequestParams returns date and region params', () => {
    const { result } = renderHook(() => useMultiSiteRTRequestParams(), { wrapper: createWrapper() })
    const params = result.current.buildRequestParams({
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
      sites: ['S1'],
    })
    expect(params).toHaveProperty('startDate')
    expect(params).toHaveProperty('endDate')
    expect(params).toHaveProperty('regions')
  })
})
