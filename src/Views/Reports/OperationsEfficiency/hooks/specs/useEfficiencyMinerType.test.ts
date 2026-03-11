import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  tailLogQuery: vi.fn(() => ({ data: undefined, isLoading: false, isFetching: false })),
}))

vi.mock('@/app/services/api', () => ({
  useGetTailLogQuery: mockFns.tailLogQuery,
}))

vi.mock('@/Views/Reports/OperationsEfficiency/constants', () => ({
  TAIL_LOG_MINER_TYPE_KEY: 'val.minerType',
}))

vi.mock('@/constants/deviceConstants', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/constants/deviceConstants')>()
  return {
    ...original,
    MINER_TYPE_NAME_MAP: {
      'miner-antminer': 'Antminer',
      'miner-whatsminer': 'Whatsminer',
    },
  }
})

import { useEfficiencyMinerType } from '../useEfficiencyMinerType'

const defaultParams = { start: new Date('2024-01-01'), end: new Date('2024-01-31') }

describe('useEfficiencyMinerType', () => {
  it('returns data with labels and dataset, and isLoading flag', () => {
    const { result } = renderHook(() => useEfficiencyMinerType(defaultParams))
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current.data).toHaveProperty('labels')
    expect(result.current.data).toHaveProperty('dataSet1')
    expect(result.current.isLoading).toBe(false)
  })

  it('returns empty labels and dataSet when no tail log data', () => {
    const { result } = renderHook(() => useEfficiencyMinerType(defaultParams))
    expect(result.current.data.labels).toEqual([])
    expect(result.current.data.dataSet1.data).toEqual([])
  })

  it('returns isLoading=true when query is loading', () => {
    mockFns.tailLogQuery.mockReturnValueOnce({ data: undefined, isLoading: true, isFetching: false })
    const { result } = renderHook(() => useEfficiencyMinerType(defaultParams))
    expect(result.current.isLoading).toBe(true)
  })

  it('returns isLoading=true when query is fetching', () => {
    mockFns.tailLogQuery.mockReturnValueOnce({ data: undefined, isLoading: false, isFetching: true })
    const { result } = renderHook(() => useEfficiencyMinerType(defaultParams))
    expect(result.current.isLoading).toBe(true)
  })

  it('processes tail log data with miner type categories', () => {
    const tailLogWithMiners = {
      'val.minerType': {
        'miner-antminer': 85,
        'miner-whatsminer': 78,
      },
    }
    mockFns.tailLogQuery.mockReturnValueOnce({
      data: [tailLogWithMiners],
      isLoading: false,
      isFetching: false,
    })
    const { result } = renderHook(() => useEfficiencyMinerType(defaultParams))
    expect(result.current.data.labels).toBeDefined()
  })
})
