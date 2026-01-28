import { describe, expect, test } from 'vitest'

import { PERIOD } from '@/constants/ranges'
import {
  getMonthlyRevenueDataset,
  processRevenueDataset,
} from '@/MultiSiteViews/Charts/RevenueChart/helper'
import {
  convertToChartFormat,
  transformRevenueDataForChart,
} from '@/MultiSiteViews/RevenueAndCost/revenueDataHelpers'
import type { RevenueData, RevenueLogEntry } from '@/types'

describe('Revenue Chart Dataset Transformation', () => {
  describe('transformRevenueDataForChart', () => {
    test('should transform revenueData to chart format with single day', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000, // Jan 20, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        timeKey: expect.any(String),
        period: PERIOD.DAILY,
        timestamp: 1755734400000,
        SITE: 0.5,
      })
    })

    test('should aggregate multiple entries on the same day', () => {
      const dayStart = 1755734400000 // Jan 20, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: dayStart,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.3,
              },
              {
                ts: dayStart + 3600000, // Same day, 1 hour later
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.2,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(1)
      expect(result[0].SITE).toBe(0.5) // 0.3 + 0.2
    })

    test('should handle multiple days correctly', () => {
      const day1Start = 1755734400000 // Jan 20, 2025
      const day2Start = 1755820800000 // Jan 21, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: day1Start,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
              },
              {
                ts: day2Start,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.7,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(2)
      expect(result[0].SITE).toBe(0.5)
      expect(result[1].SITE).toBe(0.7)
      // Should be sorted by timestamp
      expect((result[0] as RevenueLogEntry).timestamp).toBeLessThan(
        (result[1] as RevenueLogEntry).timestamp as number,
      )
    })

    test('should handle monthly period format correctly (for yearly aggregation)', () => {
      // When YEARLY is selected, aggregation is by MONTHLY, so entries have period = MONTHLY
      const janStart = new Date(2025, 0, 1).getTime() // Jan 1, 2025
      const febStart = new Date(2025, 1, 1).getTime() // Feb 1, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: janStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.5,
              },
              {
                ts: febStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 2.0,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(2)
      expect(result[0].period).toBe(PERIOD.MONTHLY)
      expect(result[0].SITE).toBe(1.5)
      expect(result[1].SITE).toBe(2.0)
      // Monthly period entries should use MM-dd format (e.g., "01-01", "02-01")
      expect(result[0].timeKey).toMatch(/^\d{2}-\d{2}$/)
      expect(result[1].timeKey).toMatch(/^\d{2}-\d{2}$/)
    })

    test('should handle daily period format correctly (for monthly/weekly aggregation)', () => {
      // When MONTHLY or WEEKLY is selected, aggregation is by DAILY, so entries have period = DAILY
      const day1Start = 1755734400000 // Jan 20, 2025
      const day2Start = 1755820800000 // Jan 21, 2025
      const day3Start = 1755907200000 // Jan 22, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: day1Start,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
              },
              {
                ts: day2Start,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.7,
              },
              {
                ts: day3Start,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.8,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(3)
      expect(result[0].period).toBe(PERIOD.DAILY)
      expect(result[0].SITE).toBe(0.5)
      expect(result[1].SITE).toBe(0.7)
      expect(result[2].SITE).toBe(0.8)
      // Daily period entries should use yyyy-MM-dd format
      expect(result[0].timeKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result[1].timeKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result[2].timeKey).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    test('should return empty array for empty revenueData', () => {
      const revenueData: RevenueData = {
        regions: [],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toEqual([])
    })

    test('should return empty array for undefined revenueData', () => {
      const result = transformRevenueDataForChart(undefined as unknown as RevenueData)

      expect(result).toEqual([])
    })

    test('should handle entries with zero revenue', () => {
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0,
              },
            ],
          },
        ],
      }

      const result = transformRevenueDataForChart(revenueData)

      expect(result).toHaveLength(1)
      expect(result[0].SITE).toBe(0)
    })
  })

  describe('convertToChartFormat', () => {
    test('should convert transformed data to chart format with site list', () => {
      const transformedData = [
        {
          timeKey: '2025-01-20',
          period: PERIOD.DAILY,
          timestamp: 1755734400000,
          SITE: 0.5,
        },
      ]

      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const result = convertToChartFormat(transformedData, siteList)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        timeKey: '2025-01-20',
        period: PERIOD.DAILY,
        timestamp: 1755734400000,
        site: 0.5, // Lowercase region code
      })
    })

    test('should handle string site list', () => {
      const transformedData = [
        {
          timeKey: '2025-01-20',
          period: PERIOD.DAILY,
          timestamp: 1755734400000,
          SITE: 0.5,
        },
      ]

      const siteList = ['SITE']
      const result = convertToChartFormat(transformedData, siteList)

      expect(result).toHaveLength(1)
      expect(result[0].site).toBe(0.5)
    })

    test('should return empty array for empty data', () => {
      const result = convertToChartFormat([], [])

      expect(result).toEqual([])
    })
  })

  describe('getMonthlyRevenueDataset', () => {
    test('should create dataset from chart format data', () => {
      const chartData = [
        {
          timeKey: '2025-01-20',
          period: PERIOD.DAILY,
          timestamp: 1755734400000,
          site: 0.5,
        },
        {
          timeKey: '2025-01-21',
          period: PERIOD.DAILY,
          timestamp: 1755820800000,
          site: 0.7,
        },
      ]

      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const result = getMonthlyRevenueDataset(chartData, siteList)

      expect(result).toHaveLength(1) // One dataset item per region
      expect(result[0]).toMatchObject({
        label: 'Test Site',
        stackGroup: 'revenue',
      })
      expect(result[0]['2025-01-20']).toMatchObject({
        value: 0.5,
        style: expect.any(Object),
        legendColor: expect.any(Array), // legendColor is an array from getBarChartItemStyle
      })
      expect(result[0]['2025-01-21']).toMatchObject({
        value: 0.7,
        style: expect.any(Object),
        legendColor: expect.any(Array),
      })
    })

    test('should return empty array for empty data', () => {
      const result = getMonthlyRevenueDataset([], [])

      expect(result).toEqual([])
    })
  })

  describe('processRevenueDataset', () => {
    test('should keep BTC format when average > 1', () => {
      const dataset = [
        {
          label: 'Site',
          stackGroup: 'revenue',
          '2025-01-20': { value: 1.5, style: {}, legendColor: '#000' },
          '2025-01-21': { value: 2.0, style: {}, legendColor: '#000' },
        },
      ]

      const result = processRevenueDataset(dataset)

      expect(result.currencyUnit).toBe('₿') // CURRENCY.BTC is the symbol '₿'
      expect((result.dataset[0] as Record<string, { value: number }>)['2025-01-20'].value).toBe(1.5)
      expect((result.dataset[0] as Record<string, { value: number }>)['2025-01-21'].value).toBe(2.0)
    })

    test('should convert to SATS when average <= 1', () => {
      const dataset = [
        {
          label: 'Site',
          stackGroup: 'revenue',
          '2025-01-20': { value: 0.5, style: {}, legendColor: '#000' },
          '2025-01-21': { value: 0.7, style: {}, legendColor: '#000' },
        },
      ]

      const result = processRevenueDataset(dataset)

      expect(result.currencyUnit).toBe('Sats')
      expect((result.dataset[0] as Record<string, { value: number }>)['2025-01-20'].value).toBe(
        500000,
      ) // 0.5 * 1,000,000
      expect((result.dataset[0] as Record<string, { value: number }>)['2025-01-21'].value).toBe(
        700000,
      ) // 0.7 * 1,000,000
    })

    test('should return empty dataset for empty input', () => {
      const result = processRevenueDataset([])

      expect(result.dataset).toEqual([])
      expect(result.currencyUnit).toBe('₿') // CURRENCY.BTC is the symbol '₿'
    })
  })

  describe('Full transformation pipeline', () => {
    test('should transform revenueData through full pipeline correctly (daily aggregation)', () => {
      // This simulates MONTHLY or WEEKLY period selection (aggregates by DAILY)
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: 1755734400000, // Jan 20, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
              },
              {
                ts: 1755820800000, // Jan 21, 2025
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.7,
              },
            ],
          },
        ],
      }

      // Step 1: Transform revenue data
      const transformedData = transformRevenueDataForChart(revenueData)
      expect(transformedData).toHaveLength(2)
      expect(transformedData[0].period).toBe(PERIOD.DAILY)
      expect(transformedData[0].timeKey).toMatch(/^\d{4}-\d{2}-\d{2}$/) // yyyy-MM-dd format

      // Step 2: Convert to chart format
      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const chartData = convertToChartFormat(transformedData, siteList)
      expect(chartData).toHaveLength(2)
      expect(chartData[0].site).toBe(0.5)
      expect(chartData[1].site).toBe(0.7)

      // Step 3: Create dataset
      const dataset = getMonthlyRevenueDataset(
        chartData as Array<{
          timeKey: string
          period: string
          timestamp: number
          [key: string]: unknown
        }>,
        siteList,
      )
      expect(dataset).toHaveLength(1)
      expect(dataset[0].label).toBe('Test Site')

      // Step 4: Process dataset (may convert to SATS)
      const processed = processRevenueDataset(dataset)
      expect(processed.dataset).toHaveLength(1)
      expect(processed.currencyUnit).toBe('Sats') // Average is 0.6, so should convert to SATS
    })

    test('should transform revenueData for yearly period (monthly aggregation)', () => {
      // This simulates YEARLY period selection (aggregates by MONTHLY)
      const janStart = new Date(2025, 0, 1).getTime() // Jan 1, 2025
      const febStart = new Date(2025, 1, 1).getTime() // Feb 1, 2025
      const marStart = new Date(2025, 2, 1).getTime() // Mar 1, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: janStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.5,
              },
              {
                ts: febStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 2.0,
              },
              {
                ts: marStart,
                period: PERIOD.MONTHLY,
                totalRevenueBTC: 1.8,
              },
            ],
          },
        ],
      }

      // Step 1: Transform revenue data
      const transformedData = transformRevenueDataForChart(revenueData)
      expect(transformedData).toHaveLength(3)
      expect(transformedData[0].period).toBe(PERIOD.MONTHLY)
      expect(transformedData[0].timeKey).toMatch(/^\d{2}-\d{2}$/) // MM-dd format
      expect(transformedData[0].SITE).toBe(1.5)
      expect(transformedData[1].SITE).toBe(2.0)
      expect(transformedData[2].SITE).toBe(1.8)

      // Step 2: Convert to chart format
      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const chartData = convertToChartFormat(transformedData, siteList)
      expect(chartData).toHaveLength(3)

      // Step 3: Create dataset
      const dataset = getMonthlyRevenueDataset(
        chartData as Array<{
          timeKey: string
          period: string
          timestamp: number
          [key: string]: unknown
        }>,
        siteList,
      )
      expect(dataset).toHaveLength(1)

      // Step 4: Process dataset (should keep BTC since average > 1)
      const processed = processRevenueDataset(dataset)
      expect(processed.dataset).toHaveLength(1)
      expect(processed.currencyUnit).toBe('₿') // Average is > 1, so stays in BTC
    })

    test('should transform revenueData for weekly period (daily aggregation)', () => {
      // This simulates WEEKLY period selection (aggregates by DAILY - 7 data points)
      const weekStart = 1755734400000 // Jan 20, 2025 (Monday)
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: weekStart, // Day 1
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.5,
              },
              {
                ts: weekStart + 86400000, // Day 2
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.6,
              },
              {
                ts: weekStart + 2 * 86400000, // Day 3
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.7,
              },
              {
                ts: weekStart + 3 * 86400000, // Day 4
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.8,
              },
              {
                ts: weekStart + 4 * 86400000, // Day 5
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.9,
              },
              {
                ts: weekStart + 5 * 86400000, // Day 6
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.4,
              },
              {
                ts: weekStart + 6 * 86400000, // Day 7
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.3,
              },
            ],
          },
        ],
      }

      // Step 1: Transform revenue data
      const transformedData = transformRevenueDataForChart(revenueData)
      expect(transformedData).toHaveLength(7) // 7 daily data points for weekly
      expect(transformedData[0].period).toBe(PERIOD.DAILY)
      expect(transformedData[0].timeKey).toMatch(/^\d{4}-\d{2}-\d{2}$/) // yyyy-MM-dd format

      // Step 2: Convert to chart format
      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const chartData = convertToChartFormat(transformedData, siteList)
      expect(chartData).toHaveLength(7)

      // Step 3: Create dataset
      const dataset = getMonthlyRevenueDataset(
        chartData as Array<{
          timeKey: string
          period: string
          timestamp: number
          [key: string]: unknown
        }>,
        siteList,
      )
      expect(dataset).toHaveLength(1)

      // Step 4: Process dataset (average is ~0.6, so converts to SATS)
      const processed = processRevenueDataset(dataset)
      expect(processed.dataset).toHaveLength(1)
      expect(processed.currencyUnit).toBe('Sats') // Average is <= 1, so converts to SATS
    })

    test('should handle multiple days with aggregation correctly', () => {
      const dayStart = 1755734400000 // Jan 20, 2025
      const revenueData: RevenueData = {
        regions: [
          {
            region: 'SITE',
            log: [
              {
                ts: dayStart,
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.3,
              },
              {
                ts: dayStart + 3600000, // Same day, 1 hour later
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.2,
              },
              {
                ts: dayStart + 86400000, // Next day
                period: PERIOD.DAILY,
                totalRevenueBTC: 0.8,
              },
            ],
          },
        ],
      }

      const transformedData = transformRevenueDataForChart(revenueData)
      // Should aggregate same-day entries
      expect(transformedData).toHaveLength(2)
      expect(transformedData[0].SITE).toBe(0.5) // 0.3 + 0.2
      expect(transformedData[1].SITE).toBe(0.8)

      const siteList = [{ id: 'SITE', name: 'Test Site' }]
      const chartData = convertToChartFormat(
        transformedData as RevenueLogEntry[],
        siteList,
      ) as Array<{
        timeKey: string
        period: string
        timestamp: number
        [key: string]: unknown
      }>
      const dataset = getMonthlyRevenueDataset(chartData, siteList)
      const processed = processRevenueDataset(dataset)

      const timeKey = transformedData[0]?.timeKey
      expect(timeKey).toBeDefined()
      expect(processed.dataset[0]).toHaveProperty(timeKey!)
      // Average is 0.5 (<= 1), so values are converted to SATS (multiply by 1,000,000)
      expect((processed.dataset[0] as Record<string, { value: number }>)[timeKey!].value).toBe(
        500000,
      ) // 0.5 * 1,000,000
    })
  })
})
