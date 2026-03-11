import {
  getFilterOptionsByTab,
  getSortParams,
  getTableDeviceData,
  mergeAndSortDevices,
  paginateDevices,
  formatCabinets,
} from '../ListView.util'

import { CROSS_THING_TYPES } from '@/constants/devices'

describe('ListView.util', () => {
  describe('getFilterOptionsByTab', () => {
    it('returns options that include the given tab', () => {
      const result = getFilterOptionsByTab(CROSS_THING_TYPES.MINER)
      expect(Array.isArray(result)).toBe(true)
      expect(
        result.some((opt) => (opt.tab as string[] | undefined)?.includes(CROSS_THING_TYPES.MINER)),
      ).toBe(true)
    })
    it('returns empty array for unknown tab', () => {
      const result = getFilterOptionsByTab('unknown-tab-xyz')
      expect(result).toEqual([])
    })
  })

  describe('getSortParams', () => {
    it('returns JSON string with sort params for known field', () => {
      const result = getSortParams('id', 'ascend')
      expect(typeof result).toBe('string')
      const parsed = JSON.parse(result)
      expect(typeof parsed).toBe('object')
    })
    it('returns descend order when order is descend', () => {
      const result = getSortParams('id', 'descend')
      const parsed = JSON.parse(result)
      const values = Object.values(parsed) as number[]
      expect(values.every((v) => v === -1)).toBe(true)
    })
    it('returns {} string for unknown field', () => {
      expect(getSortParams('unknownField')).toBe('{}')
    })
  })

  describe('getTableDeviceData', () => {
    it('returns error object when device has no data', () => {
      const result = getTableDeviceData(null)
      expect(result.error).toBeDefined()
      expect(result.stats).toEqual({})
      expect(result.config).toEqual({})
    })
    it('returns device data when valid device record', () => {
      const device = {
        id: 'd1',
        type: 'miner-wm',
        last: { snap: { stats: {}, config: {} } },
        tags: [],
        info: {},
      }
      const result = getTableDeviceData(device)
      expect(result.id).toBe('d1')
      expect(result.type).toBe('miner-wm')
    })
  })

  describe('mergeAndSortDevices', () => {
    it('merges and deduplicates by id', () => {
      const initial = [
        { id: 'd1', type: 'miner' },
        { id: 'd2', type: 'miner' },
      ] as never[]
      const newDevices = [
        { id: 'd2', type: 'miner' },
        { id: 'd3', type: 'miner' },
      ] as never[]
      const result = mergeAndSortDevices(initial, newDevices)
      expect(result).toHaveLength(3)
      const ids = result.map((d) => d.id).sort()
      expect(ids).toEqual(['d1', 'd2', 'd3'])
    })
    it('sorts by id', () => {
      const initial = [{ id: 'z' }, { id: 'a' }] as never[]
      const result = mergeAndSortDevices(initial, [])
      expect(result[0].id).toBe('a')
      expect(result[1].id).toBe('z')
    })
  })

  describe('paginateDevices', () => {
    it('returns slice for current page', () => {
      const devices = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }] as never[]
      const result = paginateDevices(devices, 2, 2)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('3')
      expect(result[1].id).toBe('4')
    })
    it('returns empty array when page beyond range', () => {
      const devices = [{ id: '1' }] as never[]
      expect(paginateDevices(devices, 10, 5)).toHaveLength(0)
    })
  })

  describe('formatCabinets', () => {
    it('returns other devices when no cabinet devices', () => {
      const devices = [{ id: 'm1', type: 'miner-wm' }] as never[]
      const result = formatCabinets(devices)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(devices[0])
    })
    it('groups cabinet devices and appends others', () => {
      const devices = [
        { id: 'pm1', type: 'powermeter-1', info: { pos: 'lv1_lv1' } },
        { id: 'ts1', type: 'sensor-temp-1', info: { pos: 'lv1_lv2' } },
      ] as never[]
      const result = formatCabinets(devices)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
