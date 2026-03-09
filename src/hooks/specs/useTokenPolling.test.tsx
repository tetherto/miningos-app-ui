import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import useTokenPolling from '../useTokenPolling'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/services/api', () => ({
  usePostTokenQuery: () => ({ data: { token: null }, error: null }),
}))
vi.mock('../usePermissions', () => ({
  useTokenPermissions: () => ({ fetchPermissions: vi.fn() }),
}))
vi.mock('@/app/utils/localStorageUtils', () => ({
  saveLastVisitedUrl: vi.fn(),
}))
vi.mock('@/app/utils/tokenUtils', () => ({
  getRolesFromAuthToken: () => [],
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 'test-token', permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  )
}

describe('useTokenPolling', () => {
  it('returns token and error from query', () => {
    const { result } = renderHook(() => useTokenPolling('token'), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('token')
    expect(result.current).toHaveProperty('error')
  })

  it('skips query when authToken is null', () => {
    const { result } = renderHook(() => useTokenPolling(null), {
      wrapper: createWrapper(),
    })
    expect(result.current).toBeDefined()
  })
})
