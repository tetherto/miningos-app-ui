import { vi } from 'vitest'

import { getDisplayValue } from './StatBox.util'

import * as formatUtils from '@/app/utils/format'

vi.mock('@/app/utils/format', () => ({
  formatNumber: vi.fn(),
}))

describe('StatBox utils', () => {
  describe('getDisplayValue', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should return "-" when isLoading is true', () => {
      const result = getDisplayValue(100, true)
      expect(result).toBe('-')
      expect(formatUtils.formatNumber).not.toHaveBeenCalled()
    })

    it('should return formatted number when value is greater than 0', () => {
      ;(formatUtils.formatNumber as ReturnType<typeof vi.fn>).mockReturnValue('1,234')
      const result = getDisplayValue(1234, false)

      expect(result).toBe('1,234')
      expect(formatUtils.formatNumber).toHaveBeenCalledWith(1234)
    })

    it('should return 0 when value is 0', () => {
      const result = getDisplayValue(0, false)
      expect(result).toBe(0)
      expect(formatUtils.formatNumber).not.toHaveBeenCalled()
    })

    it('should return 0 when value is negative', () => {
      const result = getDisplayValue(-10, false)
      expect(result).toBe(0)
      expect(formatUtils.formatNumber).not.toHaveBeenCalled()
    })

    it('should return 0 when value is null or undefined', () => {
      expect(getDisplayValue(null as unknown as number, false)).toBe(0)
      expect(getDisplayValue(undefined as unknown as number, false)).toBe(0)
      expect(formatUtils.formatNumber).not.toHaveBeenCalled()
    })
  })
})
