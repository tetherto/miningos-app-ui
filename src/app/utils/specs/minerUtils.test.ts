import { getLocationColors, getStatusColors } from '../minerUtils'

describe('minerUtils', () => {
  describe('getLocationColors', () => {
    it('returns backgroundColor and borderColor for known location (site.warehouse)', () => {
      const result = getLocationColors('site.warehouse')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
      expect(result.$backgroundColor).not.toBe('none')
    })
    it('returns object with both colors for any location', () => {
      const result = getLocationColors('unknown-key-xyz')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
      expect(typeof result.$backgroundColor).toBe('string')
      expect(typeof result.$borderColor).toBe('string')
    })
  })
  describe('getStatusColors', () => {
    it('returns backgroundColor and borderColor for known status (ok_brand_new)', () => {
      const result = getStatusColors('ok_brand_new')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
      expect(result.$backgroundColor).not.toBe('none')
    })
    it('returns object with both colors for any status', () => {
      const result = getStatusColors('unknown-status-xyz')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
      expect(typeof result.$backgroundColor).toBe('string')
      expect(typeof result.$borderColor).toBe('string')
    })
  })
})
