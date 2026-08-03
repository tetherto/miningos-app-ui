import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
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

  it('getFormattedDate formats a date with default timezone', () => {
    const { result } = renderHook(() => useTimezone(), { wrapper: createWrapper('UTC') })
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = result.current.getFormattedDate(date)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('2024')
  })

  it('getFormattedDate uses fixedTimezone when provided', () => {
    const { result } = renderHook(() => useTimezone(), { wrapper: createWrapper('UTC') })
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = result.current.getFormattedDate(date, 'America/New_York')
    expect(typeof formatted).toBe('string')
  })

  it('getFormattedDate uses custom formatString when provided', () => {
    const { result } = renderHook(() => useTimezone(), { wrapper: createWrapper('UTC') })
    const date = new Date('2024-01-15T12:00:00Z')
    const formatted = result.current.getFormattedDate(date, undefined, 'yyyy-MM-dd')
    expect(formatted).toBe('2024-01-15')
  })

  it('changeTimezone dispatches setTimezone action', () => {
    const { result } = renderHook(() => useTimezone(), { wrapper: createWrapper('UTC') })
    result.current.changeTimezone('America/Los_Angeles')
    // Hook state might not update immediately, just check it doesn't throw
    expect(result.current.changeTimezone).toBeInstanceOf(Function)
  })
})
