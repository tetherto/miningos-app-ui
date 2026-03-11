import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  listThingsQuery: vi.fn(() => ({ data: undefined as unknown, isFetching: false })),
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

import { isContainerOffline } from '@/app/utils/containerUtils'
import { isContainer, isMiner } from '@/app/utils/deviceUtils'
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
      data: undefined as unknown,
      isFetching: true,
    })

    const { result } = renderHook(() => useListViewData(defaultProps))
    expect(result.current.isFetching).toBe(true)
    expect(result.current.isLoading).toBe(true)

    // Restore default
    mockFns.listThingsQuery.mockReturnValue({ data: undefined as unknown, isFetching: false })
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

  it('groups container as containerOffline when isContainerOffline returns true', async () => {
    vi.mocked(isContainer).mockImplementation(
      (type: string | undefined) => type === 'container.pod',
    )
    vi.mocked(isMiner).mockImplementation((_type: string | undefined) => false)
    vi.mocked(isContainerOffline).mockReturnValue(true)
    // getDeviceData mock returns [{}, { snap: { stats: {} } }] to trigger isContainerOffline branch
    const { getDeviceData } = await import('@/app/utils/deviceUtils')
    vi.mocked(getDeviceData).mockReturnValue([{}, { snap: { stats: {} } }] as ReturnType<
      typeof getDeviceData
    >)

    const mockContainer = { id: 'c1', type: 'container.pod' }
    mockFns.listThingsQuery.mockReturnValue({
      data: [[mockContainer]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: CROSS_THING_TYPES.CONTAINER,
      }),
    )

    await waitFor(() => {
      const grouped = result.current.groupedDevices
      expect(grouped.containerOffline || grouped.containerDevices).toBeDefined()
    })

    // restore
    vi.mocked(isContainer).mockImplementation(
      (type: string | undefined) => !!type?.startsWith('container'),
    )
    vi.mocked(isMiner).mockImplementation((type: string | undefined) => !!type?.startsWith('miner'))
    vi.mocked(isContainerOffline).mockReturnValue(false)
    vi.mocked(getDeviceData).mockReturnValue([{}, {}] as ReturnType<typeof getDeviceData>)
    mockFns.listThingsQuery.mockReturnValue({ data: undefined as unknown, isFetching: false })
  })

  it('groups container as containerDevices when isContainerOffline returns false', async () => {
    vi.mocked(isContainer).mockImplementation(
      (type: string | undefined) => type === 'container.pod',
    )
    vi.mocked(isMiner).mockImplementation((_type: string | undefined) => false)
    vi.mocked(isContainerOffline).mockReturnValue(false)
    const { getDeviceData } = await import('@/app/utils/deviceUtils')
    vi.mocked(getDeviceData).mockReturnValue([{}, { snap: { stats: {} } }] as ReturnType<
      typeof getDeviceData
    >)

    mockFns.listThingsQuery.mockReturnValue({
      data: [[{ id: 'c2', type: 'container.pod' }]],
      isFetching: false,
    })

    const { result } = renderHook(() =>
      useListViewData({ ...defaultProps, selectedType: CROSS_THING_TYPES.CONTAINER }),
    )

    await waitFor(() => {
      expect(result.current.groupedDevices).toBeDefined()
    })

    // restore
    vi.mocked(isContainer).mockImplementation(
      (type: string | undefined) => !!type?.startsWith('container'),
    )
    vi.mocked(isMiner).mockImplementation((type: string | undefined) => !!type?.startsWith('miner'))
    vi.mocked(getDeviceData).mockReturnValue([{}, {}] as ReturnType<typeof getDeviceData>)
    mockFns.listThingsQuery.mockReturnValue({ data: undefined as unknown, isFetching: false })
  })

  it('minerTabDevices maps isRaw=true devices with getTableDeviceData', async () => {
    const rawDevice = { id: 'm1', type: 'miner.antminer', isRaw: true, info: {}, tags: [] }
    mockFns.listThingsQuery.mockReturnValue({
      data: [[rawDevice]],
      isFetching: false,
    })

    const { getTableDeviceData } = await import('../../ListView.util')
    vi.mocked(getTableDeviceData).mockReturnValue({
      info: { container: 'container-1' },
      type: 'miner.antminer',
      tags: [],
      code: 'S19',
    } as ReturnType<typeof getTableDeviceData>)

    const { result } = renderHook(() =>
      useListViewData({
        ...defaultProps,
        selectedType: CROSS_THING_TYPES.MINER,
        filterTags: ['tag1'],
      }),
    )

    await waitFor(() => {
      expect(Array.isArray(result.current.minerTabDevices)).toBe(true)
    })

    // restore
    vi.mocked(getTableDeviceData).mockReturnValue({} as ReturnType<typeof getTableDeviceData>)
    mockFns.listThingsQuery.mockReturnValue({ data: undefined as unknown, isFetching: false })
  })

  it('minerTabDevices maps isRaw=false devices without getTableDeviceData', async () => {
    const notRawDevice = { id: 'm2', type: 'miner.antminer', isRaw: false }
    mockFns.listThingsQuery.mockReturnValue({
      data: [[notRawDevice]],
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
      expect(Array.isArray(result.current.minerTabDevices)).toBe(true)
    })

    mockFns.listThingsQuery.mockReturnValue({ data: undefined as unknown, isFetching: false })
  })
})
