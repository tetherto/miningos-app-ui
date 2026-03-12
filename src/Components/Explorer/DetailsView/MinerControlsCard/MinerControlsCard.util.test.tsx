import { describe, expect, it, test, vi } from 'vitest'

import {
  getCurrentPowerModes,
  getDefaultSelectedPowerModes,
  getLedButtonsStatus,
  groupTailLogByMinersByType,
  recreateSubmission,
} from './MinerControlsCard.util'

import { MINER_POWER_MODE, MinerStatuses } from '@/app/utils/statusUtils'
import { ACTION_TYPES } from '@/constants/actions'
import { MINER_TYPE } from '@/constants/deviceConstants'

vi.mock('../../../../app/utils/containerUtils', () => ({
  getMinerTypeFromContainerType: vi.fn((type: string) => {
    if (type.includes('antminer')) return MINER_TYPE.ANTMINER
    if (type.includes('whatsminer')) return MINER_TYPE.WHATSMINER
    return undefined
  }),
}))

describe('getCurrentPowerModes', () => {
  it('returns power mode counts from connected miners', () => {
    const miners = [
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'normal' } } } },
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'high' } } } },
      {
        last: {
          snap: { stats: { status: MinerStatuses.SLEEPING }, config: { power_mode: 'normal' } },
        },
      },
    ]
    const result = getCurrentPowerModes([], miners as never[]) as Record<string, number>
    expect(result['normal']).toBe(1)
    expect(result['high']).toBe(1)
    expect(result[MINER_POWER_MODE.SLEEP]).toBe(1)
  })

  it('uses selectedDevices when connectedMiners is empty', () => {
    const devices = [
      { last: { snap: { stats: { status: 'mining' }, config: { power_mode: 'low' } } } },
    ]
    const result = getCurrentPowerModes(devices as never[], []) as Record<string, number>
    expect(result['low']).toBe(1)
  })
})

describe('getDefaultSelectedPowerModes', () => {
  it('returns the single mode when only one mode exists', () => {
    const result = getDefaultSelectedPowerModes({ normal: 3 })
    expect(result).toEqual(['normal'])
  })

  it('returns empty array when multiple modes exist', () => {
    const result = getDefaultSelectedPowerModes({ normal: 2, high: 1 })
    expect(result).toEqual([])
  })
})

describe('getLedButtonsStatus', () => {
  it('returns both enabled when devices have mixed LED states', () => {
    const devices = [
      { last: { snap: { config: { led_status: true } } } },
      { last: { snap: { config: { led_status: false } } } },
    ]
    const result = getLedButtonsStatus(devices as never[])
    expect(result.isLedOnButtonEnabled).toBe(true)
    expect(result.isLedOffButtonEnabled).toBe(true)
  })

  it('enables only off button when all LEDs are on', () => {
    const devices = [{ last: { snap: { config: { led_status: true } } } }]
    const result = getLedButtonsStatus(devices as never[])
    expect(result.isLedOffButtonEnabled).toBe(true)
  })

  it('handles non-boolean led_status (defaults to on)', () => {
    const devices = [{ last: { snap: { config: { led_status: undefined } } } }]
    const result = getLedButtonsStatus(devices as never[])
    expect(result.isLedOffButtonEnabled).toBe(true)
  })
})

describe('groupTailLogByMinersByType', () => {
  it('returns base object with zeros when no tailLog data', () => {
    const result = groupTailLogByMinersByType([], [])
    expect(result[MINER_TYPE.ANTMINER].normal).toBe(0)
  })

  it('aggregates miner counts by type and power mode', () => {
    const selectedDevices = [
      {
        type: 'antminer-s19',
        info: { container: 'container-1' },
      },
    ]
    // groupTailLogByMinersByType uses _toPairs(tailLogData) — pass an object not an array
    const tailLogData = { power_mode_normal_cnt: { 'container-1': 5 } }
    const result = groupTailLogByMinersByType(
      selectedDevices as never[],
      tailLogData as unknown as never[],
    )
    expect(result[MINER_TYPE.ANTMINER].normal).toBe(5)
  })

  it('skips entries where container type cannot be determined', () => {
    const selectedDevices: never[] = []
    const tailLogData = { power_mode_normal_cnt: { 'container-unknown': 3 } }
    const result = groupTailLogByMinersByType(selectedDevices, tailLogData as unknown as never[])
    expect(result[MINER_TYPE.ANTMINER].normal).toBe(0)
  })
})

test('recreateSubmission', () => {
  expect(() => {
    recreateSubmission(undefined)
  }).toThrow()

  expect(
    recreateSubmission({
      pendingSubmissions: [],
      selectedDevicesTags: ['a', 'b', 'c'],
      action: ACTION_TYPES.SETUP_POOLS,
    }),
  ).toEqual({
    add: ['a', 'b', 'c'],
  })

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
