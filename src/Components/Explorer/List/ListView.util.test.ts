import { vi } from 'vitest'

import {
  enrichDeviceWithPoolHashrate,
  mergeAndSortDevices,
  paginateDevices,
  MINER_LIST_FILTER_OPTIONS,
  LIST_VIEW_FILTER_OPTIONS,
} from './ListView.util'

import type { Device } from '@/app/utils/deviceUtils/types'
import { MinerStatuses } from '@/app/utils/statusUtils'
import { CROSS_THING_TYPES } from '@/constants/devices'

describe('ListView filter options', () => {
  describe('MINER_LIST_FILTER_OPTIONS', () => {
    test('Status filter should not include maintenance and alert', () => {
      const statusFilter = MINER_LIST_FILTER_OPTIONS.find(
        (filter) => filter.value === 'last.snap.stats.status',
      )

      expect(statusFilter).toBeDefined()
      expect(statusFilter!.label).toBe('Status')

      const statusValues = statusFilter!.children.map((child) => child.value)

      expect(statusValues).not.toContain(MinerStatuses.MAINTENANCE)
      expect(statusValues).not.toContain(MinerStatuses.ALERT)
      expect(statusValues).toContain(MinerStatuses.MINING)
      expect(statusValues).toContain(MinerStatuses.OFFLINE)
      expect(statusValues).toContain(MinerStatuses.SLEEPING)
      expect(statusValues).toContain(MinerStatuses.ERROR)
    })
  })

  describe('LIST_VIEW_FILTER_OPTIONS', () => {
    test('Status filter should not include maintenance and alert', () => {
      const minerStatusFilter = LIST_VIEW_FILTER_OPTIONS.find(
        (filter) =>
          filter.value === 'last.snap.stats.status' &&
          (filter.tab as string[])?.includes(CROSS_THING_TYPES.MINER),
      )

      expect(minerStatusFilter).toBeDefined()
      expect(minerStatusFilter!.label).toBe('Status')

      const statusValues = minerStatusFilter!.children.map((child) => child.value)

      expect(statusValues).not.toContain(MinerStatuses.MAINTENANCE)
      expect(statusValues).not.toContain(MinerStatuses.ALERT)
      expect(statusValues).toContain(MinerStatuses.MINING)
      expect(statusValues).toContain(MinerStatuses.OFFLINE)
      expect(statusValues).toContain(MinerStatuses.SLEEPING)
      expect(statusValues).toContain(MinerStatuses.ERROR)
    })
  })
})

describe('enrichDeviceWithPoolHashrate', () => {
  const mockIsMiner = vi.fn()
  const mockIsMinerOffline = vi.fn()
  const mockGetStats = vi.fn()
  const mockGetHashrateString = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should enrich miner device with pool hashrate when conditions are met', () => {
    const device: Device = {
      id: 'miner-1',
      type: 'miner',
      last: {
        snap: {
          stats: {
            hashrate: 100,
          },
        },
      },
    } as Device

    const workersObj = {
      'miner-1': { hashrate: 150 },
    }

    mockIsMiner.mockReturnValue(true)
    mockIsMinerOffline.mockReturnValue(false)
    mockGetStats.mockReturnValue({ hashrate: 100 })
    mockGetHashrateString.mockReturnValue('150 TH/s')

    const result = enrichDeviceWithPoolHashrate(
      device,
      workersObj,
      mockIsMiner,
      mockIsMinerOffline,
      mockGetStats,
      mockGetHashrateString,
    )

    expect(result.last?.snap?.stats?.poolHashrate).toBe('150 TH/s')
    expect(result.isRaw).toBeUndefined()
    expect(mockIsMiner).toHaveBeenCalledWith('miner')
    expect(mockGetHashrateString).toHaveBeenCalledWith(150)
  })

  test('should mark device as raw when it is not a miner', () => {
    const device: Device = {
      id: 'container-1',
      type: 'container',
    } as Device

    mockIsMiner.mockReturnValue(false)

    const result = enrichDeviceWithPoolHashrate(
      device,
      undefined,
      mockIsMiner,
      mockIsMinerOffline,
      mockGetStats,
      mockGetHashrateString,
    )

    expect(result.isRaw).toBe(true)
    expect(result.last?.snap?.stats?.poolHashrate).toBeUndefined()
  })

  test('should mark device as raw when worker hashrate is not available', () => {
    const device: Device = {
      id: 'miner-1',
      type: 'miner',
      last: {
        snap: {
          stats: {
            hashrate: 100,
          },
        },
      },
    } as Device

    mockIsMiner.mockReturnValue(true)
    mockIsMinerOffline.mockReturnValue(false)
    mockGetStats.mockReturnValue({ hashrate: 100 })

    const result = enrichDeviceWithPoolHashrate(
      device,
      undefined,
      mockIsMiner,
      mockIsMinerOffline,
      mockGetStats,
      mockGetHashrateString,
    )

    expect(result.isRaw).toBe(true)
    expect(result.last?.snap?.stats?.poolHashrate).toBeUndefined()
  })

  test('should mark device as raw when miner is offline', () => {
    const device: Device = {
      id: 'miner-1',
      type: 'miner',
      last: {
        snap: {
          stats: {
            hashrate: 100,
          },
        },
      },
    } as Device

    const workersObj = {
      'miner-1': { hashrate: 150 },
    }

    mockIsMiner.mockReturnValue(true)
    mockIsMinerOffline.mockReturnValue(true)
    mockGetStats.mockReturnValue({ hashrate: 100 })

    const result = enrichDeviceWithPoolHashrate(
      device,
      workersObj,
      mockIsMiner,
      mockIsMinerOffline,
      mockGetStats,
      mockGetHashrateString,
    )

    expect(result.isRaw).toBe(true)
    expect(result.last?.snap?.stats?.poolHashrate).toBeUndefined()
  })

  test('should mark device as raw when stats are empty', () => {
    const device: Device = {
      id: 'miner-1',
      type: 'miner',
    } as Device

    const workersObj = {
      'miner-1': { hashrate: 150 },
    }

    mockIsMiner.mockReturnValue(true)
    mockIsMinerOffline.mockReturnValue(false)
    mockGetStats.mockReturnValue({})

    const result = enrichDeviceWithPoolHashrate(
      device,
      workersObj,
      mockIsMiner,
      mockIsMinerOffline,
      mockGetStats,
      mockGetHashrateString,
    )

    expect(result.isRaw).toBe(true)
  })
})

