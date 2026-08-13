import { renderHook } from '@testing-library/react'
import { describe, expect, it, Mock, vi } from 'vitest'

import { TAIL_LOG_CONTAINER_KEY } from '../constants'
import { useEfficiencyMinerUnit } from '../hooks/useEfficiencyMinerUnit.js'

import { useGetListThingsQuery, useGetTailLogQuery } from '@/app/services/api'

vi.mock('@/app/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/services/api')>()

  return {
    ...actual,
    useGetTailLogQuery: vi.fn(),
    useGetListThingsQuery: vi.fn(),
  }
})

const mockedUseGetTailLogQuery = vi.mocked(useGetTailLogQuery) as unknown as Mock
const mockedUseGetListThingsQuery = vi.mocked(useGetListThingsQuery) as unknown as Mock

describe('useEfficiencyMinerUnit', () => {
  const start = new Date(2025, 0, 1)
  const end = new Date(2025, 0, 2)

  const mockTailLog = {
    [TAIL_LOG_CONTAINER_KEY]: {
      c1: 500,
      c2: 0,
      c3: 700,
      c4: 'not_number',
    },
  }

  const mockContainers = [
    {
      info: { container: 'emca-1' },
      type: 'container-emca-emca',
    },
    {
      info: { container: 'bitmain-hydro-1' },
      type: 'container-as-hk3',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return filtered categories (value > 0), labels and dataset', () => {
    // Mock API results
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: [mockTailLog],
      isLoading: false,
      isFetching: false,
    })

    vi.mocked(mockedUseGetListThingsQuery).mockReturnValue({
      data: [mockContainers],
      isLoading: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerUnit({ start, end }))

    const { data } = result.current

    expect(data.labels).toEqual(['c1', 'c3'])
    expect(data.dataSet1.data).toEqual([500, 700])
  })

  it('should return raw category name when container type not found', () => {
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: [
        {
          [TAIL_LOG_CONTAINER_KEY]: { x1: 100 },
        },
      ],
      isLoading: false,
      isFetching: false,
    })

    vi.mocked(mockedUseGetListThingsQuery).mockReturnValue({
      data: [[]],
      isLoading: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerUnit({ start, end }))

    expect(result.current.data.labels).toEqual(['x1'])
    expect(result.current.data.dataSet1.data).toEqual([100])
  })

  it('should handle empty API response gracefully', () => {
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    })

    vi.mocked(mockedUseGetListThingsQuery).mockReturnValue({
      data: [[]],
      isLoading: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerUnit({ start, end }))

    expect(result.current.data.labels).toEqual([])
    expect(result.current.data.dataSet1.data).toEqual([])
  })

  it('should combine loading states', () => {
    vi.mocked(mockedUseGetTailLogQuery).mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
    })

    vi.mocked(mockedUseGetListThingsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    })

    const { result } = renderHook(() => useEfficiencyMinerUnit({ start, end }))

    expect(result.current.isLoading).toBe(true)
  })
})
