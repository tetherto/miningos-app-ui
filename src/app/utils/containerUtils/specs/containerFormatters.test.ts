import {
  getContainerName,
  getMinerTypeFromContainerType,
  getSupportedContainerTypesFromMinerType,
  getDeviceContainerPosText,
  getDeviceName,
  getDetailedDeviceName,
} from '../containerFormatters'

import { COMPLETE_CONTAINER_TYPE } from '@/constants/containerConstants'

describe('containerFormatters', () => {
  describe('getContainerName', () => {
    it('returns empty for empty container', () => {
      expect(getContainerName(undefined)).toBe('')
      expect(getContainerName('')).toBe('')
    })
    it('returns Maintenance for maintenance container', () => {
      expect(getContainerName('maintenance')).toBe('Maintenance')
    })
    it('returns formatted name for bitdeer container', () => {
      const result = getContainerName('bitdeer-5a', 'container-bd-d40-m56')
      expect(result).toContain('Bitdeer')
      expect(result).toContain('5a')
    })
    it('returns formatted name for microbt container', () => {
      const result = getContainerName('microbt-1', 'container-mbt-kehua')
      expect(result).toContain('MicroBT')
    })
  })

  describe('getMinerTypeFromContainerType', () => {
    it('returns av for avalon container', () => {
      expect(getMinerTypeFromContainerType(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)).toBe('av')
    })
    it('returns wm for whatsminer container', () => {
      expect(getMinerTypeFromContainerType(COMPLETE_CONTAINER_TYPE.BITDEER_M56)).toBe('wm')
    })
    it('returns am for antminer container', () => {
      expect(getMinerTypeFromContainerType(COMPLETE_CONTAINER_TYPE.BITDEER_S19XP)).toBe('am')
    })
    it('returns undefined for unknown', () => {
      expect(getMinerTypeFromContainerType('unknown')).toBeUndefined()
    })
  })

  describe('getSupportedContainerTypesFromMinerType', () => {
    it('returns types for avalon miner', () => {
      const result = getSupportedContainerTypesFromMinerType('miner-av-a1346')
      expect(result).toContain(COMPLETE_CONTAINER_TYPE.BITDEER_A1346)
    })
    it('returns types for whatsminer', () => {
      const result = getSupportedContainerTypesFromMinerType('miner-wm-m56')
      expect(result.length).toBeGreaterThan(0)
    })
    it('returns empty for unknown', () => {
      expect(getSupportedContainerTypesFromMinerType('miner-unknown')).toEqual([])
    })
  })

  describe('getDeviceContainerPosText', () => {
    it('returns only container name when no pdu/socket or pos', () => {
      expect(getDeviceContainerPosText({ containerInfo: { container: 'bitdeer-1' } })).toContain(
        'Bitdeer',
      )
    })
    it('returns container and destination when pos provided', () => {
      const result = getDeviceContainerPosText({
        containerInfo: { container: 'bitdeer-1' },
        pos: 'pdu1_socketA',
      })
      expect(result).toContain('pdu1_socketA')
    })
  })

  describe('getDeviceName', () => {
    it('returns empty for undefined device', () => {
      expect(getDeviceName(undefined as never)).toBe('')
    })
    it('returns id for temp sensor type', () => {
      expect(getDeviceName({ id: 'ts1', type: 'sensor-temp-1' })).toBe('ts1')
    })
    it('returns name with container when type and info present', () => {
      const name = getDeviceName({
        id: 'm1',
        type: 'miner-wm-m56',
        info: { container: 'bitdeer-1', pos: '1_2' },
      })
      expect(name).toBeDefined()
      expect(name.length).toBeGreaterThan(0)
    })
  })

  describe('getDetailedDeviceName', () => {
    it('returns Unknown device for unknown type', () => {
      expect(getDetailedDeviceName('unknown-type')).toBe('Unknown device')
    })
    it('returns temp sensor name for sensor-temp type', () => {
      const name = getDetailedDeviceName('sensor-temp-1', 'lv1_lv2')
      expect(name).toContain('Temp')
    })
    it('returns container name for container type', () => {
      const name = getDetailedDeviceName('container-bd-d40-m56', undefined, {
        id: 'c1',
        info: { container: 'bitdeer-1' },
      })
      expect(name).toContain('Bitdeer')
    })
  })
})
