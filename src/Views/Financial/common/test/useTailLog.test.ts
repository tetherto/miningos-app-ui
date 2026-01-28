import { describe, expect, it } from 'vitest'

import { buildTailLogRangeAggrParams } from '../useTailLog'

describe('useTailLog', () => {
  describe('buildPowerConsumptionParams', () => {
    it('should build correct power consumption params with formatted dates', () => {
      const start = 1735686000000 // Jan 1, 2025 00:00:00 UTC
      const end = 1735772400000 // Jan 2, 2025 00:00:00 UTC
      const result = buildTailLogRangeAggrParams({ start, end })

      const parsed = JSON.parse(result.keys)
      expect(parsed).toHaveLength(2)

      // Miner data
      expect(parsed[0].type).toBe('miner')
      expect(parsed[0].fields).toEqual({ hashrate_mhs_5m_sum_aggr: 1 })
      expect(parsed[0].shouldReturnDailyData).toBe(1)
      // Check that dates are formatted correctly (ISO format with Z)
      expect(parsed[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(parsed[0].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      // Verify dates correspond to the input timestamps
      expect(new Date(parsed[0].startDate).getTime()).toBe(start)
      expect(new Date(parsed[0].endDate).getTime()).toBe(end)

      // Powermeter data
      expect(parsed[1].type).toBe('powermeter')
      expect(parsed[1].fields).toEqual({ site_power_w: 1 })
      expect(parsed[1].aggrFields).toEqual({ site_power_w: 1 })
      expect(parsed[1].shouldReturnDailyData).toBe(1)
      // Check that dates are formatted correctly (ISO format with Z)
      expect(parsed[1].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(parsed[1].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      // Verify dates correspond to the input timestamps
      expect(new Date(parsed[1].startDate).getTime()).toBe(start)
      expect(new Date(parsed[1].endDate).getTime()).toBe(end)
    })
  })
})
