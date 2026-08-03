import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useDemoToken } from '../useDemoToken'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/services/api.utils', () => ({
  isUseMockdataEnabled: true,
}))

describe('useDemoToken', () => {
  it('sets demo token when no auth token and mock data enabled', () => {
    const store = configureStore({
      reducer: { auth: authSlice.reducer },
      preloadedState: { auth: { token: null, permissions: null } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    renderHook(() => useDemoToken(), { wrapper })
    expect(store.getState().auth.token).toBe('DEMO_MODE_TOKEN')
  })

  it('does not overwrite existing token when mock data enabled', () => {
    const store = configureStore({
      reducer: { auth: authSlice.reducer },
      preloadedState: { auth: { token: 'existing-token', permissions: null } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    renderHook(() => useDemoToken(), { wrapper })
    expect(store.getState().auth.token).toBe('existing-token')
  })
})
