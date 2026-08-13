import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import useTokenPolling from '../useTokenPolling'

import { authSlice } from '@/app/slices/authSlice'

const mockFns = vi.hoisted(() => ({
  postTokenQuery: vi.fn(() => ({ data: { token: null as string | null }, error: null as unknown })),
}))

vi.mock('@/app/services/api', () => ({
  usePostTokenQuery: mockFns.postTokenQuery,
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

  it('returns token when query provides a valid token', () => {
    mockFns.postTokenQuery.mockReturnValueOnce({ data: { token: 'new-token-123' }, error: null })
    const { result } = renderHook(() => useTokenPolling('existing-token'), {
      wrapper: createWrapper(),
    })
    expect(result.current.token).toBe('new-token-123')
  })

  it('handles 401 UNAUTHORIZED error from query', () => {
    mockFns.postTokenQuery.mockReturnValueOnce({
      data: { token: null },
      error: { status: 401 },
    })
    const { result } = renderHook(() => useTokenPolling('token'), {
      wrapper: createWrapper(),
    })
    expect(result.current.error).toEqual({ status: 401 })
  })

  it('handles 500 SERVER_ERROR from query', () => {
    mockFns.postTokenQuery.mockReturnValueOnce({
      data: { token: null },
      error: { status: 500 },
    })
    const { result } = renderHook(() => useTokenPolling('token'), {
      wrapper: createWrapper(),
    })
    expect(result.current.error).toEqual({ status: 500 })
  })
})
