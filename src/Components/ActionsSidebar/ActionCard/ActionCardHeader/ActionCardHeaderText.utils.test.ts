import { describe, expect, it } from 'vitest'

import { getDeviceCodes, getDevices } from './ActionCardHeaderText.utils'
import type { ActionTargets, DeviceCall } from './ActionCardHeaderText.utils'

describe('ActionCardHeaderText.utils', () => {
  describe('getDevices', () => {
    it('should return devices from codesList when provided', () => {
      const codesList = ['device1', 'device2', 'device3']
      const result = getDevices(codesList)

      expect(result).toEqual([
        { id: 'device1', code: 'device1' },
        { id: 'device2', code: 'device2' },
        { id: 'device3', code: 'device3' },
      ])
    })

    it('should prioritize codesList over targets', () => {
      const codesList = ['device1', 'device2']
      const targets: ActionTargets = {
        target1: {
          calls: [
            { id: 'id1', code: 'code1' },
            { id: 'id2', code: 'code2' },
          ],
        },
      }

      const result = getDevices(codesList, targets)

      expect(result).toEqual([
        { id: 'device1', code: 'device1' },
        { id: 'device2', code: 'device2' },
      ])
    })

    it('should return devices from targets when codesList is empty', () => {
      const targets: ActionTargets = {
        target1: {
          calls: [
            { id: 'id1', code: 'code1' },
            { id: 'id2', code: 'code2' },
          ],
        },
        target2: {
          calls: [{ id: 'id3', code: 'code3' }],
        },
      }

      const result = getDevices(undefined, targets)

      expect(result).toEqual([
        { id: 'id1', code: 'code1' },
        { id: 'id2', code: 'code2' },
        { id: 'id3', code: 'code3' },
      ])
    })

    it('should flatten multiple targets into single array', () => {
      const targets: ActionTargets = {
        target1: {
          calls: [{ id: 'id1', code: 'code1' }],
        },
        target2: {
          calls: [{ id: 'id2', code: 'code2' }],
        },
        target3: {
          calls: [{ id: 'id3', code: 'code3' }],
        },
      }

      const result = getDevices(undefined, targets)

      expect(result).toHaveLength(3)
      expect(result).toEqual([
        { id: 'id1', code: 'code1' },
        { id: 'id2', code: 'code2' },
        { id: 'id3', code: 'code3' },
      ])
    })

    it('should handle targets with empty calls array', () => {
      const targets: ActionTargets = {
        target1: {
          calls: [],
        },
        target2: {
          calls: [{ id: 'id1', code: 'code1' }],
        },
      }

      const result = getDevices(undefined, targets)

      expect(result).toEqual([{ id: 'id1', code: 'code1' }])
    })

    it('should handle devices without code property in targets', () => {
      const targets: ActionTargets = {
        target1: {
          calls: [{ id: 'id1' }, { id: 'id2', code: 'code2' }],
        },
      }

      const result = getDevices(undefined, targets)

      expect(result).toEqual([{ id: 'id1' }, { id: 'id2', code: 'code2' }])
    })

    it('should return empty array when codesList is empty array', () => {
      const result = getDevices([])

      expect(result).toEqual([])
    })

    it('should fallback to sizeTags when no codesList or targets provided', () => {
      const result = getDevices(undefined, undefined, 3)

      expect(result).toHaveLength(3)
      expect(result).toEqual([
        { id: '', code: '' },
        { id: '', code: '' },
        { id: '', code: '' },
      ])
    })

    it('should return empty array when all parameters are undefined or 0', () => {
      const result = getDevices(undefined, undefined, 0)

      expect(result).toEqual([])
    })

    it('should return empty array when sizeTags is undefined', () => {
      const result = getDevices(undefined, undefined, undefined)

      expect(result).toEqual([])
    })
  })

  describe('getDeviceCodes', () => {
    it('should return comma-separated codes from devices', () => {
      const devices: DeviceCall[] = [
        { id: 'id1', code: 'code1' },
        { id: 'id2', code: 'code2' },
        { id: 'id3', code: 'code3' },
      ]

      const result = getDeviceCodes(devices)

      expect(result).toBe('code1, code2, code3')
    })

    it('should use id when code is not provided', () => {
      const devices: DeviceCall[] = [
        { id: 'id1', code: 'code1' },
        { id: 'id2' },
        { id: 'id3', code: 'code3' },
      ]

      const result = getDeviceCodes(devices)

      expect(result).toBe('code1, id2, code3')
    })

    it('should filter out empty strings', () => {
      const devices: DeviceCall[] = [
        { id: 'id1', code: 'code1' },
        { id: '', code: '' },
        { id: 'id3', code: 'code3' },
      ]

      const result = getDeviceCodes(devices)

      expect(result).toBe('code1, code3')
    })

    it('should return empty string for empty array', () => {
      const result = getDeviceCodes([])

      expect(result).toBe('')
    })

    it('should handle single device', () => {
      const devices: DeviceCall[] = [{ id: 'id1', code: 'code1' }]

      const result = getDeviceCodes(devices)

      expect(result).toBe('code1')
    })

    it('should handle devices with only ids (no codes)', () => {
      const devices: DeviceCall[] = [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }]

      const result = getDeviceCodes(devices)

      expect(result).toBe('id1, id2, id3')
    })

    it('should filter out devices with empty id and code', () => {
      const devices: DeviceCall[] = [
        { id: 'id1', code: 'code1' },
        { id: '', code: '' },
        { id: '', code: '' },
        { id: 'id2', code: 'code2' },
      ]

      const result = getDeviceCodes(devices)

      expect(result).toBe('code1, code2')
    })

    it('should handle mixed empty and non-empty values', () => {
      const devices: DeviceCall[] = [
        { id: 'id1', code: '' },
        { id: '', code: 'code2' },
        { id: 'id3', code: 'code3' },
      ]

      const result = getDeviceCodes(devices)

      expect(result).toBe('id1, code2, code3')
    })
  })

  describe('integration tests', () => {
    it('should work together: getDevices from codesList -> getDeviceCodes', () => {
      const codesList = ['miner1', 'miner2', 'miner3']
      const devices = getDevices(codesList)
      const codes = getDeviceCodes(devices)

      expect(codes).toBe('miner1, miner2, miner3')
    })

    it('should work together: getDevices from targets -> getDeviceCodes', () => {
      const targets: ActionTargets = {
        container1: {
          calls: [
            { id: '1', code: 'miner1' },
            { id: '2', code: 'miner2' },
          ],
        },
        container2: {
          calls: [{ id: '3', code: 'miner3' }],
        },
      }
      const devices = getDevices(undefined, targets)
      const codes = getDeviceCodes(devices)

      expect(codes).toBe('miner1, miner2, miner3')
    })

    it('should work together: getDevices from sizeTags -> getDeviceCodes', () => {
      const devices = getDevices(undefined, undefined, 2)
      const codes = getDeviceCodes(devices)

      expect(codes).toBe('')
    })

    it('should handle real-world scenario with approved actions', () => {
      // Simulating approved action with targets structure
      const targets: ActionTargets = {
        'container-123': {
          calls: [
            { id: 'device-1', code: 'MINER-001' },
            { id: 'device-2', code: 'MINER-002' },
          ],
        },
        'container-456': {
          calls: [{ id: 'device-3', code: 'MINER-003' }],
        },
      }

      const devices = getDevices(undefined, targets)
      const codes = getDeviceCodes(devices)
      const count = devices.length

      expect(count).toBe(3)
      expect(codes).toBe('MINER-001, MINER-002, MINER-003')
    })

    it('should handle real-world scenario with pending submission', () => {
      // Simulating pending submission with codesList
      const codesList = ['MINER-001', 'MINER-002', 'MINER-003']

      const devices = getDevices(codesList)
      const codes = getDeviceCodes(devices)
      const count = devices.length

      expect(count).toBe(3)
      expect(codes).toBe('MINER-001, MINER-002, MINER-003')
    })
  })
})
