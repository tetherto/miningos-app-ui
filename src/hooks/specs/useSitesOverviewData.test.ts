import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useSitesOverviewData } from '../useSitesOverviewData'

import * as api from '@/app/services/api'
import { CONTAINER_STATUS } from '@/app/utils/statusUtils'
import { SITE_OVERVIEW_STATUSES } from '@/Components/PoolManager/PoolManager.constants'
import * as containerWidgetUtil from '@/Views/ContainerWidgets/ContainerWidget.util'

// Mock dependencies
vi.mock('@/app/services/api')
vi.mock('@/Views/ContainerWidgets/ContainerWidget.util')

describe('useSitesOverviewData', () => {
  const mockUnitsData = [
    [
      {
        id: 'unit1',
        type: 'container-bd-d40',
        info: {
          container: 'container-bd-d40',
          nominalMinerCapacity: '100',
        },
        last: {
          snap: {
            stats: {
              status: CONTAINER_STATUS.RUNNING,
            },
          },
        },
      },
      {
        id: 'unit2',
        type: 'container-bd-d50',
        info: {
          container: 'container-bd-d50',
          nominalMinerCapacity: '50',
        },
        last: {
          snap: {
            stats: {
              status: CONTAINER_STATUS.OFFLINE,
            },
          },
        },
      },
      {
        id: 'unit3',
        type: 'container-bd-d60',
        info: {
          container: 'container-bd-d60',
          nominalMinerCapacity: '75',
        },
        last: {
          snap: {
            stats: {
              status: CONTAINER_STATUS.STOPPED,
            },
          },
        },
      },
    ],
  ]

  const mockMinerTailLogData = [
    {
      hashrate_mhs_1m_group_sum_aggr: {
        'container-bd-d40': 1000000, // 1 PH/s
        'container-bd-d50': 500000, // 0.5 PH/s
        'container-bd-d60': 0,
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useGetListThingsQuery
    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: mockUnitsData,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    // Mock useGetTailLogQuery
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: mockMinerTailLogData,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    // Mock getContainerMinersChartData
    vi.mocked(containerWidgetUtil.getContainerMinersChartData).mockImplementation(
      (container, _tailLog, capacity) => ({
        total: capacity,
        disconnected: 10,
        actualMiners: capacity - 10,
      }),
    )
  })

  it('should return processed units with correct data structure', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units).toBeDefined()
    expect(Array.isArray(result.current.units)).toBe(true)
    expect(result.current.units).toHaveLength(3)

    // Check first unit structure
    const firstUnit = result.current.units[0]
    expect(firstUnit).toHaveProperty('id')
    expect(firstUnit).toHaveProperty('type')
    expect(firstUnit).toHaveProperty('info')
    expect(firstUnit).toHaveProperty('miners')
    expect(firstUnit).toHaveProperty('hashrate')
    expect(firstUnit).toHaveProperty('status')
  })

  it('should correctly determine status for running containers', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    const runningUnit = result.current.units[0]
    expect(runningUnit.last?.snap?.stats?.status).toBe(CONTAINER_STATUS.RUNNING)
    expect(runningUnit.status).toBe(SITE_OVERVIEW_STATUSES.MINING)
  })

  it('should correctly determine status for offline containers', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    const offlineUnit = result.current.units[1]
    expect(offlineUnit.last?.snap?.stats?.status).toBe(CONTAINER_STATUS.OFFLINE)
    expect(offlineUnit.status).toBe(SITE_OVERVIEW_STATUSES.OFFLINE)
  })

  it('should correctly determine status for stopped containers', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    const stoppedUnit = result.current.units[2]
    expect(stoppedUnit.last?.snap?.stats?.status).toBe(CONTAINER_STATUS.STOPPED)
    expect(stoppedUnit.status).toBe(SITE_OVERVIEW_STATUSES.OFFLINE)
  })

  it('should calculate hashrate for each unit', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    result.current.units.forEach((unit) => {
      expect(unit.hashrate).toBeDefined()
      expect(typeof unit.hashrate).toBe('string')
    })
  })

  it('should add miners data to each unit', () => {
    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units[0].miners).toEqual({
      total: 100,
      disconnected: 10,
      actualMiners: 90,
    })

    expect(result.current.units[1].miners).toEqual({
      total: 50,
      disconnected: 10,
      actualMiners: 40,
    })

    expect(containerWidgetUtil.getContainerMinersChartData).toHaveBeenCalledTimes(3)
  })

  it('should return loading state correctly when units are loading', () => {
    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.isLoading).toBe(true)
  })

  it('should return loading state correctly when tail log is loading', () => {
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle empty units data', () => {
    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: [[]],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle non-array units data', () => {
    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof api.useGetListThingsQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle missing hashrate data in tail log', () => {
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: [{ hashrate_mhs_1m_group_sum_aggr: {} }],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    result.current.units.forEach((unit) => {
      expect(unit.hashrate).toBeDefined()
      expect(typeof unit.hashrate).toBe('string')
    })
  })

  it('should handle units without last.snap.stats.status', () => {
    const unitsWithoutStatus = [
      [
        {
          id: 'unit1',
          type: 'container-bd-d40',
          info: {
            container: 'container-bd-d40',
            nominalMinerCapacity: '100',
          },
        },
      ],
    ]

    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: unitsWithoutStatus,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units[0].status).toBe(SITE_OVERVIEW_STATUSES.OFFLINE)
  })

  it('should handle units with missing info', () => {
    const unitsWithMissingInfo = [
      [
        {
          id: 'unit1',
          type: 'container-bd-d40',
          last: {
            snap: {
              stats: {
                status: CONTAINER_STATUS.RUNNING,
              },
            },
          },
        },
      ],
    ]

    vi.mocked(api.useGetListThingsQuery).mockReturnValue({
      data: unitsWithMissingInfo,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetListThingsQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units[0].hashrate).toBeDefined()
    expect(result.current.units[0].miners).toBeDefined()
  })

  it('should call API hooks with correct parameters', () => {
    renderHook(() => useSitesOverviewData())

    expect(api.useGetListThingsQuery).toHaveBeenCalledWith({
      query: JSON.stringify({ tags: { $in: ['t-container'] } }),
      status: 1,
      fields: JSON.stringify({
        id: 1,
        type: 1,
        info: 1,
        'last.snap.stats.status': 1,
      }),
    })

    expect(api.useGetTailLogQuery).toHaveBeenCalledWith({
      key: 'stat-rtd',
      type: 'miner',
      tag: 't-miner',
      limit: 1,
    })
  })

  it('should handle empty tail log data', () => {
    vi.mocked(api.useGetTailLogQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof api.useGetTailLogQuery>)

    const { result } = renderHook(() => useSitesOverviewData())

    expect(result.current.units).toHaveLength(3)
    result.current.units.forEach((unit) => {
      expect(unit.hashrate).toBeDefined()
    })
  })
})
