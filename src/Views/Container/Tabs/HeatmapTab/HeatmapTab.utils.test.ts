import { getHeatmapRangeValue, getHeatmapUnit } from './HeatmapTab.utils'

import { HEATMAP_MODE } from '@/constants/temperatureConstants'
import { UNITS } from '@/constants/units'

describe('HeatmapTab.utils', () => {
  describe('getHeatmapUnit', () => {
    it('returns TH/s for hashrate mode with TH/s range values', () => {
      const ranges = { hashrate: { min: 5_000_000, max: 10_000_000 } } // 5-10 TH/s
      expect(getHeatmapUnit(HEATMAP_MODE.HASHRATE, ranges)).toBe(UNITS.HASHRATE_TH_S)
    })

    it('returns PH/s for hashrate mode with PH/s range values', () => {
      const ranges = { hashrate: { min: 1_000_000_000, max: 5_000_000_000 } } // 1-5 PH/s
      expect(getHeatmapUnit(HEATMAP_MODE.HASHRATE, ranges)).toBe(UNITS.HASHRATE_PH_S)
    })

    it('returns TH/s for hashrate mode without ranges (fallback)', () => {
      expect(getHeatmapUnit(HEATMAP_MODE.HASHRATE)).toBe(UNITS.HASHRATE_TH_S)
    })

    it('returns °C for non-hashrate modes', () => {
      expect(getHeatmapUnit('unknown')).toBe(UNITS.TEMPERATURE_C)
      expect(getHeatmapUnit('')).toBe(UNITS.TEMPERATURE_C)
    })
  })

  describe('getHeatmapRangeValue', () => {
    const mockRanges = {
      temperature: { min: 25.4, max: 85.7 },
      // Hashrate values in MH/s: 5,000,000 MH/s = 5 TH/s, 10,000,000 MH/s = 10 TH/s
      hashrate: { min: 5_000_000, max: 10_000_000 },
    }

    it('returns rounded min value for temperature', () => {
      expect(getHeatmapRangeValue(mockRanges, 'temperature', 'min')).toBe(25)
    })

    it('returns rounded max value for temperature', () => {
      expect(getHeatmapRangeValue(mockRanges, 'temperature', 'max')).toBe(86)
    })

    it('returns formatted hashrate min value in TH/s', () => {
      // 5,000,000 MH/s = 5 TH/s
      expect(getHeatmapRangeValue(mockRanges, 'hashrate', 'min')).toBe(5)
    })

    it('returns formatted hashrate max value in TH/s', () => {
      // 10,000,000 MH/s = 10 TH/s
      expect(getHeatmapRangeValue(mockRanges, 'hashrate', 'max')).toBe(10)
    })

    it('handles PH/s scale hashrate values', () => {
      const phRanges = {
        hashrate: { min: 1_000_000_000, max: 5_000_000_000 }, // 1-5 PH/s
      }
      expect(getHeatmapRangeValue(phRanges, 'hashrate', 'min')).toBe(1)
      expect(getHeatmapRangeValue(phRanges, 'hashrate', 'max')).toBe(5)
    })

    it('returns "-" when ranges is undefined', () => {
      expect(getHeatmapRangeValue(undefined, 'temperature', 'min')).toBe('-')
    })

    it('returns "-" when mode is empty', () => {
      expect(getHeatmapRangeValue(mockRanges, '', 'min')).toBe('-')
    })

    it('returns "-" when mode does not exist in ranges', () => {
      expect(getHeatmapRangeValue(mockRanges, 'unknown', 'min')).toBe('-')
    })

    it('returns "-" when value is undefined', () => {
      const rangesWithUndefined = { temperature: { max: 85 } }
      expect(getHeatmapRangeValue(rangesWithUndefined, 'temperature', 'min')).toBe('-')
    })

    it('returns "-" when value is null', () => {
      const rangesWithNull = { temperature: { min: null as unknown as number, max: 85 } }
      expect(getHeatmapRangeValue(rangesWithNull, 'temperature', 'min')).toBe('-')
    })

    it('returns "-" when hashrate value is NaN', () => {
      const rangesWithNaN = { hashrate: { min: NaN, max: 10_000_000 } }
      expect(getHeatmapRangeValue(rangesWithNaN, 'hashrate', 'min')).toBe('-')
    })

    it('handles zero values correctly for temperature', () => {
      const rangesWithZero = { temperature: { min: 0, max: 100 } }
      expect(getHeatmapRangeValue(rangesWithZero, 'temperature', 'min')).toBe(0)
    })

    it('handles negative values correctly for temperature', () => {
      const rangesWithNegative = { temperature: { min: -10.6, max: 50 } }
      expect(getHeatmapRangeValue(rangesWithNegative, 'temperature', 'min')).toBe(-11)
    })
  })
})
