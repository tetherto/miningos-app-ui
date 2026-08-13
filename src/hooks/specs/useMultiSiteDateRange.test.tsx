import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useMultiSiteDateRange } from '../useMultiSiteDateRange'

import multiSiteReducer from '@/app/slices/multiSiteSlice'
import { PERIOD } from '@/constants/ranges'

vi.mock('@/app/utils/dateUtils', () => ({
  getBeginningOfMonth: () => new Date('2025-01-01T00:00:00Z'),
  getEndOfYesterday: () => new Date('2025-01-30T23:59:59Z'),
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

describe('useMultiSiteDateRange', () => {
  it('initializes with default date range when no stored value', () => {
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper(),
    })
    expect(result.current.dateRange.period).toBe(PERIOD.DAILY)
    expect(typeof result.current.dateRange.start).toBe('number')
    expect(typeof result.current.dateRange.end).toBe('number')
  })

  it('uses stored date range when available', () => {
    const storedRange = { start: 1000, end: 2000, period: 'monthly' }
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper({
        multiSite: {
          selectedSites: [],
          isManualSelection: false,
          dateRange: storedRange,
          timeframeType: null,
        },
      }),
    })
    expect(result.current.dateRange).toEqual(storedRange)
  })

  it('onTableDateRangeChange updates date range with new dates', () => {
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper(),
    })
    const start = new Date('2025-03-01T00:00:00Z')
    const end = new Date('2025-03-31T23:59:59Z')
    act(() => {
      result.current.onTableDateRangeChange([start, end], { period: 'monthly' })
    })
    expect(result.current.dateRange.start).toBe(start.getTime())
    expect(result.current.dateRange.end).toBe(end.getTime())
    expect(result.current.dateRange.period).toBe('monthly')
  })

  it('onTableDateRangeChange resets to default when dates are null', () => {
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.onTableDateRangeChange(null, { period: 'daily' })
    })
    expect(result.current.dateRange.period).toBe(PERIOD.DAILY)
  })

  it('onDateRangeReset resets to default range', () => {
    const storedRange = { start: 1000, end: 2000, period: 'weekly' }
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper({
        multiSite: {
          selectedSites: [],
          isManualSelection: false,
          dateRange: storedRange,
          timeframeType: null,
        },
      }),
    })
    act(() => {
      result.current.onDateRangeReset()
    })
    expect(result.current.dateRange.period).toBe(PERIOD.DAILY)
  })

  it('setSelectorType updates the timeframe type', () => {
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.setSelectorType('year')
    })
    expect(result.current.timeframeType).toBe('year')
  })

  it('accepts string dates in onTableDateRangeChange', () => {
    const { result } = renderHook(() => useMultiSiteDateRange(), {
      wrapper: createWrapper(),
    })
    act(() => {
      result.current.onTableDateRangeChange(['2025-04-01', '2025-04-30'], { period: 'daily' })
    })
    expect(typeof result.current.dateRange.start).toBe('number')
    expect(typeof result.current.dateRange.end).toBe('number')
  })
})
