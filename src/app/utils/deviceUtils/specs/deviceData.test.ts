import {
  getConfig,
  getContainerSpecificConfig,
  getContainerSpecificStats,
  getDeviceData,
  getLast,
  getSnap,
  getStats,
} from '../deviceData'

describe('deviceData', () => {
  describe('getLast', () => {
    it('returns last from device', () => {
      const device = { last: { snap: {} } }
      expect(getLast(device)).toEqual({ snap: {} })
    })
    it('returns empty object when last missing', () => {
      expect(getLast({})).toEqual({})
    })
  })
  describe('getSnap', () => {
    it('returns snap from last', () => {
      const device = { last: { snap: { stats: {}, config: {} } } }
      expect(getSnap(device)).toEqual({ stats: {}, config: {} })
    })
  })
  describe('getStats', () => {
    it('returns stats from snap', () => {
      const device = { last: { snap: { stats: { power_w: 100 } } } }
      expect(getStats(device)).toEqual({ power_w: 100 })
    })
  })
  describe('getConfig', () => {
    it('returns config from snap', () => {
      const device = { last: { snap: { config: { foo: 1 } } } }
      expect(getConfig(device)).toEqual({ foo: 1 })
    })
  })
  describe('getContainerSpecificStats', () => {
    it('returns container_specific from stats', () => {
      const device = { last: { snap: { stats: { container_specific: { pdu_data: [] } } } } }
      expect(getContainerSpecificStats(device)).toEqual({ pdu_data: [] })
    })
    it('returns empty object when device undefined', () => {
      expect(getContainerSpecificStats(undefined)).toEqual({})
    })
  })
  describe('getContainerSpecificConfig', () => {
    it('returns container_specific from config', () => {
      const device = { last: { snap: { config: { container_specific: { threshold: 80 } } } } }
      expect(getContainerSpecificConfig(device)).toEqual({ threshold: 80 })
    })
  })
  describe('getDeviceData', () => {
    it('returns Device Not Found for null/undefined', () => {
      expect(getDeviceData(null)[0]).toBe('Device Not Found')
      expect(getDeviceData(undefined)[0]).toBe('Device Not Found')
    })
    it('returns err and device when last missing', () => {
      const device = { id: 'd1', type: 'miner-wm' }
      const [, dev] = getDeviceData(device)
      expect(dev?.err).toBe('Last Device info not found')
    })
    it('returns err and device when last present', () => {
      const device = { id: 'd1', type: 'miner-wm', last: { err: null, snap: {} } }
      const [err, dev] = getDeviceData(device)
      expect(err).toBe(null)
      expect(dev?.id).toBe('d1')
    })
  })
})
