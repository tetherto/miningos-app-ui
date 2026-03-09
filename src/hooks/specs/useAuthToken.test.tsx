import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import useAuthToken from '../useAuthToken'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('../useTokenPolling', () => ({
  __esModule: true,
  default: () => ({ error: null }),
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
})
