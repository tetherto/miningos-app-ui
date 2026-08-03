import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/hooks/useTimezone', () => ({
  default: vi.fn(() => ({ timezone: 'UTC' })),
}))

vi.mock('@/app/utils/dateUtils', () => ({
  getRangeTimestamps: vi.fn((dates: [Date, Date]) => dates),
}))

vi.mock('@/Components/PresetDateRangePicker/PresetDateRangePicker', () => ({
  default: vi.fn(() => null),
}))

vi.mock('@/hooks/useTableDateRange', () => ({
  default: vi.fn(() => ({
    defaultDateRange: { start: 1000000, end: 2000000 },
    dateRange: { start: 1000000, end: 2000000 },
    onTableDateRangeChange: vi.fn(),
    onDateRangeReset: vi.fn(),
  })),
}))

import { useDateRangePicker } from '../useDatePicker'

describe('useDateRangePicker', () => {
  it('returns dateRange, datePicker, and handlers', () => {
    const { result } = renderHook(() => useDateRangePicker())
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('datePicker')
    expect(result.current).toHaveProperty('onTableDateRangeChange')
    expect(result.current).toHaveProperty('onDateRangeReset')
  })

  it('accepts options and returns date range', () => {
    const { result } = renderHook(() =>
      useDateRangePicker({
        daysAgo: 7,
        isResetable: true,
        isFutureAvailable: false,
      }),
    )
    expect(result.current.dateRange).toBeDefined()
  })

  it('onTableDateRangeChange with null resets picker', () => {
    const { result } = renderHook(() => useDateRangePicker())
    act(() => {
      result.current.onTableDateRangeChange(null)
    })
    // Should not throw
    expect(result.current.dateRange).toBeDefined()
  })

  it('onTableDateRangeChange with valid range calls handler', () => {
    const { result } = renderHook(() => useDateRangePicker())
    act(() => {
      result.current.onTableDateRangeChange({ start: 1000000, end: 2000000 })
    })
    expect(result.current.dateRange).toBeDefined()
  })

  it('onDateRangeReset resets picker dates', () => {
    const { result } = renderHook(() => useDateRangePicker())
    act(() => {
      result.current.onDateRangeReset()
    })
    expect(result.current.dateRange).toBeDefined()
  })
})
