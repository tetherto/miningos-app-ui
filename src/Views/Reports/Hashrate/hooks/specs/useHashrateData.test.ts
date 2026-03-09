import { describe, expect, it } from 'vitest'

import { getGroupRangeFromDateRange, getStatKeyFromDateRange } from '../useHashrateData'

import { DATE_RANGE } from '@/constants'

describe('useHashrateData', () => {
  describe('getGroupRangeFromDateRange', () => {
    it('returns H1 for range <= 1 day', () => {
      const start = new Date('2025-01-01T00:00:00')
      const end = new Date('2025-01-01T12:00:00')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.H1)
    })
    it('returns D1 for range <= 30 days', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-15')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.D1)
    })
    it('returns W1 for range > 30 days', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-02-15')
      expect(getGroupRangeFromDateRange(start, end)).toBe(DATE_RANGE.W1)
    })
  })

  describe('getStatKeyFromDateRange', () => {
    it('returns stat key based on date range span', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-02')
      expect(typeof getStatKeyFromDateRange(start, end)).toBe('string')
    })
  })
})
