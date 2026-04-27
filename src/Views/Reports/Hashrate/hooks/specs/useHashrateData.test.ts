import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, type Mock } from 'vitest'

import { useHashrateData } from '../useHashrateData'

import { useGetMetricsHashrateGroupedQuery } from '@/app/services/api'

vi.mock('@/app/services/api', () => ({
  useGetMetricsHashrateGroupedQuery: vi.fn(),
}))

const mockedQuery = vi.mocked(useGetMetricsHashrateGroupedQuery) as unknown as Mock

const okResponse = {
  data: {
    log: [{ ts: 1, hashrateMhs: { 'miner-am-s19xp': 5_000_000 } }],
    summary: {},
  },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
}

describe('useHashrateData', () => {
  it('passes start/end/groupBy to the v2 grouped query and returns its result', () => {
    mockedQuery.mockReturnValue(okResponse)
    const { result } = renderHook(() =>
      useHashrateData({ dateRange: { start: 1, end: 2 }, groupBy: 'miner' }),
    )
    expect(mockedQuery).toHaveBeenCalledWith(
      { start: 1, end: 2, groupBy: 'miner' },
      { skip: false },
    )
    expect(result.current.data).toBe(okResponse.data)
  })

  it('isLoading is true when isFetching is true', () => {
    mockedQuery.mockReturnValue({ ...okResponse, isLoading: false, isFetching: true })
    const { result } = renderHook(() =>
      useHashrateData({ dateRange: { start: 1, end: 2 }, groupBy: 'container' }),
    )
    expect(result.current.isLoading).toBe(true)
  })

  it('forwards skip=true to the underlying query', () => {
    mockedQuery.mockReturnValue(okResponse)
    renderHook(() =>
      useHashrateData({ dateRange: { start: 1, end: 2 }, groupBy: 'miner', skip: true }),
    )
    expect(mockedQuery).toHaveBeenCalledWith(expect.any(Object), { skip: true })
  })

  it('uses default 7-day-ending-yesterday range when no dateRange provided', () => {
    mockedQuery.mockReturnValue(okResponse)
    const { result } = renderHook(() => useHashrateData({ groupBy: 'miner' }))
    expect(typeof result.current.queryParams.start).toBe('number')
    expect(typeof result.current.queryParams.end).toBe('number')
    expect(result.current.queryParams.end).toBeGreaterThan(result.current.queryParams.start)
  })
})
