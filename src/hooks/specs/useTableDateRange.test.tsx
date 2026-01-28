import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { Provider } from 'react-redux'
import { vi } from 'vitest'

import useTableDateRange from '../useTableDateRange'

import multiSiteReducer from '@/app/slices/multiSiteSlice'
import { PERIOD } from '@/constants/ranges'

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Mock utils to avoid real-time dependency
vi.mock('../app/utils/dateTimeUtils', () => ({
  getTimeRoundedToMinute: () => new Date('2025-09-18T12:00:00Z').getTime(),
}))
vi.mock('../app/utils/dateUtils', () => ({
  getBeginningOfMonth: () => new Date('2025-09-01T00:00:00Z'),
  getEndOfYesterday: () => new Date('2025-09-17T23:59:59Z'),
}))

const createWrapper = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { multiSite: multiSiteReducer },
    preloadedState,
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useTableDateRange', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default current month range', () => {
    const { result } = renderHook(() => useTableDateRange(), {
      wrapper: createWrapper(),
    })

    const { dateRange, defaultDateRange } = result.current

    expect(dateRange.period).toBe(PERIOD.DAILY)
    expect(typeof dateRange.start).toBe('number')
    expect(typeof dateRange.end).toBe('number')
    expect(dateRange.start).toBe(defaultDateRange.start)
    expect(dateRange.end).toBe(defaultDateRange.end)
  })

  it('should initialize with daysAgo param', () => {
    const daysAgo = 7
    const { result } = renderHook(() => useTableDateRange({ daysAgo }), {
      wrapper: createWrapper(),
    })

    const { dateRange } = result.current

    expect(dateRange.period).toBe(PERIOD.DAILY)
    expect(dateRange.end - dateRange.start).toBe(daysAgo * MS_PER_DAY)
  })

  it('should reset to defaultDateRange when onDateRangeReset is called', () => {
    const { result } = renderHook(() => useTableDateRange({ daysAgo: 3, persist: true }), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.onDateRangeReset()
    })
    const after = result.current.dateRange

    expect(after.period).toBe(PERIOD.DAILY)
    expect(after.start).not.toBeNaN()
    expect(after.end).not.toBeNaN()
    expect(after.start).toBe(result.current.defaultDateRange.start)
    expect(after.end).toBe(result.current.defaultDateRange.end)
  })

  it('should update dateRange on onTableDateRangeChange', () => {
    const { result } = renderHook(() => useTableDateRange(), {
      wrapper: createWrapper(),
    })

    const startDate = new Date('2025-09-10T00:00:00Z')
    const endDate = new Date('2025-09-15T00:00:00Z')

    act(() => {
      result.current.onTableDateRangeChange([startDate, endDate], { period: PERIOD.WEEKLY })
    })

    const { dateRange } = result.current
    expect(dateRange.period).toBe(PERIOD.WEEKLY)
  })

  it('should call onDateRangeReset when no dates are provided and isResetable is true', () => {
    const { result } = renderHook(() => useTableDateRange({ isResetable: true }), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.onTableDateRangeChange(null)
    })

    expect(result.current.dateRange.start).toBe(result.current.defaultDateRange.start)
    expect(result.current.dateRange.end).toBe(result.current.defaultDateRange.end)
  })
})
