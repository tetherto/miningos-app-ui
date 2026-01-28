import { describe, it, expect } from 'vitest'

import {
  sumObjectValues,
  transformMinersStatusData,
  createHashrateFormatter,
  getHashrateDisplayUnit,
  formatPowerConsumption,
  formatEfficiency,
} from './utils'

describe('OperationsDashboard.utils', () => {
  describe('sumObjectValues', () => {
    it('should sum all numeric values in an object', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(sumObjectValues(obj)).toBe(6)
    })

    it('should handle empty object', () => {
      expect(sumObjectValues({})).toBe(0)
    })

    it('should handle null/undefined', () => {
      expect(sumObjectValues(null)).toBe(0)
      expect(sumObjectValues(undefined)).toBe(0)
    })

    it('should ignore non-numeric values', () => {
      const obj = { a: 1, b: null as unknown as number, c: 3, d: undefined as unknown as number }
      expect(sumObjectValues(obj)).toBe(4)
    })
  })

  describe('transformMinersStatusData', () => {
    it('should transform aggregated data to chart format', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: 1704153600000, // 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(4)
      expect(result.dataset[0].label).toBe('Online')
      expect(result.dataset[1].label).toBe('Not Mining (Sleep + Error)')
      expect(result.dataset[2].label).toBe('Offline')
      expect(result.dataset[3].label).toBe('Maintenance')

      // Check that each dataset has the correct stackGroup
      expect(result.dataset[0].stackGroup).toBe('miners')
      expect(result.dataset[1].stackGroup).toBe('miners')

      // Check that data is structured correctly with date labels as keys
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      expect((result.dataset[1]['01-01'] as { value: number }).value).toBe(7)
      expect((result.dataset[2]['01-01'] as { value: number }).value).toBe(3)
      expect((result.dataset[3]['01-01'] as { value: number }).value).toBe(10)

      // Check second day
      expect((result.dataset[0]['01-02'] as { value: number }).value).toBe(105)
      expect((result.dataset[1]['01-02'] as { value: number }).value).toBe(4)
    })

    it('should handle timestamp range strings (e.g., "1704067200000-1704153599999")', () => {
      const aggregatedData = [
        {
          ts: '1704067200000-1704153599999', // Range string for 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: '1704153600000-1704239999999', // Range string for 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(4)
      expect(result.dataset[0].label).toBe('Online')

      // Check that date labels are correctly extracted from range strings
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      expect(result.dataset[0]['01-02']).toBeDefined()
      expect((result.dataset[0]['01-02'] as { value: number }).value).toBe(105)
    })

    it('should handle mixed numeric and string timestamps', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // Numeric timestamp for 2024-01-01
          online: 100,
          error: 0,
          notMining: 7,
          offline: 3,
          sleep: 0,
          maintenance: 10,
        },
        {
          ts: '1704153600000-1704239999999', // Range string for 2024-01-02
          online: 105,
          error: 0,
          notMining: 4,
          offline: 2,
          sleep: 0,
          maintenance: 9,
        },
      ]

      const result = transformMinersStatusData(aggregatedData)

      expect(result.dataset).toHaveLength(4)
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect(result.dataset[0]['01-02']).toBeDefined()
    })

    it('should filter out entries with invalid timestamps', () => {
      const aggregatedData = [
        {
          ts: 1704067200000, // Valid timestamp
          online: 100,
          notMining: 7,
          offline: 3,
          maintenance: 10,
        },
        {
          ts: 'invalid-timestamp',
          online: 50,
          notMining: 2,
          offline: 1,
          maintenance: 5,
        },
        {
          ts: NaN,
          online: 25,
          notMining: 1,
          offline: 0,
          maintenance: 2,
        },
      ]

      const result = transformMinersStatusData(
        aggregatedData as unknown as Parameters<typeof transformMinersStatusData>[0],
      )

      expect(result.dataset).toHaveLength(4)
      // Only the valid entry should be included
      expect(result.dataset[0]['01-01']).toBeDefined()
      expect((result.dataset[0]['01-01'] as { value: number }).value).toBe(100)
      // Invalid entries should not create keys
      expect(Object.keys(result.dataset[0]).filter((k) => k.match(/^\d{2}-\d{2}$/))).toHaveLength(1)
    })

    it('should return empty dataset when all timestamps are invalid', () => {
      const aggregatedData = [
        {
          ts: 'invalid',
          online: 100,
          notMining: 7,
          offline: 3,
          maintenance: 10,
        },
      ]

      const result = transformMinersStatusData(
        aggregatedData as unknown as Parameters<typeof transformMinersStatusData>[0],
      )

      expect(result.dataset).toEqual([])
    })

    it('should handle empty array', () => {
      const result = transformMinersStatusData([])
      expect(result.dataset).toEqual([])
    })

    it('should handle null and undefined input', () => {
      expect(transformMinersStatusData(null)).toEqual({ dataset: [] })
      expect(transformMinersStatusData(undefined)).toEqual({ dataset: [] })
    })
  })

  describe('getHashrateDisplayUnit', () => {
    it('should return appropriate unit based on magnitude', () => {
      expect(getHashrateDisplayUnit(100)).toBe('MH/s') // 100 MH/s
      expect(getHashrateDisplayUnit(1000)).toBe('GH/s') // 1 GH/s
      expect(getHashrateDisplayUnit(1000000)).toBe('TH/s') // 1 TH/s
      expect(getHashrateDisplayUnit(78275000)).toBe('TH/s') // 78.28 TH/s
      expect(getHashrateDisplayUnit(1000000000)).toBe('PH/s') // 1 PH/s
    })

    it('should handle zero', () => {
      expect(getHashrateDisplayUnit(0)).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(getHashrateDisplayUnit(null)).toBe('')
      expect(getHashrateDisplayUnit(undefined)).toBe('')
    })
  })

  describe('createHashrateFormatter', () => {
    it('should create formatter that converts to specified unit', () => {
      const thsFormatter = createHashrateFormatter('TH/s')
      expect(thsFormatter(1000000)).toBe('1.00') // 1 TH/s
      expect(thsFormatter(78275000)).toBe('78.28') // 78.28 TH/s

      const phsFormatter = createHashrateFormatter('PH/s')
      expect(phsFormatter(1000000000)).toBe('1.00') // 1 PH/s
      expect(phsFormatter(59319000000)).toBe('59.32') // 59.32 PH/s
    })

    it('should handle zero', () => {
      const formatter = createHashrateFormatter('TH/s')
      expect(formatter(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      const formatter = createHashrateFormatter('TH/s')
      expect(formatter(null)).toBe('0')
      expect(formatter(undefined)).toBe('0')
    })
  })

  describe('formatPowerConsumption', () => {
    it('should format power from watts to MW (numeric value only)', () => {
      expect(formatPowerConsumption(1000000)).toBe('1.00')
      expect(formatPowerConsumption(22489000)).toBe('22.49')
    })

    it('should handle zero', () => {
      expect(formatPowerConsumption(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      expect(formatPowerConsumption(null)).toBe('0')
      expect(formatPowerConsumption(undefined)).toBe('0')
    })
  })

  describe('formatEfficiency', () => {
    it('should format efficiency with 2 decimal places (numeric value only)', () => {
      expect(formatEfficiency(34.52)).toBe('34.52')
      expect(formatEfficiency(32.0)).toBe('32.00')
    })

    it('should handle zero', () => {
      expect(formatEfficiency(0)).toBe('0')
    })

    it('should handle null/undefined', () => {
      expect(formatEfficiency(null)).toBe('0')
      expect(formatEfficiency(undefined)).toBe('0')
    })
  })
})
