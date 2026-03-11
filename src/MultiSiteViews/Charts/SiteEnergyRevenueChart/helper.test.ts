import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import { describe, expect, it } from 'vitest'

import { processBtcDatasetForSatsConversion } from './helper'

import type { BarChartDataset } from '@/Components/BarChart/BarChart'
import { CURRENCY, UNITS } from '@/constants/units'

// Helper function to safely get value from dataset
const getValue = (
  dataset: BarChartDataset[],
  index: number,
  dateKey: string,
): number | null | undefined => {
  const item = dataset[index]?.[dateKey]
  if (item && _isObject(item) && !Array.isArray(item) && 'value' in item) {
    return item.value as number | null | undefined
  }

  return undefined
}

// Helper function to get BarChartDataItem from dataset
const getDataItem = (
  dataset: BarChartDataset[],
  index: number,
  dateKey: string,
): { value?: number; style?: unknown; legendColor?: unknown } | undefined => {
  const item = dataset[index]?.[dateKey]
  if (item && _isObject(item) && !_isArray(item) && 'value' in item) {
    return item as { value?: number; style?: unknown; legendColor?: unknown }
  }
  return undefined
}

describe('processBtcDatasetForSatsConversion', () => {
  it('should return empty dataset and BTC unit when dataset is empty', () => {
    const result = processBtcDatasetForSatsConversion([])

    expect(result.dataset).toEqual([])
    expect(result.unit).toBe(`${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`)
  })

  it('should return empty dataset and BTC unit when dataset is null', () => {
    const result = processBtcDatasetForSatsConversion(null)

    expect(result.dataset).toEqual([])
    expect(result.unit).toBe(`${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`)
  })

  it('should return empty dataset and BTC unit when dataset is undefined', () => {
    const result = processBtcDatasetForSatsConversion(undefined)

    expect(result.dataset).toEqual([])
    expect(result.unit).toBe(`${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`)
  })

  it('should convert to Sats when all values are below 1 BTC', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.5, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 0.8, style: {}, legendColor: 'red' },
        '2024-01-03': { value: 0.9, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(result.dataset).toHaveLength(1)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(500_000)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(800_000)
    expect(getValue(result.dataset, 0, '2024-01-03')).toBe(900_000)
    expect(result.dataset[0]?.label).toBe('Energy Revenue BTC')
  })

  it('should convert to Sats when all values are exactly 1 BTC', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 1.0, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 1.0, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(1_000_000)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(1_000_000)
  })

  it('should NOT convert to Sats when any value is above 1 BTC', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.5, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 1.5, style: {}, legendColor: 'red' }, // Above threshold
        '2024-01-03': { value: 0.9, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`)
    expect(result.dataset).toHaveLength(1)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(0.5)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(1.5)
    expect(getValue(result.dataset, 0, '2024-01-03')).toBe(0.9)
  })

  it('should NOT convert to Sats when any value is significantly above 1 BTC', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.1, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 2.5, style: {}, legendColor: 'red' }, // Above threshold
        '2024-01-03': { value: 0.05, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.BTC}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(0.1)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(2.5)
    expect(getValue(result.dataset, 0, '2024-01-03')).toBe(0.05)
  })

  it('should preserve all properties when converting to Sats', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': {
          value: 0.5,
          style: { backgroundColor: 'red' },
          legendColor: 'red',
        },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(500_000)
    const item = getDataItem(result.dataset, 0, '2024-01-01')
    expect(item?.style).toEqual({ backgroundColor: 'red' })
    expect(item?.legendColor).toBe('red')
    expect(result.dataset[0]?.label).toBe('Energy Revenue BTC')
  })

  it('should handle multiple dates correctly', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.3, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 0.4, style: {}, legendColor: 'red' },
        '2024-01-03': { value: 0.5, style: {}, legendColor: 'red' },
        '2024-01-04': { value: 0.6, style: {}, legendColor: 'red' },
        '2024-01-05': { value: 0.7, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(300_000)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(400_000)
    expect(getValue(result.dataset, 0, '2024-01-03')).toBe(500_000)
    expect(getValue(result.dataset, 0, '2024-01-04')).toBe(600_000)
    expect(getValue(result.dataset, 0, '2024-01-05')).toBe(700_000)
  })

  it('should handle null or undefined values gracefully', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.5, style: {}, legendColor: 'red' },
        '2024-01-02': { value: null as unknown as number, style: {}, legendColor: 'red' },
        '2024-01-03': { value: undefined, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(500_000)
    // null and undefined values should remain unchanged
    expect(getValue(result.dataset, 0, '2024-01-02')).toBeNull()
    expect(getValue(result.dataset, 0, '2024-01-03')).toBeUndefined()
  })

  it('should handle zero values correctly', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 0.5, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(0)
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(500_000)
  })

  it('should handle very small values correctly', () => {
    const dataset: BarChartDataset[] = [
      {
        label: 'Energy Revenue BTC',
        '2024-01-01': { value: 0.000001, style: {}, legendColor: 'red' },
        '2024-01-02': { value: 0.0005, style: {}, legendColor: 'red' },
      },
    ]

    const result = processBtcDatasetForSatsConversion(dataset)

    expect(result.unit).toBe(`${CURRENCY.SATS}/${UNITS.ENERGY_MWH}`)
    expect(getValue(result.dataset, 0, '2024-01-01')).toBe(1) // 0.000001 * 1,000,000 = 1
    expect(getValue(result.dataset, 0, '2024-01-02')).toBe(500) // 0.0005 * 1,000,000 = 500
  })
})
