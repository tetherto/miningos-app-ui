import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'

import { useMinePoolDashboardData } from './useMinePoolDashboardData'

import { useGetExtDataQuery, useGetListRacksQuery } from '@/app/services/api'

vi.mock('@/app/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/services/api')>()
  return {
    ...actual,
    useGetListRacksQuery: vi.fn(),
    useGetExtDataQuery: vi.fn(),
  }
})

const mockUseGetListRacksQuery = vi.mocked(useGetListRacksQuery) as Mock
const mockUseGetExtDataQuery = vi.mocked(useGetExtDataQuery) as Mock

describe('useMinePoolDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should combine miner pools with matching stats', () => {
    mockUseGetListRacksQuery.mockReturnValue({
      data: [
        [
          {
            id: 1,
            rack: 'rack-1',
            type: 'pool-btc',
          },
        ],
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    mockUseGetExtDataQuery.mockReturnValue({
      data: [
        [
          {
            stats: [
              {
                poolType: 'btc',
                balance: 100,
                revenue_24h: 25,
              },
            ],
          },
        ],
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    const { result } = renderHook(() => useMinePoolDashboardData())

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]).toMatchObject({
      id: 1,
      rack: 'rack-1',
      stats: {
        poolType: 'btc',
        balance: 100,
        revenue_24h: 25,
      },
    })
  })

  it('should return empty data if APIs return empty arrays', () => {
    mockUseGetListRacksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    mockUseGetExtDataQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    const { result } = renderHook(() => useMinePoolDashboardData())

    expect(result.current.data).toEqual([])
  })

  it('should combine loading states', () => {
    mockUseGetListRacksQuery.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
      isError: false,
    })

    mockUseGetExtDataQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    const { result } = renderHook(() => useMinePoolDashboardData())

    expect(result.current.isLoading).toBe(true)
  })

  it('should combine fetching states', () => {
    mockUseGetListRacksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: true,
      isError: false,
    })

    mockUseGetExtDataQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    const { result } = renderHook(() => useMinePoolDashboardData())

    expect(result.current.isFetching).toBe(true)
  })

  it('should combine error states', () => {
    mockUseGetListRacksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: true,
    })

    mockUseGetExtDataQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    })

    const { result } = renderHook(() => useMinePoolDashboardData())

    expect(result.current.isError).toBe(true)
  })
})
