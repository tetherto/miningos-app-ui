import { describe, expect, it } from 'vitest'

import { buildElectricityParams } from '../useElectricityCurtailmentData'

import { EXT_DATA_GROUP_RANGE } from '@/app/utils/electricityUtils'
import { DATE_RANGE } from '@/constants'

describe('useElectricityCurtailmentData', () => {
  describe('buildElectricityParams', () => {
    it('should use "1M" groupRange for monthly view (>= 25 days)', () => {
      // 30 days range (monthly view)
      const start = 1735686000000 // Jan 1, 2025
      const end = 1738281600000 // Jan 31, 2025 (30 days later)
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(result.type).toBe('electricity')
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.MONTH1)
      expect(parsed.dataInterval).toBe(DATE_RANGE.H1)
      expect(parsed.key).toBe('stats-history')
      expect(parsed.start).toBe(start)
      expect(parsed.end).toBe(end)
    })

    it('should use "1M" groupRange for yearly view (>= 25 days)', () => {
      // 365 days range (yearly view)
      const start = 1735686000000 // Jan 1, 2025
      const end = 1767222000000 // Jan 1, 2026 (365 days later)
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.MONTH1)
    })

    it('should use "1D" groupRange for daily view (< 25 days)', () => {
      // 1 day range (daily view)
      const start = 1735686000000 // Jan 1, 2025
      const end = 1735772400000 // Jan 2, 2025 (1 day later)
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should use "1D" groupRange for weekly view (< 25 days)', () => {
      // 7 days range (weekly view)
      const start = 1735686000000 // Jan 1, 2025
      const end = 1736290800000 // Jan 8, 2025 (7 days later)
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should use "1M" groupRange for exactly 25 days', () => {
      // Exactly 25 days (boundary case)
      const start = 1735686000000
      const end = start + 25 * 24 * 60 * 60 * 1000 // 25 days in milliseconds
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.MONTH1)
    })

    it('should use "1D" groupRange for 24 days (just below threshold)', () => {
      // 24 days (just below 25 day threshold)
      const start = 1735686000000
      const end = start + 24 * 24 * 60 * 60 * 1000 // 24 days in milliseconds
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.D1)
    })

    it('should always include dataInterval as "1h"', () => {
      const start = 1735686000000
      const end = 1735772400000
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.dataInterval).toBe(DATE_RANGE.H1)
    })

    it('should handle edge case with very large date range', () => {
      // Multiple years
      const start = 1735686000000
      const end = start + 730 * 24 * 60 * 60 * 1000 // 730 days (2 years)
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.MONTH1)
    })

    it('should handle edge case with very small date range', () => {
      // Less than 1 day
      const start = 1735686000000
      const end = start + 12 * 60 * 60 * 1000 // 12 hours
      const result = buildElectricityParams({ start, end })

      const parsed = JSON.parse(result.query)
      expect(parsed.groupRange).toBe(EXT_DATA_GROUP_RANGE.D1)
    })
  })
})
