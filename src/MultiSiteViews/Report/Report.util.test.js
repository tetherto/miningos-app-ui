import { sanitizeFileName, formatDateForFilename } from './Report.util'

describe('Report.util', () => {
  describe('sanitizeFileName', () => {
    it('should convert location to lowercase', () => {
      const result = sanitizeFileName('All Sites')
      expect(result).toBe('all-sites')
    })

    it('should replace spaces with dashes', () => {
      const result = sanitizeFileName('Site Name With Spaces')
      expect(result).toBe('site-name-with-spaces')
    })

    it('should replace multiple consecutive spaces with single dash', () => {
      const result = sanitizeFileName('Site   With   Multiple   Spaces')
      expect(result).toBe('site-with-multiple-spaces')
    })

    it('should handle location that is already lowercase', () => {
      const result = sanitizeFileName('alreadylowercase')
      expect(result).toBe('alreadylowercase')
    })

    it('should handle location with mixed case and special characters', () => {
      const result = sanitizeFileName('Site-Name 123')
      expect(result).toBe('site-name-123')
    })

    it('should handle empty string', () => {
      const result = sanitizeFileName('')
      expect(result).toBe('')
    })
  })

  describe('formatDateForFilename', () => {
    it('should format weekly date range correctly', () => {
      const dateRange = 'Jan 01 - Jan 07, 2025'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20250101-20250107')
    })

    it('should format monthly date range correctly', () => {
      const dateRange = 'Jan 01 - Jan 31, 2025'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20250101-20250131')
    })

    it('should format date range with abbreviated month names', () => {
      const dateRange = 'Mar 15 - Mar 22, 2025'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20250315-20250322')
    })

    it('should format date range spanning months in same year', () => {
      const dateRange = 'Dec 15 - Dec 31, 2024'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20241215-20241231')
    })

    it('should format date range with different month and year', () => {
      const dateRange = 'Feb 01 - Feb 28, 2025'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20250201-20250228')
    })

    it('should format date range with different months', () => {
      const dateRange = 'Apr 15 - May 15, 2024'
      const result = formatDateForFilename(dateRange)
      expect(result).toBe('20240415-20240515')
    })
  })
})
