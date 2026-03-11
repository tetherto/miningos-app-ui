import { describe, it, expect, vi } from 'vitest'

import {
  getCurrentPowerModes,
  getDefaultSelectedPowerModes,
  getLedButtonsStatus,
  groupTailLogByMinersByType,
  recreateSubmission,
} from './MinerControlsCard.util'

import { ACTION_TYPES } from '@/constants/actions'

vi.mock('@/constants/deviceConstants', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/constants/deviceConstants')>()
  return { ...original }
})

vi.mock('../../../../app/utils/containerUtils', () => ({
  getMinerTypeFromContainerType: vi.fn((type: string) => {
    if (type?.includes('antminer')) return 'am'
    if (type?.includes('whatsminer')) return 'wm'
    if (type?.includes('avalon')) return 'av'
    return undefined
  }),
}))

describe('recreateSubmission', () => {
  it('throws when params is undefined', () => {
    expect(() => recreateSubmission(undefined)).toThrow()
  })

  it('returns add with no pending submissions', () => {
    expect(
      recreateSubmission({
        pendingSubmissions: [],
        selectedDevicesTags: ['a', 'b', 'c'],
        action: ACTION_TYPES.SETUP_POOLS,
      }),
    ).toEqual({
      add: ['a', 'b', 'c'],
    })
  })

  it('returns remove and add with overlapping pending submissions', () => {
    expect(
      recreateSubmission({
        pendingSubmissions: [
          {
            type: 'voting',
            action: ACTION_TYPES.SETUP_POOLS,
            tags: ['a', 'b'],
            params: [],
            id: 1,
          },
        ],
        selectedDevicesTags: ['b', 'c'],
        action: ACTION_TYPES.SETUP_POOLS,
      }),
    ).toEqual({
      remove: [1, 'b'],
      add: ['b', 'c'],
    })
  })

  it('skips submission with no intersection', () => {
    const result = recreateSubmission({
      pendingSubmissions: [
        {
          action: ACTION_TYPES.SETUP_POOLS,
          tags: ['x', 'y'],
          id: 5,
        },
      ],
      selectedDevicesTags: ['a', 'b'],
      action: ACTION_TYPES.SETUP_POOLS,
    })
    expect(result).toEqual({ remove: [], add: [] })
  })
})

describe('getCurrentPowerModes', () => {
  it('counts power modes from selected devices', () => {
    const devices = [
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'normal' } } } },
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'high' } } } },
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'normal' } } } },
    ]
    const result = getCurrentPowerModes(devices, [])
    expect(result.normal).toBe(2)
    expect(result.high).toBe(1)
  })

  it('maps sleeping status to sleep power mode', () => {
    const devices = [
      { last: { snap: { stats: { status: 'sleeping' }, config: { power_mode: 'normal' } } } },
    ]
    const result = getCurrentPowerModes(devices, [])
    expect(result.sleep).toBe(1)
  })

  it('uses connectedMiners when not empty', () => {
    const selectedDevices = [
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'normal' } } } },
    ]
    const connectedMiners = [
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'high' } } } },
    ]
    const result = getCurrentPowerModes(selectedDevices, connectedMiners)
    expect(result.high).toBe(1)
    expect(result.normal).toBeUndefined()
  })
})

describe('getDefaultSelectedPowerModes', () => {
  it('returns single mode when only one power mode exists', () => {
    const result = getDefaultSelectedPowerModes({ normal: 3 })
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('normal')
  })

  it('returns empty when multiple power modes exist', () => {
    const result = getDefaultSelectedPowerModes({ normal: 2, high: 1 })
    expect(result).toHaveLength(0)
  })

  it('returns empty when no power modes', () => {
    const result = getDefaultSelectedPowerModes({})
    expect(result).toHaveLength(0)
  })
})

describe('getLedButtonsStatus', () => {
  it('returns correct status when led is on (boolean true)', () => {
    const devices = [{ last: { snap: { config: { led_status: true } } } }]
    const result = getLedButtonsStatus(devices)
    expect(result.isLedOnButtonEnabled).toBe(false)
    expect(result.isLedOffButtonEnabled).toBe(true)
  })

  it('returns correct status when led is off (boolean false)', () => {
    const devices = [{ last: { snap: { config: { led_status: false } } } }]
    const result = getLedButtonsStatus(devices)
    expect(result.isLedOnButtonEnabled).toBe(true)
    expect(result.isLedOffButtonEnabled).toBe(false)
  })

  it('treats non-boolean led_status as "on"', () => {
    const devices = [{ last: { snap: { config: { led_status: null } } } }]
    const result = getLedButtonsStatus(devices)
    expect(result.isLedOffButtonEnabled).toBe(true)
  })
})

describe('groupTailLogByMinersByType', () => {
  it('groups tail log data by miner type', () => {
    const selectedDevices = [
      { type: 'container.antminer', info: { container: 'container-1' } },
    ]
    const tailLogData = {
      power_mode_normal_cnt: { 'container-1': 5 },
    } as unknown as Array<Record<string, unknown>>

    const result = groupTailLogByMinersByType(selectedDevices, tailLogData)
    expect(result).toBeDefined()
    expect(result['am']).toBeDefined()
    expect(result['am'].normal).toBe(5)
  })

  it('skips entries with unknown container type', () => {
    const selectedDevices = [
      { type: 'container.unknown', info: { container: 'container-2' } },
    ]
    const tailLogData = {
      power_mode_normal_cnt: { 'container-2': 3 },
    } as unknown as Array<Record<string, unknown>>

    const result = groupTailLogByMinersByType(selectedDevices, tailLogData)
    expect(result['am'].normal).toBe(0)
  })
})
