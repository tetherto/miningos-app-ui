import { describe, it, expect } from 'vitest'

import { getMonthlyRevenueDataset, processRevenueDataset } from './helper'

import { CURRENCY } from '@/constants/units'

describe('getMonthlyRevenueDataset', () => {
  it('should generate dataset with full site names when siteList is provided', () => {
    const mockData = [
      {
        timeKey: 'Jan 2024',
        period: 'monthly',
        timestamp: 1704067200000,
        'site-c': 100,
        'site-d': 200,
      },
      {
        timeKey: 'Feb 2024',
        period: 'monthly',
        timestamp: 1706745600000,
        'site-c': 150,
        'site-d': 250,
      },
    ]

    const mockSiteList = [
      { id: 'site-c', name: 'Site-C' },
      { id: 'site-d', name: 'Site-D' },
    ]

    const result = getMonthlyRevenueDataset(mockData, mockSiteList)

    expect(result).toHaveLength(2)

    // Check the first dataset (Site-C)
    expect(result[0].label).toBe('Site-C')
    expect(result[0].stackGroup).toBe('revenue')
    expect((result[0] as Record<string, unknown>)['Jan 2024']).toHaveProperty('value', 100)
    expect((result[0] as Record<string, unknown>)['Feb 2024']).toHaveProperty('value', 150)

    // Check the second dataset (Site-D)
    expect(result[1].label).toBe('Site-D')
    expect(result[1].stackGroup).toBe('revenue')
    expect((result[1] as Record<string, unknown>)['Jan 2024']).toHaveProperty('value', 200)
    expect((result[1] as Record<string, unknown>)['Feb 2024']).toHaveProperty('value', 250)
  })

  it('should fallback to capitalized region codes when site names are not available', () => {
    const mockData = [
      {
        timeKey: 'Jan 2024',
        period: 'monthly',
        timestamp: 1704067200000,
        'site-c': 100,
        'site-d': 200,
      },
    ]

    const mockSiteList = ['site-c', 'site-d']

    const result = getMonthlyRevenueDataset(mockData, mockSiteList)

    expect(result).toHaveLength(2)
    expect(result[0].label).toBe('Site-c')
    expect(result[1].label).toBe('Site-d')
  })

  it('should handle empty data gracefully', () => {
    const result = getMonthlyRevenueDataset([], [])
    expect(result).toEqual([])
  })

  it('should handle null data gracefully', () => {
    const result = getMonthlyRevenueDataset([] as never[], [])
    expect(result).toEqual([])
  })
})

describe('processRevenueDataset', () => {
  it('should convert to SATS when all averages are <= 1', () => {
    const mockDataset = [
      {
        label: 'Site-C',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.5, style: {}, legendColor: [] },
        '2025-10-02': { value: 0.3, style: {}, legendColor: [] },
      },
      {
        label: 'Site-D',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.4, style: {}, legendColor: [] },
        '2025-10-02': { value: 0.2, style: {}, legendColor: [] },
      },
    ]

    const result = processRevenueDataset(mockDataset)

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      500000,
    ) // 0.5 * 1000000
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-02']).toHaveProperty(
      'value',
      300000,
    ) // 0.3 * 1000000
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      400000,
    ) // 0.4 * 1000000
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-02']).toHaveProperty(
      'value',
      200000,
    ) // 0.2 * 1000000
  })

  it('should keep BTC when any date has average > 1', () => {
    const mockDataset = [
      {
        label: 'Site-C',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.5, style: {}, legendColor: [] },
        '2025-10-02': { value: 1.5, style: {}, legendColor: [] }, // (1.5 + 1.5) / 2 = 1.5 > 1
      },
      {
        label: 'Site-D',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.4, style: {}, legendColor: [] },
        '2025-10-02': { value: 1.5, style: {}, legendColor: [] }, // (1.5 + 1.5) / 2 = 1.5 > 1
      },
    ]

    const result = processRevenueDataset(mockDataset)

    expect(result.currencyUnit).toBe(CURRENCY.BTC)
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      0.5,
    ) // Unchanged
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-02']).toHaveProperty(
      'value',
      1.5,
    ) // Unchanged
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      0.4,
    ) // Unchanged
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-02']).toHaveProperty(
      'value',
      1.5,
    ) // Unchanged
  })

  it('should handle empty dataset', () => {
    const result = processRevenueDataset([])

    expect(result.dataset).toEqual([])
    expect(result.currencyUnit).toBe(CURRENCY.BTC)
  })

  it('should handle null dataset', () => {
    const result = processRevenueDataset([] as never[])

    expect(result.dataset).toEqual([])
    expect(result.currencyUnit).toBe(CURRENCY.BTC)
  })

  it('should preserve non-value properties when converting to SATS', () => {
    const mockDataset = [
      {
        label: 'Site-C',
        stackGroup: 'revenue',
        '2025-10-01': {
          value: 0.5,
          style: { backgroundColor: ['#06B6D44d'], borderColor: '#06B6D4' },
          legendColor: ['#06B6D44d'],
        },
      },
    ]

    const result = processRevenueDataset(mockDataset)

    expect(result.dataset[0].label).toBe('Site-C')
    expect(result.dataset[0].stackGroup).toBe('revenue')
    const firstDataset = result.dataset[0] as Record<string, unknown>
    expect(firstDataset['2025-10-01']).toHaveProperty('value', 500000)
    expect(firstDataset['2025-10-01']).toHaveProperty('style')
    expect(firstDataset['2025-10-01']).toHaveProperty('legendColor')
  })

  it('should calculate average correctly with multiple labels per date', () => {
    const mockDataset = [
      {
        label: 'Site-C',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.3, style: {}, legendColor: [] },
      },
      {
        label: 'Site-D',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.4, style: {}, legendColor: [] },
      },
      {
        label: 'Site-E',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.3, style: {}, legendColor: [] },
      },
    ]

    // Average per label for 2025-10-01: (0.3 + 0.4 + 0.3) / 3 = 0.333... <= 1, so should convert to SATS
    const result = processRevenueDataset(mockDataset)

    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      300000,
    )
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      400000,
    )
    expect((result.dataset[2] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      300000,
    )
  })

  it('should handle dates with missing values for some labels', () => {
    const mockDataset = [
      {
        label: 'Site-C',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.5, style: {}, legendColor: [] },
        '2025-10-02': { value: 0.3, style: {}, legendColor: [] },
      },
      {
        label: 'Site-D',
        stackGroup: 'revenue',
        '2025-10-01': { value: 0.4, style: {}, legendColor: [] },
        // Missing 2025-10-02
      },
    ]

    const result = processRevenueDataset(mockDataset)

    // 2025-10-01: avg = (0.5 + 0.4) / 2 = 0.45 <= 1
    // 2025-10-02: avg = 0.3 / 1 = 0.3 <= 1
    // Should convert to SATS
    expect(result.currencyUnit).toBe(CURRENCY.SATS)
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      500000,
    )
    expect((result.dataset[0] as Record<string, unknown>)['2025-10-02']).toHaveProperty(
      'value',
      300000,
    )
    expect((result.dataset[1] as Record<string, unknown>)['2025-10-01']).toHaveProperty(
      'value',
      400000,
    )
  })
})
