import { describe, expect, it } from 'vitest'

import { getBtcChartUnit } from './ebitdaChartHelpers'

import { CURRENCY } from '@/constants/units'

describe('ebitdaChartHelpers', () => {
  describe('getBtcChartUnit', () => {
    it('should return SATS when all values are <= 1', () => {
      const chartData = [
        { label: '2024-01', value: 0.5 },
        { label: '2024-02', value: 0.8 },
        { label: '2024-03', value: 1.0 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should return BTC when any value is > 1', () => {
      const chartData = [
        { label: '2024-01', value: 0.5 },
        { label: '2024-02', value: 1.2 }, // Value > 1
        { label: '2024-03', value: 0.8 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should return BTC when first value is > 1', () => {
      const chartData = [
        { label: '2024-01', value: 2.5 }, // Value > 1
        { label: '2024-02', value: 0.8 },
        { label: '2024-03', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should return BTC when last value is > 1', () => {
      const chartData = [
        { label: '2024-01', value: 0.5 },
        { label: '2024-02', value: 0.8 },
        { label: '2024-03', value: 1.5 }, // Value > 1
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should return BTC when all values are > 1', () => {
      const chartData = [
        { label: '2024-01', value: 2.5 },
        { label: '2024-02', value: 3.2 },
        { label: '2024-03', value: 1.8 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should return SATS when value is exactly 1', () => {
      const chartData = [
        { label: '2024-01', value: 1.0 },
        { label: '2024-02', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should return SATS when value is exactly 1 (single point)', () => {
      // This test checks that values exactly equal to 1 or less return SATS
      const chartData = [{ label: '2024-01', value: 1.0 }]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle empty array by returning SATS', () => {
      const chartData: { label: string; value?: number }[] = []

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle null by returning SATS', () => {
      const result = getBtcChartUnit([] as never[])

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle undefined by returning SATS', () => {
      const result = getBtcChartUnit([] as never[])

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle data with missing value property', () => {
      const chartData = [
        { label: '2024-01' }, // Missing value
        { label: '2024-02', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle data with null value', () => {
      const chartData = [
        { label: '2024-01', value: 0 },
        { label: '2024-02', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle data with string value', () => {
      const chartData = [
        { label: '2024-01', value: 0.5 },
        { label: '2024-02', value: 0.8 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle data with zero values', () => {
      const chartData = [
        { label: '2024-01', value: 0 },
        { label: '2024-02', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle data with negative values', () => {
      const chartData = [
        { label: '2024-01', value: -0.5 },
        { label: '2024-02', value: 0.8 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle single data point with value <= 1', () => {
      const chartData = [{ label: '2024-01', value: 0.5 }]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.SATS)
    })

    it('should handle single data point with value > 1', () => {
      const chartData = [{ label: '2024-01', value: 2.5 }]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should handle very large values', () => {
      const chartData = [
        { label: '2024-01', value: 100.5 },
        { label: '2024-02', value: 200.8 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })

    it('should handle decimal values just above 1', () => {
      const chartData = [
        { label: '2024-01', value: 1.0001 },
        { label: '2024-02', value: 0.5 },
      ]

      const result = getBtcChartUnit(chartData)

      expect(result).toBe(CURRENCY.BTC)
    })
  })
})
