import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMinersStatusChartData } from '../useMinersStatusChartData'

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: () => ({
    data: [
      [
        {
          ts: 1,
          online_or_minor_error_miners_amount_aggr: 10,
          error_miners_amount_aggr: 0,
          not_mining_miners_amount_aggr: 0,
          offline_cnt: {},
          power_mode_sleep_cnt: {},
          maintenance_type_cnt: {},
        },
      ],
    ],
    isLoading: false,
    isFetching: false,
    error: undefined,
  }),
}))
vi.mock('@/app/services/api.utils', () => ({ isDemoMode: false }))

describe('useMinersStatusChartData', () => {
  it('returns chart data shape and time frame controls', () => {
    const { result } = renderHook(() => useMinersStatusChartData())
    expect(result.current).toHaveProperty('chartData')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('hasData')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('presetTimeFrame')
    expect(result.current).toHaveProperty('dateRange')
    expect(result.current).toHaveProperty('setPresetTimeFrame')
    expect(result.current).toHaveProperty('setDateRange')
  })

  it('has default preset time frame of 7', () => {
    const { result } = renderHook(() => useMinersStatusChartData())
    expect(result.current.presetTimeFrame).toBe(7)
  })

  it('setPresetTimeFrame is a function', () => {
    const { result } = renderHook(() => useMinersStatusChartData())
    expect(typeof result.current.setPresetTimeFrame).toBe('function')
    act(() => {
      result.current.setPresetTimeFrame(1)
    })
  })
})
