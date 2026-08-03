import { getDeviceModel } from '../powerModeUtils'

describe('powerModeUtils', () => {
  describe('getDeviceModel', () => {
    it('returns other for undefined device', () => {
      expect(getDeviceModel(undefined)).toBe('other')
    })
    it('returns other for device without type', () => {
      expect(getDeviceModel({})).toBe('other')
    })
    it('returns avalon for Avalon miner or container', () => {
      expect(getDeviceModel({ type: 'miner-av-a1346' })).toBe('av')
      expect(getDeviceModel({ type: 'container-bd-d40-a1346' })).toBe('av')
    })
    it('returns wm for Whatsminer miner or container', () => {
      expect(getDeviceModel({ type: 'miner-wm-m56' })).toBe('wm')
      expect(getDeviceModel({ type: 'container-bd-d40-m56' })).toBe('wm')
    })
    it('returns am for Antminer miner or container', () => {
      expect(getDeviceModel({ type: 'miner-am-s19' })).toBe('am')
      expect(getDeviceModel({ type: 'container-bd-d40-s19xp' })).toBe('am')
    })
    it('returns other for unknown type', () => {
      expect(getDeviceModel({ type: 'unknown-type' })).toBe('other')
    })
  })
})
