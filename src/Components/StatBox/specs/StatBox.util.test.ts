import { describe, expect, it, vi } from 'vitest'

import { getDisplayValue } from '../StatBox.util'

vi.mock('@/app/utils/format', () => ({
  formatNumber: (n: number) => n.toLocaleString(),
}))

describe('StatBox.util', () => {
  describe('getDisplayValue', () => {
    it('returns "-" when isLoading is true', () => {
      expect(getDisplayValue(100, true)).toBe('-')
    })

    it('returns formatted number when value > 0 and not loading', () => {
      expect(getDisplayValue(100, false)).toBe('100')
    })

    it('returns 0 when value is 0 and not loading', () => {
      expect(getDisplayValue(0, false)).toBe(0)
    })
  })
})
