import { describe, expect, it } from 'vitest'

import {
  calculateAveragePowerMW,
  calculateAvgPowerConsumptionMW,
  extractPowermeterData,
} from './powerConsumptionUtils'

describe('powerConsumptionUtils', () => {
  describe('extractPowermeterData', () => {
    it('should return null for undefined response', () => {
      expect(extractPowermeterData(undefined)).toBeNull()
    })

    it('should return null for null response', () => {
      expect(extractPowermeterData(null)).toBeNull()
    })

    it('should return null for empty array', () => {
      expect(extractPowermeterData([])).toBeNull()
    })

    it('should return null for array with empty nested array', () => {
      expect(extractPowermeterData([[]])).toBeNull()
    })

    it('should extract powermeter data from nested array response', () => {
      const response = [
        [
          { type: 'miner', data: [] },
          {
            type: 'powermeter',
            data: [
              { ts: 1000, val: { site_power_w: 100000 } },
              { ts: 2000, val: { site_power_w: 200000 } },
            ],
          },
        ],
      ]

      const result = extractPowermeterData(response)

      expect(result).toEqual([
        { ts: 1000, val: { site_power_w: 100000 } },
        { ts: 2000, val: { site_power_w: 200000 } },
      ])
    })

    it('should extract powermeter data from single object response', () => {
      const response = [
        { type: 'miner', data: [] },
        {
          type: 'powermeter',
          data: [
            { ts: 1000, val: { site_power_w: 100000 } },
            { ts: 2000, val: { site_power_w: 200000 } },
          ],
        },
      ]

      const result = extractPowermeterData(response)

      expect(result).toEqual([
        { ts: 1000, val: { site_power_w: 100000 } },
        { ts: 2000, val: { site_power_w: 200000 } },
      ])
    })

    it('should return null when powermeter type not found', () => {
      const response = [
        [
          { type: 'miner', data: [] },
          { type: 'container', data: [] },
        ],
      ]

      expect(extractPowermeterData(response)).toBeNull()
    })

    it('should return null when powermeter has no data', () => {
      const response = [[{ type: 'powermeter' }]]

      expect(extractPowermeterData(response)).toBeNull()
    })

    it('should return null when powermeter data is not an array', () => {
      const response = [[{ type: 'powermeter', data: 'invalid' }]]

      expect(extractPowermeterData(response)).toBeNull()
    })
  })

  describe('calculateAveragePowerMW', () => {
    it('should return 0 for null data', () => {
      expect(calculateAveragePowerMW(null)).toBe(0)
    })

    it('should return 0 for empty array', () => {
      expect(calculateAveragePowerMW([])).toBe(0)
    })

    it('should calculate average power consumption in MW', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 1000000 } }, // 1 MW
        { ts: 2000, val: { site_power_w: 2000000 } }, // 2 MW
        { ts: 3000, val: { site_power_w: 3000000 } }, // 3 MW
      ]

      // Average: (1 + 2 + 3) / 3 = 2 MW
      expect(calculateAveragePowerMW(dataPoints)).toBe(2)
    })

    it('should handle data points with missing site_power_w', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 1000000 } }, // 1 MW
        { ts: 2000, val: {} }, // 0 MW (missing)
        { ts: 3000, val: { site_power_w: 3000000 } }, // 3 MW
      ]

      // Average: (1 + 0 + 3) / 3 = 1.333... MW
      expect(calculateAveragePowerMW(dataPoints)).toBeCloseTo(1.333, 2)
    })

    it('should divide by aggrIntervals when present', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 288000000, aggrIntervals: 288 } }, // 1 MW avg
        { ts: 2000, val: { site_power_w: 576000000, aggrIntervals: 288 } }, // 2 MW avg
      ]

      // Average: (1 + 2) / 2 = 1.5 MW
      expect(calculateAveragePowerMW(dataPoints)).toBeCloseTo(1.5, 5)
    })

    it('should handle data points with zero values', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 0 } },
        { ts: 2000, val: { site_power_w: 0 } },
      ]

      expect(calculateAveragePowerMW(dataPoints)).toBe(0)
    })

    it('should handle single data point', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 5000000 } }, // 5 MW
      ]

      expect(calculateAveragePowerMW(dataPoints)).toBe(5)
    })

    it('should handle fractional MW values', () => {
      const dataPoints = [
        { ts: 1000, val: { site_power_w: 141301 } }, // ~0.141 MW
      ]

      expect(calculateAveragePowerMW(dataPoints)).toBeCloseTo(0.141301, 5)
    })
  })

  describe('calculateAvgPowerConsumptionMW', () => {
    it('should return 0 for undefined response', () => {
      expect(calculateAvgPowerConsumptionMW(undefined)).toBe(0)
    })

    it('should return 0 for null response', () => {
      expect(calculateAvgPowerConsumptionMW(null)).toBe(0)
    })

    it('should return 0 for empty response', () => {
      expect(calculateAvgPowerConsumptionMW([])).toBe(0)
    })

    it('should calculate average power consumption from full response', () => {
      const response = [
        [
          { type: 'miner', data: [] },
          {
            type: 'powermeter',
            data: [
              { ts: 1000, val: { site_power_w: 1000000 } }, // 1 MW
              { ts: 2000, val: { site_power_w: 2000000 } }, // 2 MW
              { ts: 3000, val: { site_power_w: 3000000 } }, // 3 MW
            ],
          },
        ],
      ]

      // Average: (1 + 2 + 3) / 3 = 2 MW
      expect(calculateAvgPowerConsumptionMW(response)).toBe(2)
    })

    it('should return 0 when powermeter not found', () => {
      const response = [
        [
          { type: 'miner', data: [] },
          { type: 'container', data: [] },
        ],
      ]

      expect(calculateAvgPowerConsumptionMW(response)).toBe(0)
    })

    it('should handle real-world response structure', () => {
      const response = [
        [
          {
            type: 'powermeter',
            data: [
              { ts: 1702339200000, val: { site_power_w: 141301 } },
              { ts: 1702425600000, val: { site_power_w: 142500 } },
              { ts: 1702512000000, val: { site_power_w: 140800 } },
            ],
          },
        ],
      ]

      const result = calculateAvgPowerConsumptionMW(response)

      // Average: (141301 + 142500 + 140800) / 3 = 141533.67 W = 0.14153367 MW
      expect(result).toBeCloseTo(0.14153, 4)
    })
  })
})
