import { describe, it, expect } from 'vitest'

import {
  processRevenueDatasetWith1MThreshold,
  readRegionValue,
  updateMetricFromData,
} from './Dashboard.helpers'

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

describe('readRegionValue', () => {
  it('returns 0 when regionItem is null', () => {
    expect(readRegionValue(null)).toBe(0)
  })

  it('returns 0 for default/unknown kind', () => {
    const item = { region: 'US', log: [], summary: {} }
    expect(readRegionValue(item, { kind: 'unknown' as never })).toBe(0)
  })

  it('returns mean of log field for logMean kind', () => {
    const item = {
      region: 'US',
      log: [{ hashrate: 10 }, { hashrate: 20 }],
      summary: {},
    }
    expect(readRegionValue(item as never, { kind: 'logMean', field: 'hashrate' })).toBe(15)
  })

  it('returns summaryPath value for summaryPath kind', () => {
    const item = {
      region: 'US',
      log: [],
      summary: { metrics: { hashrate: 42 } },
    }
    expect(
      readRegionValue(item as never, { kind: 'summaryPath', path: ['metrics', 'hashrate'] }),
    ).toBe(42)
  })

  it('returns 0 when logMean log is empty', () => {
    const item = { region: 'US', log: [], summary: {} }
    expect(readRegionValue(item, { kind: 'logMean', field: 'hashrate' })).toBe(0)
  })
})

describe('updateMetricFromData', () => {
  it('returns prevMetrics unchanged when data is null', () => {
    const prevMetrics = { US: { hashrate: { value: 5 } } }
    const result = updateMetricFromData(prevMetrics as never, null, { metricKey: 'hashrate' })
    expect(result).toBe(prevMetrics)
  })

  it('updates metric values for each region in data', () => {
    // ALL_SITES constant = 'all', _toUpper('all') = 'ALL'
    const prevMetrics = {
      US: { hashrate: { value: 0 } },
      ALL: { hashrate: { value: 0 } },
    }
    const data = {
      regions: [{ region: 'us', log: [{ hashrate: 50 }], summary: {} }],
      hashrate: 99,
    }
    const result = updateMetricFromData(prevMetrics as never, data as never, {
      metricKey: 'hashrate',
      regionSource: { kind: 'logMean', field: 'hashrate' },
      allSitesPath: ['hashrate'],
    })
    expect(result.US.hashrate.value).toBe(50)
    expect(result.ALL.hashrate.value).toBe(99)
  })
})
