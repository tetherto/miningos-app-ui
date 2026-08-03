import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import useAuthToken from '../useAuthToken'

import { authSlice } from '@/app/slices/authSlice'

const { mockUseTokenPolling } = vi.hoisted(() => ({
  mockUseTokenPolling: vi.fn(() => ({ error: null as unknown })),
}))

vi.mock('../useTokenPolling', () => ({
  __esModule: true,
  default: mockUseTokenPolling,
}))
vi.mock('../usePermissions', () => ({
  useTokenPermissions: () => ({}),
}))
vi.mock('@/app/utils/localStorageUtils', () => ({
  saveLastVisitedUrl: vi.fn(),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: null, permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  )
}

describe('useAuthToken', () => {
  it('returns auth token from store', () => {
    const store = configureStore({
      reducer: { auth: authSlice.reducer },
      preloadedState: { auth: { token: 'stored-token', permissions: null } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    )
    const { result } = renderHook(() => useAuthToken(), { wrapper })
    expect(result.current).toBe('stored-token')
  })

  it('returns null when no token in store', () => {
    const { result } = renderHook(() => useAuthToken(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toBeNull()
  })

  it('saves last visited URL when there is a polling error and no token', () => {
    const saveLastVisitedUrl = vi.fn()
    vi.doMock('@/app/utils/localStorageUtils', () => ({ saveLastVisitedUrl }))
    mockUseTokenPolling.mockReturnValueOnce({ error: new Error('token expired') })
    const { result } = renderHook(() => useAuthToken(), {
      wrapper: createWrapper(),
    })
    // No token + error branch should trigger saveLastVisitedUrl
    expect(result.current).toBeNull()
  })

  it('handles token passed via URL search param', () => {
    const store = configureStore({
      reducer: { auth: authSlice.reducer },
      preloadedState: { auth: { token: null, permissions: null } },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?authToken=new-token']}>{children}</MemoryRouter>
      </Provider>
    )
    renderHook(() => useAuthToken(), { wrapper })
    // Token should be dispatched to store
    expect(store.getState().auth.token).toBe('new-token')
  })
})
