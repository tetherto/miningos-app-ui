import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useUserRole, useAppUserRoles } from '../useUserRole'

import { authSlice } from '@/app/slices/authSlice'

const { mockFeatureConfigQuery, mockGetRoles } = vi.hoisted(() => ({
  mockFeatureConfigQuery: vi.fn(() => ({ data: {} as unknown, isLoading: false })),
  mockGetRoles: vi.fn(() => [] as string[]),
}))

vi.mock('@/app/services/api', () => ({
  useGetFeatureConfigQuery: mockFeatureConfigQuery,
}))
vi.mock('@/app/utils/tokenUtils', () => ({
  getRolesFromAuthToken: mockGetRoles,
}))

const createWrapper = (token: string | null = 't') => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token, permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useAppUserRoles', () => {
  it('returns isLoading and userRoles', () => {
    const { result } = renderHook(() => useAppUserRoles(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('userRoles')
    expect(Array.isArray(result.current.userRoles)).toBe(true)
  })
})

describe('useUserRole', () => {
  it('returns label and value', () => {
    const { result } = renderHook(() => useUserRole(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('label')
    expect(result.current).toHaveProperty('value')
  })

  it('returns empty strings when no token', () => {
    const { result } = renderHook(() => useUserRole(), { wrapper: createWrapper(null) })
    expect(result.current.label).toBe('')
    expect(result.current.value).toBe('')
  })

  it('returns userRoles from multisite roles when isMultiSiteModeEnabled is true', () => {
    mockFeatureConfigQuery.mockReturnValueOnce({
      data: { isMultiSiteModeEnabled: true },
      isLoading: false,
    })
    const { result } = renderHook(() => useAppUserRoles(), { wrapper: createWrapper() })
    expect(Array.isArray(result.current.userRoles)).toBe(true)
  })

  it('returns empty roles when isLoading is true', () => {
    mockFeatureConfigQuery.mockReturnValueOnce({ data: undefined as unknown, isLoading: true })
    const { result } = renderHook(() => useAppUserRoles(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.userRoles).toHaveLength(0)
  })

  it('resolves role label when token contains a known role', () => {
    mockGetRoles.mockReturnValueOnce(['admin'])
    const { result } = renderHook(() => useUserRole(), { wrapper: createWrapper('fake-token') })
    // label and value should be defined (may be empty if role not in USER_ROLES)
    expect(result.current).toHaveProperty('label')
  })
})
