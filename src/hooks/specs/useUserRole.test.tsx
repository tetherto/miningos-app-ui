import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { useUserRole, useAppUserRoles } from '../useUserRole'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/services/api', () => ({
  useGetFeatureConfigQuery: () => ({ data: {}, isLoading: false }),
}))
vi.mock('@/app/utils/tokenUtils', () => ({ getRolesFromAuthToken: () => [] }))

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
})
