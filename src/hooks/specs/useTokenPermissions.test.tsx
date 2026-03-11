import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import {
  useTokenPermissions,
  useCheckPerm,
  useIsRevenueReportEnabled,
  useIsFeatureEditingEnabled,
} from '../usePermissions'

import { authSlice } from '@/app/slices/authSlice'

const mockUnwrap = vi.fn().mockResolvedValue({ permissions: {} })
vi.mock('@/app/services/api', () => ({
  useLazyGetUserPermissionsQuery: () => [vi.fn().mockReturnValue({ unwrap: () => mockUnwrap() })],
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 't', permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useTokenPermissions', () => {
  it('returns fetchPermissions', () => {
    const { result } = renderHook(() => useTokenPermissions(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('fetchPermissions')
    expect(typeof result.current.fetchPermissions).toBe('function')
  })
})

describe('useCheckPerm', () => {
  it('returns boolean', () => {
    const { result } = renderHook(() => useCheckPerm({ perm: 'read' }), {
      wrapper: createWrapper(),
    })
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useIsRevenueReportEnabled', () => {
  it('returns boolean', () => {
    const { result } = renderHook(() => useIsRevenueReportEnabled(), { wrapper: createWrapper() })
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useIsFeatureEditingEnabled', () => {
  it('returns boolean', () => {
    const { result } = renderHook(() => useIsFeatureEditingEnabled(), { wrapper: createWrapper() })
    expect(typeof result.current).toBe('boolean')
  })
})
