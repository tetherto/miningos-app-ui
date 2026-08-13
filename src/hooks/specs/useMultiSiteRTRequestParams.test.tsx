import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import useMultiSiteRTRequestParams from '../useMultiSiteRTRequestParams'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

const mockUseMultiSiteMode = vi.fn(() => ({
  siteList: [{ id: 's1' }],
  isLoading: false,
}))

vi.mock('../useMultiSiteMode', () => ({
  useMultiSiteMode: () => mockUseMultiSiteMode(),
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

  it('buildRequestParams returns empty object when isLoading is true', () => {
    mockUseMultiSiteMode.mockReturnValueOnce({ siteList: [], isLoading: true })
    const { result } = renderHook(() => useMultiSiteRTRequestParams(), { wrapper: createWrapper() })
    const params = result.current.buildRequestParams({
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
      sites: [],
    })
    expect(params).toEqual({})
  })

  it('buildRequestParams uses allSites when sites is empty', () => {
    const { result } = renderHook(() => useMultiSiteRTRequestParams(), { wrapper: createWrapper() })
    const params = result.current.buildRequestParams({
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
      sites: [],
    })
    // allSites includes 's1' (uppercased)
    const regions = JSON.parse((params as { regions?: string }).regions || '[]')
    expect(regions).toContain('S1')
  })

  it('buildRequestParams accepts numeric timestamps', () => {
    const { result } = renderHook(() => useMultiSiteRTRequestParams(), { wrapper: createWrapper() })
    const startTs = new Date('2025-01-01').getTime()
    const endTs = new Date('2025-01-31').getTime()
    const params = result.current.buildRequestParams({
      start: startTs,
      end: endTs,
      sites: [],
    })
    expect((params as { startDate?: string }).startDate).toBe('2025-01-01')
    expect((params as { endDate?: string }).endDate).toBe('2025-01-31')
  })
})
