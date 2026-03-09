import { getLocationColors, getStatusColors } from '../minerUtils'

describe('minerUtils', () => {
  describe('getLocationColors', () => {
    it('returns backgroundColor and borderColor for known location', () => {
      const result = getLocationColors('shelf')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
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
    it('returns backgroundColor and borderColor for known status', () => {
      const result = getStatusColors('online')
      expect(result).toHaveProperty('$backgroundColor')
      expect(result).toHaveProperty('$borderColor')
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
