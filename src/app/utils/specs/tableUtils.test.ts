import { describe, expect, it } from 'vitest'

import { showTotalTableCount } from '../tableUtils'

describe('tableUtils', () => {
  describe('showTotalTableCount', () => {
    it('returns formatted range and total string', () => {
      expect(showTotalTableCount(100, [1, 10])).toBe('1-10 of 100')
    })

    it('handles single page range', () => {
      expect(showTotalTableCount(5, [1, 5])).toBe('1-5 of 5')
    })

    it('handles empty total', () => {
      expect(showTotalTableCount(0, [0, 0])).toBe('0-0 of 0')
    })
  })
})
