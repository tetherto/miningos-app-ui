import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import { useUpdateExistedActions } from '../useUpdateExistedActions'

import { actionsSlice } from '@/app/slices/actionsSlice'

const createWrapper = () => {
  const store = configureStore({
    reducer: { actions: actionsSlice.reducer },
    preloadedState: {
      actions: {
        pendingSubmissions: [],
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useUpdateExistedActions', () => {
  it('returns updateExistedActions function', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })
    expect(result.current).toHaveProperty('updateExistedActions')
    expect(typeof result.current.updateExistedActions).toBe('function')
  })

  it('updateExistedActions can be called without throwing', () => {
    const { result } = renderHook(() => useUpdateExistedActions(), {
      wrapper: createWrapper(),
    })
    expect(() =>
      result.current.updateExistedActions({
        actionType: 'reboot',
        pendingSubmissions: [],
        selectedDevices: [],
      }),
    ).not.toThrow()
  })
})
