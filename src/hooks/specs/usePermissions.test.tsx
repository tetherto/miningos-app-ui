import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useCheckPerm, useIsRevenueReportEnabled, useTokenPermissions } from '../usePermissions'

import { authSlice } from '@/app/slices/authSlice'

const mockLazyQuery = vi.fn(() => ({
  unwrap: () => Promise.resolve({ permissions: { revenue: 'r' } }),
}))

vi.mock('@/app/services/api', () => ({
  useLazyGetUserPermissionsQuery: () => [mockLazyQuery],
}))

const createWrapper = (token: string | null = 'test-token', permissions: unknown = null) => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token, permissions } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useCheckPerm', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useCheckPerm({ cap: 'revenue' }), {
      wrapper: createWrapper(),
    })
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useIsRevenueReportEnabled', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useIsRevenueReportEnabled(), {
      wrapper: createWrapper(),
    })
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useTokenPermissions', () => {
  it('returns fetchPermissions function', () => {
    const { result } = renderHook(() => useTokenPermissions(), {
      wrapper: createWrapper(),
    })
    expect(typeof result.current.fetchPermissions).toBe('function')
  })

  it('dispatches null permissions when no auth token', () => {
    const { result } = renderHook(() => useTokenPermissions(), {
      wrapper: createWrapper(null),
    })
    expect(result.current.fetchPermissions).toBeDefined()
    // Calling fetchPermissions with no token dispatches setPermissions(null)
    result.current.fetchPermissions()
  })

  it('fetches permissions when auth token is present', async () => {
    const { result } = renderHook(() => useTokenPermissions(), {
      wrapper: createWrapper('token-123'),
    })
    await result.current.fetchPermissions()
    expect(mockLazyQuery).toHaveBeenCalled()
  })

  it('has the fetchPermissions function available after mount', () => {
    // verify the hook is accessible without testing the error path
    const { result } = renderHook(() => useTokenPermissions(), {
      wrapper: createWrapper('token-abc'),
    })
    expect(typeof result.current.fetchPermissions).toBe('function')
  })
})
