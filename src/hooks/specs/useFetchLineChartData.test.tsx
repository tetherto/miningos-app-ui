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
    const { result } = renderHook(() =>
      useFetchLineChartData({ skip: true }),
    )
    expect(result.current.tailLogData).toBeUndefined()
  })

  it('skips when isFieldsCompulsory and fields empty', () => {
    const { result } = renderHook(() =>
      useFetchLineChartData({ isFieldsCompulsory: true, fields: {} }),
    )
    expect(result.current.tailLogData).toBeUndefined()
  })
})
