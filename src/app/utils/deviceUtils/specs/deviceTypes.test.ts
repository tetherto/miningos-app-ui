import {
  checkIsIdTag,
  getDeviceModel,
  getIsTransformerTempSensor,
  isAntminer,
  isAvalon,
  isCabinet,
  isContainer,
  isContainerTag,
  isElectricity,
  isLVCabinet,
  isMiner,
  isMinerOffline,
  isPowerMeter,
  isSparePart,
  isTempSensor,
  isTransformerCabinet,
  isTransformerPowermeter,
  isWhatsminer,
} from '../deviceTypes'

describe('deviceTypes', () => {
  describe('type guards', () => {
    it('isMiner', () => {
      expect(isMiner('miner-wm-m56')).toBe(true)
      expect(isMiner('container-bd')).toBe(false)
    })
    it('isPowerMeter', () => expect(isPowerMeter('powermeter-1')).toBe(true))
    it('isTempSensor', () => expect(isTempSensor('sensor-temp-1')).toBe(true))
    it('isCabinet', () => expect(isCabinet('cabinet-lv1')).toBe(true))
    it('isElectricity', () => expect(isElectricity('electricity-main')).toBe(true))
    it('isContainer', () => expect(isContainer('container-bd-d40')).toBe(true))
    it('isSparePart', () => expect(isSparePart('inventory-miner_part-1')).toBe(true))
    it('isAvalon', () => expect(isAvalon('miner-av-a1346')).toBe(true))
    it('isWhatsminer', () => expect(isWhatsminer('miner-wm-m56')).toBe(true))
    it('isAntminer', () => expect(isAntminer('miner-am-s19')).toBe(true))
  })
  describe('checkIsIdTag', () => {
    it('returns true for UUID', () => {
      expect(checkIsIdTag('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true)
    })
    it('returns false for non-UUID', () => expect(checkIsIdTag('id-miner-1')).toBe(false))
  })
  describe('isContainerTag', () => {
    it('returns true when tag contains container-', () => {
      expect(isContainerTag('container-bd-1')).toBe(true)
    })
  })
  describe('isMinerOffline', () => {
    it('returns true when stats and config empty', () => {
      const device = { last: { snap: { stats: {}, config: {} } } }
      expect(isMinerOffline(device as never)).toBe(true)
    })
    it('returns true when status offline', () => {
      const device = { last: { snap: { stats: { status: 'offline' }, config: {} } } }
      expect(isMinerOffline(device as never)).toBe(true)
    })
  })
  describe('isTransformerPowermeter', () => {
    it('returns true for powermeter with tr pos', () => {
      expect(isTransformerPowermeter('powermeter-1', 'tr1')).toBe(true)
    })
  })
  describe('isLVCabinet and isTransformerCabinet', () => {
    it('detects by device id', () => {
      expect(isLVCabinet({ id: 'lv-cabinet-1' } as never)).toBe(true)
      expect(isTransformerCabinet({ id: 'tr-cabinet-1' } as never)).toBe(true)
    })
  })
  describe('getIsTransformerTempSensor', () => {
    it('returns true when devicePos starts with tr', () => {
      expect(getIsTransformerTempSensor('tr1')).toBe(true)
    })
  })
  describe('getDeviceModel', () => {
    it('returns container-bd-d40 for bd-d40 container type', () => {
      expect(getDeviceModel({ type: 'container-bd-d40-m56' } as never)).toBe('container-bd-d40')
    })
    it('returns type for non-container', () => {
      expect(getDeviceModel({ type: 'miner-wm-m56' } as never)).toBe('miner-wm-m56')
    })
  })
})
