import { describe, it, expect, vi } from 'vitest'

const mockFns = vi.hoisted(() => ({
  downloadFileFromData: vi.fn(),
  collectionToCSV: vi.fn((data: unknown) => JSON.stringify(data)),
}))

vi.mock('@/app/utils/downloadUtils', () => ({
  downloadFileFromData: mockFns.downloadFileFromData,
  collectionToCSV: mockFns.collectionToCSV,
}))

import { downloadJson, downloadCsv, getMinersFormattedJson } from './ExportPduData.helper'

import type { Device } from '@/app/utils/deviceUtils/types'

const connectedMiners: Device[] = [
  {
    id: '1',
    last: {
      snap: {
        stats: {
          hashrate_mhs: {
            t_5m: 100000000,
          },
          power_w: 500,
          temperature_c: 40,
          uptime_ms: 3600000,
          status: 'mining',
        },
        config: {
          pool_config: [
            {
              username: 'pool.worker',
            },
          ],
          firmware_ver: '1.0.0',
          power_mode: 'high',
        },
      },
      alerts: ['alert1', 'alert2'],
    },
    info: {
      site: 'site1',
      container: 'container1',
      pos: 'position1',
      serialNum: '123456',
      macAddress: '00:00:00:00:00:00',
    },
    address: '192.168.0.1',
    type: 'miner_type',
  },
]

describe('getMinersFormattedJson', () => {
  it('returns formatted JSON for connected miners', () => {
    const formattedMiners = getMinersFormattedJson(connectedMiners)

    expect(formattedMiners).toEqual([
      {
        id: '1',
        type: 'miner_type',
        site: 'site1',
        container: 'container1',
        position: 'position1',
        serialNumber: '123456',
        macAddress: '00:00:00:00:00:00',
        ipAddress: '192.168.0.1',
        firmwareVersion: '1.0.0',
        status: 'mining',
        powerMode: 'high',
        hashrateMhs: 100000000,
        efficiencyWThs: 5,
        powerW: 500,
        temperatureC: 40,
        workerName: 'worker',
        activePool: 'pool',
        alerts: ['alert1', 'alert2'],
        uptimeMs: 3600000,
      },
    ])
  })

  it('returns empty efficiency when power_w is missing', () => {
    const minerWithNopower: Device[] = [
      {
        id: '2',
        last: {
          snap: {
            stats: { hashrate_mhs: { t_5m: 100000000 } },
            config: {},
          },
        },
        info: {},
        type: 'miner_type',
      } as unknown as Device,
    ]

    const result = getMinersFormattedJson(minerWithNopower)
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('returns empty efficiency when hashRate is 0', () => {
    const minerWithZeroHashrate: Device[] = [
      {
        id: '3',
        last: {
          snap: {
            stats: { power_w: 500, hashrate_mhs: { t_5m: 0 } },
            config: {},
          },
        },
        info: {},
        type: 'miner_type',
      } as unknown as Device,
    ]

    const result = getMinersFormattedJson(minerWithZeroHashrate)
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('returns empty efficiency when hashrate_mhs is missing', () => {
    const minerWithNoHashrate: Device[] = [
      {
        id: '4',
        last: {
          snap: {
            stats: { power_w: 500 },
            config: {},
          },
        },
        info: {},
        type: 'miner_type',
      } as unknown as Device,
    ]

    const result = getMinersFormattedJson(minerWithNoHashrate)
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('returns empty efficiency when hashRate is negative', () => {
    const result = getMinersFormattedJson([
      {
        id: '5',
        last: { snap: { stats: { power_w: 500, hashrate_mhs: { t_5m: -1 } }, config: {} } },
        info: {},
        type: 'miner_type',
      } as unknown as Device,
    ])
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('handles miner with no last property', () => {
    const result = getMinersFormattedJson([
      { id: '6', info: {}, type: 'miner_type' } as unknown as Device,
    ])
    expect(result[0].id).toBe('6')
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('handles miner with no snap property', () => {
    const result = getMinersFormattedJson([
      { id: '7', last: {}, info: {}, type: 'miner_type' } as unknown as Device,
    ])
    expect(result[0].id).toBe('7')
    expect(result[0].efficiencyWThs).toBe('')
  })

  it('handles miner with no pool_config', () => {
    const result = getMinersFormattedJson([
      {
        id: '8',
        last: { snap: { stats: { power_w: 500, hashrate_mhs: { t_5m: 100 } }, config: {} } },
        info: {},
        type: 'miner_type',
      } as unknown as Device,
    ])
    // No pool_config → username defaults to '' → workerName is empty or undefined
    expect(result[0].workerName).toBeFalsy()
  })
})

describe('downloadJson', () => {
  it('calls downloadFileFromData with JSON data', () => {
    mockFns.downloadFileFromData.mockClear()
    downloadJson([{ id: '1' }])
    expect(mockFns.downloadFileFromData).toHaveBeenCalledWith(
      expect.objectContaining({ miners: [{ id: '1' }] }),
      'application/json',
      expect.stringContaining('container_miners_stats_'),
    )
  })
})

describe('downloadCsv', () => {
  it('calls downloadFileFromData with CSV data', () => {
    mockFns.downloadFileFromData.mockClear()
    downloadCsv([{ id: '1' }])
    expect(mockFns.downloadFileFromData).toHaveBeenCalledWith(
      expect.any(String),
      'text/csv',
      expect.stringContaining('container_miners_stats_'),
    )
  })
})
