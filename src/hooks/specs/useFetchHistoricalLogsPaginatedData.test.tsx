import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useFetchHistoricalLogsPaginatedData,
  updateHistoricalData,
} from '../useFetchHistoricalLogsPaginatedData'

const mockUnwrap = vi.fn()
const mockLazyQuery = vi.fn()

vi.mock('@/app/services/api', () => ({
  useLazyGetHistoricalLogsQuery: () => [mockLazyQuery],
}))

describe('useFetchHistoricalLogsPaginatedData', () => {
  beforeEach(() => {
    mockUnwrap.mockResolvedValue([])
    mockLazyQuery.mockReturnValue({ unwrap: () => mockUnwrap() })
  })

  it('returns data and isLoading', () => {
    const { result } = renderHook(() =>
      useFetchHistoricalLogsPaginatedData({
        start: Date.now() - 86400000,
        end: Date.now(),
        logType: 'info',
      }),
    )
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  it('does not fetch when start or end is missing', () => {
    const { result } = renderHook(() =>
      useFetchHistoricalLogsPaginatedData({ start: undefined, end: Date.now() }),
    )
    expect(result.current.data).toEqual([])
  })
})

describe('updateHistoricalData', () => {
  it('merges new data by uuid', () => {
    const prev = [{ uuid: 'a', x: 1 }] as { uuid: string; x: number }[]
    const data = [
      { uuid: 'a', x: 2 },
      { uuid: 'b', x: 3 },
    ] as { uuid: string; x: number }[]
    const out = updateHistoricalData(data, prev)
    expect(out).toHaveLength(2)
    expect(out[0].x).toBe(2)
    expect(out[1].uuid).toBe('b')
  })
})
