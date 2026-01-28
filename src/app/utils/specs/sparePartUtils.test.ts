import { getSparePartKind } from '../sparePartUtils'

describe('getSparePartKind', () => {
  it('should return spare part kind properly', () => {
    expect(getSparePartKind('inventory-miner_part-controller')).toBe('controller')
    expect(getSparePartKind('inventory-container_part-psu')).toBe('psu')
    expect(getSparePartKind('inventory-miner_part-hashboard')).toBe('hashboard')
  })
})
