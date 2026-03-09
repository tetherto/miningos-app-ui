import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { useProfitabilityHistoryData } from '../useProfitabilityHistoryData'

import { timezoneSlice } from '@/app/slices/timezoneSlice'

vi.mock('@/app/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/services/api')>()
  return {
    ...actual,
    useGetTailLogQuery: () => ({
      data: [[{ hourlyRevenues: [] }]],
      isLoading: false,
    }),
    useGetExtDataQuery: () => ({
      data: [[{ hourly_estimates: [] }]],
      isLoading: false,
    }),
  }
})

const createWrapper = () => {
  const store = configureStore({
    reducer: { timezone: timezoneSlice.reducer },
    preloadedState: { timezone: { timezone: 'UTC' } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe('useProfitabilityHistoryData', () => {
  it('returns data and isLoading', () => {
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
  })
})
