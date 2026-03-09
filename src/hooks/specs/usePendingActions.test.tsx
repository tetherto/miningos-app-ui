import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { usePendingActions } from '../usePendingActions'

import { authSlice } from '@/app/slices/authSlice'

vi.mock('@/app/services/api', () => ({
  useGetActionsQuery: () => ({ data: null, isLoading: false, refetch: () => {} }),
  useGetBatchActionsQuery: () => ({ data: null }),
  useGetUserinfoQuery: () => ({ data: { metadata: {} } }),
}))
vi.mock('../useSmartPolling', () => ({ useSmartPolling: () => 5000 }))
vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({ notifyInfo: vi.fn(), notifyError: vi.fn() }),
}))
vi.mock('@/Components/Header/PendingActionsMenu/PendingActionsMenu.util', () => ({
  partitionActionsIntoMineAndOthers: () => [[], []],
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: { auth: { token: 'test-token', permissions: null } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('usePendingActions', () => {
  it('returns shape with pending actions data and handlers', () => {
    const { result } = renderHook(() => usePendingActions(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('myActions')
    expect(result.current).toHaveProperty('othersActions')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('refetchActionsData')
  })
})
