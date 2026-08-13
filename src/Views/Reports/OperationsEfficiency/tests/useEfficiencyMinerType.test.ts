import { renderHook } from '@testing-library/react'
import { describe, expect, it, Mock, vi } from 'vitest'

import { TAIL_LOG_MINER_TYPE_KEY } from '../constants'
import { useEfficiencyMinerType } from '../hooks/useEfficiencyMinerType'

import { useGetTailLogQuery } from '@/app/services/api'
import { MINER_TYPE_NAME_MAP } from '@/constants/deviceConstants'

vi.mock('@/app/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/services/api')>()

  return {
    ...actual,
    useGetTailLogQuery: vi.fn(),
  }
})

const mockedUseGetTailLogQuery = vi.mocked(useGetTailLogQuery) as unknown as Mock

describe('useEfficiencyMinerType', () => {
  const start = new Date(1000)
  const end = new Date(2000)

  const mockTailLog = [
    {
      [TAIL_LOG_MINER_TYPE_KEY]: {
        'miner-am-s19xp': 90,
        'miner-wm-m53s': 85,
      },
    },
  ]

  it('should return formatted labels and data from API response', () => {
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: mockTailLog,
      isLoading: false,
      isFetching: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerType({ start, end }))

    const { data, isLoading } = result.current

    expect(isLoading).toBe(false)

    expect(data.labels).toEqual([
      MINER_TYPE_NAME_MAP['miner-am-s19xp'],
      MINER_TYPE_NAME_MAP['miner-wm-m53s'],
    ])

    expect(data.dataSet1.data).toEqual([90, 85])
  })

  it('should set loading when API is loading or fetching', () => {
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerType({ start, end }))

    expect(result.current.isLoading).toBe(true)
  })
})
