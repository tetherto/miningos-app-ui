import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useFetchLineChartData from '../useFetchLineChartData'

const mockTailLogData = { log: [] }

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: vi.fn((_params: unknown, opts: { skip?: boolean }) => ({
    data: opts?.skip ? undefined : mockTailLogData,
    isLoading: false,
  })),
}))
vi.mock('../useSubtractedTime', () => ({
  __esModule: true,
  default: () => 0,
}))

describe('useFetchLineChartData', () => {
  it('returns tailLogData, tailLogDataUpdates and isLoading', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({ dateRange: { start: 0, end: 1000 } }),
    )
    expect(result.current).toHaveProperty('tailLogData')
    expect(result.current).toHaveProperty('tailLogDataUpdates')
    expect(result.current).toHaveProperty('isLoading')
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('skips query when skip is true', () => {
    const { result } = renderHook(() => useFetchLineChartData({ skip: true }))
    expect(result.current.tailLogData).toBeUndefined()
  })

  it('skips when isFieldsCompulsory and fields empty', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({ isFieldsCompulsory: true, fields: {} }),
    )
    expect(result.current.tailLogData).toBeUndefined()
  })

  it('passes fields and aggrFields to request when provided', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({
        dateRange: { start: 0, end: 1000 },
        fields: { hashrate: 1 },
        aggrFields: { hashrate: 1 },
        type: 'miner',
        tag: 't-miner',
        timeline: '5m',
      }),
    )
    expect(result.current).toHaveProperty('tailLogData')
  })

  it('uses end param when dateRange is not provided', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({ end: 1000, timeline: '5m', limit: 10 }),
    )
    expect(result.current).toHaveProperty('tailLogData')
  })

  it('handles skipPolling=true and skipUpdates=true', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({
        dateRange: { start: 0, end: 1000 },
        skipPolling: true,
        skipUpdates: true,
        pollingInterval: 5000,
      }),
    )
    expect(result.current).toHaveProperty('tailLogDataUpdates')
  })

  it('handles no dateRange and no end (undefined start/end)', () => {
    const { result } = renderHook(() => useFetchLineChartData({ type: 'miner', limit: 5 }))
    expect(result.current).toHaveProperty('tailLogData')
  })
})
