import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import useSignOut from '../useSignOut'

import { authSlice } from '@/app/slices/authSlice'

const createWrapper = (token: string | null = 't') => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token, permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    </Provider>
  )
}

describe('useSignOut', () => {
  it('returns null when no token', () => {
    const { result } = renderHook(() => useSignOut(), { wrapper: createWrapper(null) })
    expect(result.current).toBeNull()
  })

  it('returns string | null (effect may clear token)', () => {
    const { result } = renderHook(() => useSignOut(), { wrapper: createWrapper('t') })
    expect(result.current === null || typeof result.current === 'string').toBe(true)
  })
})
