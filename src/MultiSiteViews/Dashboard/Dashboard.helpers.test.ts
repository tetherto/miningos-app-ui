import { describe, it, expect } from 'vitest'

import { processRevenueDatasetWith1MThreshold } from './Dashboard.helpers'

import { CURRENCY } from '@/constants/units'

describe('processRevenueDatasetWith1MThreshold', () => {
  it('should return empty dataset and BTC currency for empty input', () => {
    const result = processRevenueDatasetWith1MThreshold([])
    expect(result).toEqual({ dataset: [], currencyUnit: CURRENCY.BTC })
  })

  it('should return empty dataset and BTC currency for null input', () => {
    const result = processRevenueDatasetWith1MThreshold(null)
    expect(result).toEqual({ dataset: [], currencyUnit: CURRENCY.BTC })
  })

  it('should return empty dataset and BTC currency for undefined input', () => {
    const result = processRevenueDatasetWith1MThreshold(undefined)
    expect(result).toEqual({ dataset: [], currencyUnit: CURRENCY.BTC })
  })

  it('should use BTC when average per label is above 1 BTC', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 1.5, // Above 1 BTC
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
        '2025-10-02': {
          value: 1.2, // Above 1 BTC
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
      {
        label: 'SITE-D',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.8,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
        '2025-10-02': {
          value: 0.9,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect(result.currencyUnit).toBe(CURRENCY.BTC)
    expect(result.dataset).toEqual(dataset) // Values should not be converted
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(1.5)
    expect((resultDataset[1]['2025-10-01'] as { value: number }).value).toBe(0.8)
  })

  it('should use SATS and multiply values by 1,000,000 when average per label is below 1 BTC', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 1.5,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
        '2025-10-02': {
          value: 0.3,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
      {
        label: 'SITE-D',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.4,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
        '2025-10-02': {
          value: 0.2,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    // For '2025-10-01': avg = (1.5 + 0.4) / 2 = 0.95 (below 1 BTC) -> use SATS
    // For '2025-10-02': avg = (0.3 + 0.2) / 2 = 0.25 (below 1 BTC) -> use SATS
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(1500000) // 1.5 * 1,000,000
    expect((resultDataset[0]['2025-10-02'] as { value: number }).value).toBe(300000) // 0.3 * 1,000,000
    expect((resultDataset[1]['2025-10-01'] as { value: number }).value).toBe(400000) // 0.4 * 1,000,000
    expect((resultDataset[1]['2025-10-02'] as { value: number }).value).toBe(200000) // 0.2 * 1,000,000
    // Style should be preserved
    expect((resultDataset[0]['2025-10-01'] as { style: unknown }).style).toEqual({
      backgroundColor: ['#1890FF4d'],
      borderColor: '#1890FF',
    })
  })

  it('should use SATS when average per label equals exactly 1 BTC', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 1.0,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
      {
        label: 'SITE-D',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 1.0,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    // Average is (1.0 + 1.0) / 2 = 1.0, which is not > 1, so should use SATS
    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(1000000) // 1.0 * 1,000,000
    expect((resultDataset[1]['2025-10-01'] as { value: number }).value).toBe(1000000) // 1.0 * 1,000,000
  })

  it('should use SATS when average per label is exactly 1 BTC but one value is missing', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 1.0,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
      {
        label: 'SITE-D',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: undefined, // Missing value
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    // Average is 1.0 / 1 = 1.0, which is not > 1, so should use SATS
    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(1000000) // 1.0 * 1,000,000
  })

  it('should handle datasets with different date keys across labels', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.5,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
        '2025-10-02': {
          value: 0.3,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
      {
        label: 'SITE-D',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.4,
          style: { backgroundColor: ['#FF4D4F4d'], borderColor: '#FF4D4F' },
        },
        // Missing '2025-10-02'
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    // All values should be converted
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(500000)
    expect((resultDataset[0]['2025-10-02'] as { value: number }).value).toBe(300000)
    expect((resultDataset[1]['2025-10-01'] as { value: number }).value).toBe(400000)
  })

  it('should preserve label and stackGroup properties', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.5,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect((resultDataset[0] as { label: string }).label).toBe('SITE-C')
    expect((resultDataset[0] as { stackGroup: string }).stackGroup).toBe('revenue')
  })

  it('should handle edge case with very small values', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.000001, // Very small value
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(1) // 0.000001 * 1,000,000 = 1
  })

  it('should handle edge case with zero values', () => {
    const dataset = [
      {
        label: 'SITE-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0,
          style: { backgroundColor: ['#1890FF4d'], borderColor: '#1890FF' },
        },
      },
    ]

    const result = processRevenueDatasetWith1MThreshold(dataset)
    const resultDataset = result.dataset as Array<Record<string, unknown>>

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((resultDataset[0]['2025-10-01'] as { value: number }).value).toBe(0) // 0 * 1,000,000 = 0
  })
})
