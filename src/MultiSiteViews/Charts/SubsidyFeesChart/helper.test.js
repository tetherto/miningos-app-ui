import _keys from 'lodash/keys'
import { describe, expect, it } from 'vitest'

import {
  adaptRevenueData,
  getDataset,
  getFeePercentLineDataset,
  processSubsidyFeesDataset,
} from './helper'

import { CURRENCY } from '@/constants/units'

describe('SubsidyFeesChart helpers', () => {
  describe('adaptRevenueData', () => {
    it('should adapt raw revenue data correctly', () => {
      const rawData = [
        {
          ts: 1752710400000, // "Jul 17, 2025"
          totalRevenueBTC: 0.1,
          totalFeesBTC: 0.02,
        },
        {
          ts: 1752796800000,
          totalRevenueBTC: 0,
          totalFeesBTC: 0.01,
        },
        {
          ts: 1752883200000,
          totalRevenueBTC: null,
          totalFeesBTC: 0.005,
        },
      ]

      const result = adaptRevenueData(rawData)

      expect(result).toEqual([
        {
          month: '2025-07-17',
          fees: 0.02,
          subsidy: 0.08,
          feePercent: 0.19999999999999998,
        },
      ])
    })

    it('should handle empty or invalid data gracefully', () => {
      const rawData = []

      const result = adaptRevenueData(rawData)

      expect(result).toEqual([])

      const invalidData = [
        { ts: 1752710400000, totalRevenueBTC: 0.1, totalFeesBTC: 0.02 },
        { ts: 1752796800000, totalRevenueBTC: 0, totalFeesBTC: 0.01 },
        { ts: 1752883200000, totalRevenueBTC: null, totalFeesBTC: 0.005 },
        { ts: 1752969600000 }, // Missing fees
      ]

      const invalidResult = adaptRevenueData(invalidData)
      expect(invalidResult).toEqual([
        {
          month: '2025-07-17',
          fees: 0.02,
          subsidy: 0.08,
          feePercent: 0.19999999999999998,
        },
      ])
    })
  })

  describe('getDataset', () => {
    it('should return stacked dataset with subsidy and fees values', () => {
      const input = [
        {
          month: 'Jul 17',
          fees: 0.02,
          subsidy: 0.08,
          feePercent: 20,
        },
      ]

      const result = getDataset(input)

      expect(result).toHaveLength(2)

      const [subsidyDataset, feesDataset] = result

      expect(subsidyDataset.label).toBe('Subsidy')
      expect(feesDataset.label).toBe('Fees')

      expect(subsidyDataset['Jul 17'].value).toBe(0.08)
      expect(subsidyDataset['Jul 17'].displayLabel).toBe('Subsidy')

      expect(feesDataset['Jul 17'].value).toBe(0.02)
      expect(feesDataset['Jul 17'].displayLabel).toBe('Fees')
    })

    it('should handle empty data gracefully', () => {
      const result = getDataset([])

      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('Subsidy')
      expect(result[1].label).toBe('Fees')
      expect(_keys(result[0]).length).toBe(4) // label, stackGroup and legendColor
      expect(_keys(result[1]).length).toBe(4) // label, stackGroup and legendColor
    })
  })

  describe('getFeePercentLineDataset', () => {
    it('should return correct line dataset for fee %', () => {
      const data = [
        {
          month: 'Jul 17',
          fees: 0.02,
          subsidy: 0.08,
          feePercent: 20,
        },
      ]

      const result = getFeePercentLineDataset(data)

      expect(result).toBeDefined()
      expect(result.label).toBe('Fee %')
      expect(result.data).toEqual({ 'Jul 17': 20 })
      expect(result.yAxisID).toBe('y1')
    })

    it('should handle empty data gracefully', () => {
      const result = getFeePercentLineDataset([])

      expect(result).toBeDefined()
      expect(result.data).toEqual({})
      expect(result.label).toBe('Fee %')
      expect(result.yAxisID).toBe('y1')
    })
  })

  describe('processSubsidyFeesDataset', () => {
    it('should convert to SATS when no month has sum > 1 BTC', () => {
      // Raw data format: fees + subsidy = totalRevenueBTC
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.004786880546267852 + 0.01250858479031507,
          totalFeesBTC: 0.004786880546267852,
        },
        {
          ts: 1730332800000, // Nov 30, 2024
          totalRevenueBTC: 0.00854608105839396 + 0.024235383031235444,
          totalFeesBTC: 0.00854608105839396,
        },
      ]

      // Sums: 0.0173 and 0.0328, both <= 1, so should convert to SATS
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.SATS)
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(monthKeys.length).toBe(2)

      // Check that values are converted to SATS (multiplied by 1,000,000)
      const firstMonthKey = monthKeys[0]
      const secondMonthKey = monthKeys[1]
      expect(result.dataset[0][firstMonthKey].value).toBeCloseTo(12508.58479031507, 5)
      expect(result.dataset[0][firstMonthKey].original).toBeCloseTo(12508.58479031507, 5)
      expect(result.dataset[1][firstMonthKey].value).toBeCloseTo(4786.880546267852, 5)
      expect(result.dataset[1][firstMonthKey].original).toBeCloseTo(4786.880546267852, 5)
      expect(result.dataset[0][secondMonthKey].value).toBeCloseTo(24235.383031235444, 5)
      expect(result.dataset[1][secondMonthKey].value).toBeCloseTo(8546.08105839396, 5)
      expect(result.lineDataset.data[firstMonthKey]).toBeCloseTo(0.27677084444457045, 10)
      expect(result.lineDataset.data[secondMonthKey]).toBeCloseTo(0.26069857755674675, 10)
    })

    it('should keep BTC when any month has sum > 1 BTC', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.5 + 0.6,
          totalFeesBTC: 0.5,
        },
        {
          ts: 1730332800000, // Nov 30, 2024
          totalRevenueBTC: 0.7 + 0.8,
          totalFeesBTC: 0.7,
        },
      ]

      // Sums: 1.1 and 1.5, both > 1, so should keep BTC
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.BTC)
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      const firstMonthKey = monthKeys[0]
      const secondMonthKey = monthKeys[1]
      expect(result.dataset[0][firstMonthKey].value).toBeCloseTo(0.6, 10)
      expect(result.dataset[1][firstMonthKey].value).toBeCloseTo(0.5, 10)
      expect(result.dataset[0][secondMonthKey].value).toBeCloseTo(0.8, 10)
      expect(result.dataset[1][secondMonthKey].value).toBeCloseTo(0.7, 10)

      // feePercent = fees / totalRevenue
      // First month: 0.5 / 1.1 = 0.454545...
      // Second month: 0.7 / 1.5 = 0.466666...
      expect(result.lineDataset.data[firstMonthKey]).toBeCloseTo(0.45454545454545453, 10)
      expect(result.lineDataset.data[secondMonthKey]).toBeCloseTo(0.4666666666666667, 10)
    })

    it('should keep BTC when only one month has sum > 1 BTC', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.3 + 0.4,
          totalFeesBTC: 0.3,
        },
        {
          ts: 1730332800000, // Nov 30, 2024
          totalRevenueBTC: 0.6 + 0.5,
          totalFeesBTC: 0.6,
        },
      ]

      // Sums: 0.7 (<= 1) and 1.1 (> 1), so should keep BTC because one month > 1
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.BTC)
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      const firstMonthKey = monthKeys[0]
      const secondMonthKey = monthKeys[1]
      expect(result.dataset[0][firstMonthKey].value).toBeCloseTo(0.4, 10)
      expect(result.dataset[1][firstMonthKey].value).toBeCloseTo(0.3, 10)
      expect(result.dataset[0][secondMonthKey].value).toBeCloseTo(0.5, 10)
      expect(result.dataset[1][secondMonthKey].value).toBeCloseTo(0.6, 10)
    })

    it('should handle empty data gracefully', () => {
      const result = processSubsidyFeesDataset([], false)

      expect(result.dataset).toHaveLength(2)
      expect(result.dataset[0].label).toBe('Subsidy')
      expect(result.dataset[1].label).toBe('Fees')
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(monthKeys.length).toBe(0)
      expect(result.lineDataset.label).toBe('Fee %')
      expect(result.lineDataset.data).toEqual({})
      expect(result.currencyUnit).toBe(CURRENCY.BTC)
    })

    it('should handle null data gracefully', () => {
      const result = processSubsidyFeesDataset(null, false)

      expect(result.dataset).toHaveLength(2)
      expect(result.dataset[0].label).toBe('Subsidy')
      expect(result.dataset[1].label).toBe('Fees')
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(monthKeys.length).toBe(0)
      expect(result.lineDataset.label).toBe('Fee %')
      expect(result.lineDataset.data).toEqual({})
      expect(result.currencyUnit).toBe(CURRENCY.BTC)
    })

    it('should preserve non-value properties when converting to SATS', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.3 + 0.4,
          totalFeesBTC: 0.3,
        },
      ]

      // Sum: 0.7 <= 1, so should convert to SATS
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.SATS)
      expect(result.dataset[0].label).toBe('Subsidy')
      expect(result.dataset[0].stackGroup).toBe('stack1')
      expect(result.dataset[1].label).toBe('Fees')
      expect(result.dataset[1].stackGroup).toBe('stack1')

      // Check that style and other properties are preserved
      const monthKey = Object.keys(result.dataset[0]).find(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(result.dataset[0][monthKey].style).toBeDefined()
      expect(result.dataset[0][monthKey].displayLabel).toBe('Subsidy')
      expect(result.dataset[1][monthKey].displayLabel).toBe('Fees')

      expect(result.dataset[0][monthKey].value).toBeCloseTo(400000, 5)
      expect(result.dataset[1][monthKey].value).toBeCloseTo(300000, 5)
    })

    it('should handle edge case where sum is exactly 1', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.5 + 0.5,
          totalFeesBTC: 0.5,
        },
      ]

      // Sum: 1.0, which is NOT > 1, so should convert to SATS
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.SATS)
      const monthKey = Object.keys(result.dataset[0]).find(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(result.dataset[0][monthKey].value).toBe(500000)
      expect(result.dataset[1][monthKey].value).toBe(500000)
    })

    it('should handle multiple months with mixed values', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0.1 + 0.2,
          totalFeesBTC: 0.1,
        },
        {
          ts: 1730332800000, // Nov 30, 2024
          totalRevenueBTC: 0.6 + 0.7,
          totalFeesBTC: 0.6,
        },
        {
          ts: 1733011200000, // Dec 31, 2024
          totalRevenueBTC: 0.8 + 0.9,
          totalFeesBTC: 0.8,
        },
      ]

      // Sums: 0.3, 1.3, 1.7 - month 11-30 and 12-31 have sum > 1, so should keep BTC
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.BTC)
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(monthKeys.length).toBe(3)
      expect(result.dataset[0][monthKeys[0]].value).toBeCloseTo(0.2, 10)
      expect(result.dataset[1][monthKeys[0]].value).toBeCloseTo(0.1, 10)
      expect(result.dataset[0][monthKeys[1]].value).toBeCloseTo(0.7, 10)
      expect(result.dataset[1][monthKeys[1]].value).toBeCloseTo(0.6, 10)
      expect(result.dataset[0][monthKeys[2]].value).toBeCloseTo(0.9, 10)
      expect(result.dataset[1][monthKeys[2]].value).toBeCloseTo(0.8, 10)

      // feePercent = fees / totalRevenue
      // First month: 0.1 / 0.3 = 0.333333...
      // Second month: 0.6 / 1.3 = 0.461538...
      // Third month: 0.8 / 1.7 = 0.470588...
      expect(result.lineDataset.data[monthKeys[0]]).toBeCloseTo(0.3333333333333333, 10)
      expect(result.lineDataset.data[monthKeys[1]]).toBeCloseTo(0.46153846153846156, 10)
      expect(result.lineDataset.data[monthKeys[2]]).toBeCloseTo(0.47058823529411764, 10)
    })

    it('should handle zero values correctly', () => {
      const rawData = [
        {
          ts: 1727740800000, // Oct 31, 2024
          totalRevenueBTC: 0,
          totalFeesBTC: 0,
        },
        {
          ts: 1730332800000, // Nov 30, 2024
          totalRevenueBTC: 0.5 + 0.6,
          totalFeesBTC: 0.5,
        },
      ]

      // Sums: 0 and 1.1 - month 11-30 has sum > 1, so should keep BTC
      const result = processSubsidyFeesDataset(rawData, true)

      expect(result.currencyUnit).toBe(CURRENCY.BTC)
      const monthKeys = Object.keys(result.dataset[0]).filter(
        (key) => key !== 'label' && key !== 'stackGroup' && key !== 'legendColor' && key !== 'unit',
      )
      expect(monthKeys.length).toBe(1)
      expect(result.dataset[0][monthKeys[0]].value).toBeCloseTo(0.6, 10)
      expect(result.dataset[1][monthKeys[0]].value).toBeCloseTo(0.5, 10)
    })
  })
})
