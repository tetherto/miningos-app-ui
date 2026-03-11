import {
  getLocationColors,
  getPartTypeAbbreviation,
  getSparePartKind,
  getStatusColors,
} from '../sparePartUtils'

describe('getSparePartKind', () => {
  it('should return spare part kind properly', () => {
    expect(getSparePartKind('inventory-miner_part-controller')).toBe('controller')
    expect(getSparePartKind('inventory-container_part-psu')).toBe('psu')
    expect(getSparePartKind('inventory-miner_part-hashboard')).toBe('hashboard')
  })

  it('returns undefined for undefined input', () => {
    expect(getSparePartKind(undefined)).toBeUndefined()
  })
})

describe('getLocationColors', () => {
  it('returns colors for a known location', () => {
    const colors = getLocationColors('site.warehouse')
    expect(colors.$backgroundColor).toBeDefined()
    expect(colors.$textColor).toBeDefined()
    expect(colors.$backgroundColor).not.toBe('none')
  })

  it('returns fallback colors for an unknown location', () => {
    const colors = getLocationColors('unknown_location_xyz')
    expect(colors.$backgroundColor).toBe('none')
    expect(colors.$textColor).toBe('unset')
  })
})

describe('getStatusColors', () => {
  it('returns colors for a known status', () => {
    const colors = getStatusColors('ok_brand_new')
    expect(colors.$backgroundColor).toBeDefined()
    expect(colors.$textColor).toBeDefined()
  })

  it('returns fallback colors for an unknown status', () => {
    const colors = getStatusColors('unknown_status')
    expect(colors.$backgroundColor).toBe('none')
    expect(colors.$textColor).toBe('unset')
  })
})

describe('getPartTypeAbbreviation', () => {
  it('returns the abbreviation for known part types with an abbreviation mapping', () => {
    const result = getPartTypeAbbreviation('inventory-miner_part-controller')
    expect(result).toBe('CB')
  })

  it('falls back to SparePartNames when no abbreviation exists', () => {
    const result = getPartTypeAbbreviation('inventory-miner_part-psu')
    expect(result).toBe('PSU')
  })

  it('returns the part type itself when no mapping exists', () => {
    const result = getPartTypeAbbreviation('unknown-part-type')
    expect(result).toBe('unknown-part-type')
  })
})
