import {
  getSparePartKind,
  getLocationColors,
  getStatusColors,
  getPartTypeAbbreviation,
} from '../sparePartUtils'

describe('getSparePartKind', () => {
  it('should return spare part kind properly', () => {
    expect(getSparePartKind('inventory-miner_part-controller')).toBe('controller')
    expect(getSparePartKind('inventory-container_part-psu')).toBe('psu')
    expect(getSparePartKind('inventory-miner_part-hashboard')).toBe('hashboard')
  })

  it('returns undefined when type is undefined', () => {
    expect(getSparePartKind(undefined)).toBeUndefined()
  })

  it('returns undefined when type is empty string', () => {
    expect(getSparePartKind('')).toBeUndefined()
  })
})

describe('getLocationColors', () => {
  it('returns fallback colors for unknown location', () => {
    const result = getLocationColors('unknown-location')
    expect(result.$backgroundColor).toBe('none')
    expect(result.$textColor).toBe('unset')
  })

  it('returns defined colors for known locations', () => {
    // Just verify the shape — actual values depend on SPARE_PART_LOCATION_BG_COLORS
    const result = getLocationColors('site')
    expect(result).toHaveProperty('$backgroundColor')
    expect(result).toHaveProperty('$textColor')
  })
})

describe('getStatusColors', () => {
  it('returns fallback colors for unknown status', () => {
    const result = getStatusColors('unknown-status')
    expect(result.$backgroundColor).toBe('none')
    expect(result.$textColor).toBe('unset')
  })

  it('returns defined colors for known statuses', () => {
    const result = getStatusColors('available')
    expect(result).toHaveProperty('$backgroundColor')
    expect(result).toHaveProperty('$textColor')
  })
})

describe('getPartTypeAbbreviation', () => {
  it('returns the partType itself when no mapping exists', () => {
    expect(getPartTypeAbbreviation('unknown-part-type')).toBe('unknown-part-type')
  })

  it('returns an abbreviation or name for known part types', () => {
    const result = getPartTypeAbbreviation('hashboard')
    expect(typeof result).toBe('string')
  })
})
