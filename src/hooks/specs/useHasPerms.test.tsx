import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useHasPerms } from '../useHasTokenPerms'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/utils/authUtils', () => ({
  checkPermission: (_config: unknown, req: { perm?: string }) => req.perm === 'read',
}))

const createWrapper = (permissions: unknown = null) => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 't', permissions } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useHasPerms', () => {
  it('returns a function', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper() })
    expect(typeof result.current).toBe('function')
  })

  it('check function returns boolean for string perm', () => {
    const { result } = renderHook(() => useHasPerms(), { wrapper: createWrapper({}) })
    const check = result.current
    expect(typeof check('read')).toBe('boolean')
  })
})
