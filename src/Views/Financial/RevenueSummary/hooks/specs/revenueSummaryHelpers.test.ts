import { describe, expect, it } from 'vitest'

import { getStartOfDay, getPeriodKey, getPeriodEndDate, safeDiv } from '../revenueSummaryHelpers'

import { PERIOD } from '@/constants/ranges'

describe('revenueSummaryHelpers', () => {
  describe('getStartOfDay', () => {
    it('returns start of day timestamp', () => {
      const ts = new Date('2025-06-15T14:30:00Z').getTime()
      const result = getStartOfDay(ts)
      expect(new Date(result).getUTCHours()).toBe(0)
      expect(new Date(result).getUTCMinutes()).toBe(0)
    })
  })

  describe('getPeriodKey', () => {
    it('returns daily key for daily period', () => {
      const ts = new Date('2025-06-15T12:00:00Z').getTime()
      const result = getPeriodKey(ts, PERIOD.DAILY)
      expect(result).toBeDefined()
    })
    it('returns monthly key for monthly period', () => {
      const ts = new Date('2025-06-15').getTime()
      const result = getPeriodKey(ts, PERIOD.MONTHLY)
      expect(result).toBeDefined()
    })
  })

  describe('getPeriodEndDate', () => {
    it('returns end date for monthly', () => {
      const periodTs = new Date('2025-06-01').getTime()
      const result = getPeriodEndDate(periodTs, PERIOD.MONTHLY)
      expect(result.getMonth()).toBe(6)
    })
    it('returns end date for yearly', () => {
      const periodTs = new Date('2025-01-01').getTime()
      const result = getPeriodEndDate(periodTs, PERIOD.YEARLY)
      expect(result.getFullYear()).toBe(2026)
    })
  })

  describe('safeDiv', () => {
    it('divides when denominator non-zero', () => {
      expect(safeDiv(10, 2)).toBe(5)
    })
    it('returns null when denominator is 0', () => {
      expect(safeDiv(10, 0)).toBeNull()
    })
    it('returns null when numerator or denominator invalid', () => {
      expect(safeDiv(undefined, 1)).toBeNull()
      expect(safeDiv(1, null)).toBeNull()
    })
  })
})
