import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import useTimezone from '../useTimezone'

import { timezoneSlice } from '@/app/slices/timezoneSlice'

const createWrapper = (timezone = 'UTC') => {
  const store = configureStore({
    reducer: { timezone: timezoneSlice.reducer },
    preloadedState: { timezone: { timezone } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useTimezone', () => {
  it('returns getFormattedDate, timezone, changeTimezone', () => {
    const { result } = renderHook(() => useTimezone(), { wrapper: createWrapper() })
    expect(result.current).toHaveProperty('getFormattedDate')
    expect(result.current).toHaveProperty('timezone')
    expect(result.current).toHaveProperty('changeTimezone')
    expect(result.current.timezone).toBe('UTC')
  })
})
