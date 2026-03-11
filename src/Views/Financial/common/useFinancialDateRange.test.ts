import { configureStore } from '@reduxjs/toolkit'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useFinancialDateRange } from './useFinancialDateRange'

import { multiSiteSlice } from '@/app/slices/multiSiteSlice'
import { timezoneSlice } from '@/app/slices/timezoneSlice'
import { PERIOD } from '@/constants/ranges'

// Ensure isDemoMode is false for most tests
vi.mock('@/app/services/api.utils', () => ({
  isDemoMode: false,
  isUseMockdataEnabled: false,
  isSaveMockdataEnabled: false,
}))

vi.mock('@/hooks/useTimezone', () => ({
  default: () => ({
    timezone: 'UTC',
    getFormattedDate: (d: Date) => d.toISOString(),
    changeTimezone: vi.fn(),
  }),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      multiSite: multiSiteSlice.reducer,
      timezone: timezoneSlice.reducer,
    },
  })
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider as React.ElementType, { store }, children),
    store,
  }
}

describe('useFinancialDateRange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state (non-demo mode)', () => {
    it('returns the hook shape: dateRange, setDateRange, handleRangeChange, timezone', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })
      expect(result.current).toHaveProperty('dateRange')
      expect(result.current).toHaveProperty('setDateRange')
      expect(result.current).toHaveProperty('handleRangeChange')
      expect(result.current).toHaveProperty('timezone')
    })

    it('initializes with a dateRange after mount (default DAILY period)', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })
      // After mount, the useEffect sets the date range from current month
      expect(result.current.dateRange).not.toBeNull()
    })

    it('initializes with defaultPeriod option', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(
        () => useFinancialDateRange({ defaultPeriod: PERIOD.MONTHLY }),
        { wrapper },
      )
      expect(result.current).toHaveProperty('dateRange')
    })
  })

  describe('handleRangeChange', () => {
    it('does nothing when dates is null', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })
      const initialRange = result.current.dateRange

      act(() => {
        result.current.handleRangeChange(null)
      })

      // dateRange should be unchanged
      expect(result.current.dateRange).toEqual(initialRange)
    })

    it('updates dateRange when valid dates are provided', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })

      const start = new Date('2025-01-01T00:00:00.000Z')
      const end = new Date('2025-01-31T23:59:59.999Z')

      act(() => {
        result.current.handleRangeChange([start, end], { period: PERIOD.DAILY })
      })

      expect(result.current.dateRange).not.toBeNull()
      expect(result.current.dateRange?.period).toBe(PERIOD.DAILY)
    })

    it('uses MONTHLY period by default when period option is not provided', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })

      const start = new Date('2025-01-01T00:00:00.000Z')
      const end = new Date('2025-01-31T23:59:59.999Z')

      act(() => {
        result.current.handleRangeChange([start, end])
      })

      expect(result.current.dateRange?.period).toBe(PERIOD.MONTHLY)
    })
  })

  describe('setDateRange', () => {
    it('directly sets the date range', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })

      const newRange = { start: 1700000000000, end: 1700086400000, period: PERIOD.DAILY }

      act(() => {
        result.current.setDateRange(newRange)
      })

      expect(result.current.dateRange).toEqual(newRange)
    })
  })

  describe('timezone', () => {
    it('returns timezone from useTimezone hook', () => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useFinancialDateRange(), { wrapper })
      expect(result.current.timezone).toBe('UTC')
    })
  })
})

describe('useFinancialDateRange — demo mode', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('initializes with a fixed demo date range when isDemoMode is true', async () => {
    vi.doMock('@/app/services/api.utils', () => ({
      isDemoMode: true,
      isUseMockdataEnabled: true,
      isSaveMockdataEnabled: false,
    }))

    vi.doMock('@/hooks/useTimezone', () => ({
      default: () => ({
        timezone: 'UTC',
        getFormattedDate: (d: Date) => d.toISOString(),
        changeTimezone: vi.fn(),
      }),
    }))

    const { useFinancialDateRange: useDemoHook } = await import('./useFinancialDateRange')

    const store = configureStore({
      reducer: {
        multiSite: multiSiteSlice.reducer,
        timezone: timezoneSlice.reducer,
      },
    })
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider as React.ElementType, { store }, children)

    const { result } = renderHook(() => useDemoHook(), { wrapper })

    // In demo mode, dateRange is initialized immediately with fixed timestamps
    expect(result.current.dateRange).not.toBeNull()
    expect(result.current.dateRange?.start).toBe(1769025600000)
    expect(result.current.dateRange?.end).toBe(1769630399999)
  })
})
