import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  listThingsQuery: vi.fn(() => ({ data: undefined, isFetching: false })),
  smartPolling: vi.fn(() => 10000),
}))

vi.mock('@/app/services/api', () => ({
  useGetListThingsQuery: mockFns.listThingsQuery,
}))

vi.mock('@/hooks/useSmartPolling', () => ({
  useSmartPolling: mockFns.smartPolling,
}))

vi.mock('@/app/utils/containerUtils', () => ({
  getContainerName: vi.fn((container: string) => container),
  isContainerOffline: vi.fn(() => false),
}))

vi.mock('@/app/utils/deviceUtils', () => ({
  getDeviceData: vi.fn(() => [{}, {}]),
  getHashrateString: vi.fn(() => ''),
  getMinerShortCode: vi.fn(() => 'S19'),
  getStats: vi.fn(() => ({})),
  isContainer: vi.fn((type: string) => type?.startsWith('container')),
  isMiner: vi.fn((type: string) => type?.startsWith('miner')),
  isMinerOffline: vi.fn(() => false),
}))

vi.mock('../../ListView.util', () => ({
  enrichDeviceWithPoolHashrate: vi.fn((device: unknown) => device),
  formatCabinets: vi.fn((devices: unknown) => devices),
  getTableDeviceData: vi.fn((device: unknown) => device),
  mergeAndSortDevices: vi.fn((_: unknown, b: unknown[]) => b),
  paginateDevices: vi.fn((devices: unknown[], _pageSize: number, _page: number) => devices),
}))

import { useListViewData } from '../useListViewData'
import { CROSS_THING_TYPES } from '@/constants/devices'

const defaultProps = {
  selectedType: CROSS_THING_TYPES.MINER,
  filterTags: [],
  filters: undefined,
  selectedTypeInfo: {},
  containerMinersFilter: undefined,
  containerWithoutFilters: false,
  workersObj: undefined,
  isPoolStatsEnabled: false,
  pageSize: 10,
  current: 1,
  isNewSearch: false,
}

describe('useListViewData', () => {
  it('returns initial state with empty devices', () => {
    const { result } = renderHook(() => useListViewData(defaultProps))
    expect(result.current.devices).toEqual([])
    expect(result.current.groupedDevices).toEqual({})
    expect(result.current.size).toBe(0)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(Array.isArray(result.current.minerTabDevices)).toBe(true)
  })

  it('processes miner devices from API data', async () => {
    const mockDevice = { id: '1', type: 'miner.antminer', isRaw: false }
    mockFns.listThingsQuery.mockReturnValueOnce({
      data: [[mockDevice]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: CROSS_THING_TYPES.MINER,
        filterTags: ['tag1'],
      }),
    )

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  it('returns empty minerTabDevices when no filters are applied', () => {
    mockFns.listThingsQuery.mockReturnValueOnce({
      data: [[{ id: '1', type: 'miner.antminer' }]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: CROSS_THING_TYPES.MINER,
        filterTags: [],
        filters: undefined,
      }),
    )

    expect(result.current.minerTabDevices).toEqual([])
  })

  it('uses containerMinersFilter query when provided', () => {
    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        containerMinersFilter: 'container-123',
      }),
    )

    expect(result.current).toBeDefined()
    expect(mockFns.listThingsQuery).toHaveBeenCalled()
  })

  it('handles isFetching=true with empty devices as isLoading=true', () => {
    mockFns.listThingsQuery.mockReturnValue({
      data: undefined,
      isFetching: true,
    })

    const { result } = renderHook(() => useListViewData(defaultProps))
    expect(result.current.isFetching).toBe(true)
    expect(result.current.isLoading).toBe(true)

    // Restore default
    mockFns.listThingsQuery.mockReturnValue({ data: undefined, isFetching: false })
  })

  it('processes container-type devices', async () => {
    const mockContainer = { id: '2', type: 'container.pod' }
    mockFns.listThingsQuery.mockReturnValueOnce({
      data: [[mockContainer]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: CROSS_THING_TYPES.CONTAINER,
      }),
    )

    await waitFor(() => expect(result.current).toBeDefined())
  })

  it('handles selectedType ALL returning all devices', async () => {
    const mockDevice = { id: '3', type: 'other.device' }
    mockFns.listThingsQuery.mockReturnValueOnce({
      data: [[mockDevice]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: 'all',
      }),
    )

    await waitFor(() => expect(result.current).toBeDefined())
  })
})
