import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'

import { useProfitabilityHistoryData } from '../useProfitabilityHistoryData'

import { timezoneSlice } from '@/app/slices/timezoneSlice'

const mockFns = vi.hoisted(() => ({
  tailLogQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
  extDataQuery: vi.fn(() => ({ data: undefined as unknown, isLoading: false })),
}))

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: mockFns.tailLogQuery,
  useGetExtDataQuery: mockFns.extDataQuery,
}))

vi.mock('@/app/utils/electricityUtils', () => ({
  transformCostRevenueData: vi.fn((data: unknown) => data),
}))

vi.mock('@/hooks/useTimezone', () => ({
  default: vi.fn(() => ({ timezone: 'UTC', getFormattedDate: vi.fn((d: unknown) => String(d)) })),
}))

const createWrapper = () => {
  const store = configureStore({
    reducer: { timezone: timezoneSlice.reducer },
    preloadedState: { timezone: { timezone: 'UTC' } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const TS1 = 1700000000000
const TS2 = 1700003600000

describe('useProfitabilityHistoryData', () => {
  it('returns data and isLoading when no data available', () => {
    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: 0, end: Date.now() },
        }),
      { wrapper: createWrapper() },
    )
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current.data).toHaveProperty('yTicksFormatter')
    expect(result.current.data).toHaveProperty('timeRange')
    expect(result.current.data).toHaveProperty('datasets')
    expect(Array.isArray(result.current.data.datasets)).toBe(true)
    expect(result.current.data.datasets).toHaveLength(3)
  })

  it('yTicksFormatter formats a value correctly', () => {
    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: 0, end: Date.now() },
        }),
      { wrapper: createWrapper() },
    )
    const formatted = result.current.data.yTicksFormatter(100)
    expect(typeof formatted).toBe('string')
  })

  it('processes hourlyRevenues from tail log data', () => {
    mockFns.tailLogQuery.mockReturnValue({
      data: [
        {
          hourlyRevenues: [
            { ts: TS1, revenue: 0.5 },
            { ts: TS2, revenue: 0.7 },
          ],
        },
      ],
      isLoading: false,
    })
    mockFns.extDataQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })

    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: TS1, end: TS2 },
        }),
      { wrapper: createWrapper() },
    )

    expect(result.current.data.datasets[0].data.length).toBeGreaterThan(0)
    expect(result.current.data.timeRange.start).toBe(TS1)
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('processes hourly_estimates from electricity data', () => {
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
    mockFns.extDataQuery.mockReturnValue({
      data: [
        {
          hourly_estimates: [
            { ts: TS1, revenue: 0.4, energyCost: 0.1 },
            { ts: TS2, revenue: 0.6, energyCost: 0.2 },
          ],
        },
      ],
      isLoading: false,
    })

    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: TS1, end: TS2 },
        }),
      { wrapper: createWrapper() },
    )

    expect(result.current.data.datasets[1].data.length).toBeGreaterThan(0)
    mockFns.extDataQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('handles non-finite revenue values with getFloatValue fallback', () => {
    mockFns.tailLogQuery.mockReturnValue({
      data: [{ hourlyRevenues: [{ ts: TS1, revenue: NaN }] }],
      isLoading: false,
    })
    mockFns.extDataQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })

    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: TS1, end: TS2 },
        }),
      { wrapper: createWrapper() },
    )

    const forecastedDataset = result.current.data.datasets[0]
    expect(forecastedDataset.data[0].y).toBe(0)
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('handles loading states', () => {
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: true })
    mockFns.extDataQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })

    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: 0, end: Date.now() },
        }),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(true)
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
  })

  it('handles missing hourlyRevenues (null/undefined)', () => {
    mockFns.tailLogQuery.mockReturnValue({
      data: [{ someOtherField: 'value' }],
      isLoading: false,
    })
    mockFns.extDataQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })

    const { result } = renderHook(
      () =>
        useProfitabilityHistoryData({
          dateRange: { start: TS1, end: TS2 },
        }),
      { wrapper: createWrapper() },
    )

    expect(result.current.data.datasets[0].data).toHaveLength(0)
    mockFns.tailLogQuery.mockReturnValue({ data: undefined as unknown, isLoading: false })
  })
})
