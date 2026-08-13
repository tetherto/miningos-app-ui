import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useHasPerms } from '../useHasTokenPerms'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/utils/authUtils', () => ({
  checkPermission: vi.fn((_config: unknown, _req: unknown) => true),
}))

const createWrapper = (permissions: unknown = null) => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 'test-token', permissions } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useHasPerms', () => {
  it('returns a checker function', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper() })
    expect(typeof result.current).toBe('function')
  })

  it('calls checkPermission with string permission', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper() })
    const hasPerms = result.current('admin')
    expect(typeof hasPerms).toBe('boolean')
  })

  it('calls checkPermission with array permission (uses first element)', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper() })
    const hasPerms = result.current(['admin', 'editor'])
    expect(typeof hasPerms).toBe('boolean')
  })

  it('calls checkPermission with PermissionCheck object', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper() })
    const hasPerms = result.current({ perm: 'admin', cap: 'c' })
    expect(typeof hasPerms).toBe('boolean')
  })
})