describe('mergeAndSortDevices', () => {
  test('should merge devices by ID, keeping the latest version', () => {
    const initialDevices: Device[] = [
      { id: 'device-1', type: 'miner', version: 1 } as unknown as Device,
      { id: 'device-2', type: 'miner', version: 1 } as unknown as Device,
    ]

    const newDevices: Device[] = [
      { id: 'device-2', type: 'miner', version: 2 } as unknown as Device,
      { id: 'device-3', type: 'miner', version: 1 } as unknown as Device,
    ]

    const result = mergeAndSortDevices(initialDevices, newDevices)

    expect(result).toHaveLength(3)
    expect(result.find((d) => d.id === 'device-2')).toEqual({
      id: 'device-2',
      type: 'miner',
      version: 2,
    })
  })

  test('should sort devices by ID in ascending order', () => {
    const initialDevices: Device[] = [
      { id: 'device-3', type: 'miner' } as Device,
      { id: 'device-1', type: 'miner' } as Device,
    ]

    const newDevices: Device[] = [{ id: 'device-2', type: 'miner' } as Device]

    const result = mergeAndSortDevices(initialDevices, newDevices)

    expect(result.map((d) => d.id)).toEqual(['device-1', 'device-2', 'device-3'])
  })

  test('should handle numeric IDs correctly', () => {
    const initialDevices: Device[] = [
      { id: '10', type: 'miner' } as Device,
      { id: '2', type: 'miner' } as Device,
    ]

    const newDevices: Device[] = [{ id: '1', type: 'miner' } as Device]

    const result = mergeAndSortDevices(initialDevices, newDevices)

    expect(result.map((d) => d.id)).toEqual(['1', '10', '2'])
  })

  test('should handle empty arrays', () => {
    const result1 = mergeAndSortDevices([], [])
    expect(result1).toEqual([])

    const devices: Device[] = [{ id: 'device-1', type: 'miner' } as Device]
    const result2 = mergeAndSortDevices(devices, [])
    expect(result2).toHaveLength(1)

    const result3 = mergeAndSortDevices([], devices)
    expect(result3).toHaveLength(1)
  })

  test('should remove duplicates from initial and new devices', () => {
    const initialDevices: Device[] = [
      { id: 'device-1', type: 'miner' } as Device,
      { id: 'device-1', type: 'miner' } as Device,
    ]

    const newDevices: Device[] = [{ id: 'device-1', type: 'miner' } as Device]

    const result = mergeAndSortDevices(initialDevices, newDevices)

    expect(result).toHaveLength(1)
  })
})

describe('paginateDevices', () => {
  const mockDevices: Device[] = Array.from({ length: 100 }, (_, i) => ({
    id: `device-${i + 1}`,
    type: 'miner',
  })) as Device[]

  test('should return correct page of devices', () => {
    const result = paginateDevices(mockDevices, 20, 1)

    expect(result).toHaveLength(20)
    expect(result[0].id).toBe('device-1')
    expect(result[19].id).toBe('device-20')
  })

  test('should return second page correctly', () => {
    const result = paginateDevices(mockDevices, 20, 2)

    expect(result).toHaveLength(20)
    expect(result[0].id).toBe('device-21')
    expect(result[19].id).toBe('device-40')
  })

  test('should handle last page with fewer items', () => {
    const result = paginateDevices(mockDevices, 30, 4)

    expect(result).toHaveLength(10)
    expect(result[0].id).toBe('device-91')
    expect(result[9].id).toBe('device-100')
  })

  test('should return empty array for out of range page', () => {
    const result = paginateDevices(mockDevices, 20, 10)

    expect(result).toEqual([])
  })

  test('should handle page size larger than array', () => {
    const smallArray: Device[] = [
      { id: 'device-1', type: 'miner' } as Device,
      { id: 'device-2', type: 'miner' } as Device,
    ]

    const result = paginateDevices(smallArray, 50, 1)

    expect(result).toHaveLength(2)
  })

  test('should handle empty array', () => {
    const result = paginateDevices([], 20, 1)

    expect(result).toEqual([])
  })

  test('should handle different page sizes', () => {
    const result10 = paginateDevices(mockDevices, 10, 1)
    expect(result10).toHaveLength(10)

    const result50 = paginateDevices(mockDevices, 50, 1)
    expect(result50).toHaveLength(50)

    const result100 = paginateDevices(mockDevices, 100, 1)
    expect(result100).toHaveLength(100)
  })
})
