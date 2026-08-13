import { describe, expect, it } from 'vitest'

import { buildPowerConsumptionParams } from '../usePowerConsumption'

describe('usePowerConsumption', () => {
  describe('buildPowerConsumptionParams', () => {
    it('should build correct power consumption params with formatted dates', () => {
      const start = 1735686000000 // Jan 1, 2025 00:00:00 UTC
      const end = 1735772400000 // Jan 2, 2025 00:00:00 UTC
      const result = buildPowerConsumptionParams({ start, end })

      const parsed = JSON.parse(result.keys)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].type).toBe('powermeter')
      expect(parsed[0].fields).toEqual({ site_power_w: 1 })
      expect(parsed[0].aggrFields).toEqual({ site_power_w: 1 })
      expect(parsed[0].shouldReturnDailyData).toBe(1)
      // Check that dates are formatted correctly (ISO format with Z)
      expect(parsed[0].startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(parsed[0].endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      // Verify dates correspond to the input timestamps
      expect(new Date(parsed[0].startDate).getTime()).toBe(start)
      expect(new Date(parsed[0].endDate).getTime()).toBe(end)
    })
  })
})
