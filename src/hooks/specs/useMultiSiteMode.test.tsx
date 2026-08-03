import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { useMultiSiteMode } from '../useMultiSiteMode'

import { useGetFeatureConfigQuery } from '@/app/services/api'
import { authSlice } from '@/app/slices/authSlice'
import { multiSiteSlice } from '@/app/slices/multiSiteSlice'

vi.mock('@/app/services/api', () => ({
  useGetFeatureConfigQuery: vi.fn(),
}))

const createWrapper = (siteId?: string) => {
  const store = configureStore({
    reducer: {
      multiSite: multiSiteSlice.reducer,
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: { token: 'test-token', permissions: null } as import('@/types/redux.d.ts').AuthState,
      multiSite: {
        selectedSites: [] as string[],
        isManualSelection: false,
        dateRange: null,
        timeframeType: null,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={siteId ? [`/sites/${siteId}`] : ['/']}>{children}</MemoryRouter>
    </Provider>
  )
}

describe('useMultiSiteMode', () => {
  it('returns shape with site, siteId, selectedSites, setters, options, loading', () => {
    vi.mocked(useGetFeatureConfigQuery).mockReturnValue({
      data: { isMultiSiteModeEnabled: false },
      isLoading: false,
    } as never)
    const { result } = renderHook(() => useMultiSiteMode(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('site')
    expect(result.current).toHaveProperty('siteId')
    expect(result.current).toHaveProperty('selectedSites')
    expect(result.current).toHaveProperty('setSelectedSites')
    expect(result.current).toHaveProperty('setSelectedSitesManually')
    expect(result.current).toHaveProperty('siteSelectOptions')
    expect(result.current).toHaveProperty('isMultiSiteModeEnabled')
    expect(result.current).toHaveProperty('siteList')
    expect(result.current).toHaveProperty('getSiteById')
    expect(result.current).toHaveProperty('isLoading')
  })

  it('when featureConfig has siteList, siteSelectOptions and siteList are populated', () => {
    vi.mocked(useGetFeatureConfigQuery).mockReturnValue({
      data: {
        isMultiSiteModeEnabled: true,
        siteList: [
          { id: 'site-a', name: 'Site A' },
          { id: 'site-b', name: 'Site B' },
        ],
      },
      isLoading: false,
    } as never)
    const { result } = renderHook(() => useMultiSiteMode(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isMultiSiteModeEnabled).toBe(true)
    expect(result.current.siteList).toHaveLength(2)
    expect(result.current.siteSelectOptions).toHaveLength(2)
    expect(result.current.getSiteById('site-a')).toHaveProperty('id', 'site-a')
  })
})
