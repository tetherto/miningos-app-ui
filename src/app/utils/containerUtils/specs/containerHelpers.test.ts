import {
  getContainerParamsSettingList,
  naturalSorting,
  sortAlphanumeric,
} from '../containerHelpers'

describe('containerHelpers', () => {
  describe('naturalSorting', () => {
    it('sorts strings with numbers naturally', () => {
      expect(naturalSorting('a2', 'a10')).toBeLessThan(0)
      expect(naturalSorting('a10', 'a2')).toBeGreaterThan(0)
    })
    it('uses localeCompare for non-date strings', () => {
      expect(naturalSorting('a', 'b')).toBeLessThan(0)
    })
  })
  describe('sortAlphanumeric', () => {
    it('sorts array in place and returns it', () => {
      const arr = ['c', 'a', 'b']
      expect(sortAlphanumeric(arr)).toEqual(['a', 'b', 'c'])
    })
  })
  describe('getContainerParamsSettingList', () => {
    it('returns list of settings from minByCharMap', () => {
      const minByCharMap = { Low: 0, Mid: 50, High: 100 }
      const result = getContainerParamsSettingList(minByCharMap)
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('label')
      expect(result[0]).toHaveProperty('description')
      expect(result[0].label).toBe('Low')
    })
    it('supports options with unit', () => {
      const minByCharMap = { Temp: 20 }
      const result = getContainerParamsSettingList(minByCharMap, { unit: '°C' })
      expect(result[0].description).toContain('°C')
    })
  })
})
