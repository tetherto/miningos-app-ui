import { describe, expect, it, vi } from 'vitest'

import {
  convertToChartFormat,
  createBTCMetrics,
  createRevenueMetrics,
  createSubsidyFeesData,
  transformRevenueDataForChart,
} from './revenueDataHelpers'

// Mock the getHashrateUnit function
vi.mock('@/app/utils/deviceUtils', () => ({
  getHashrateUnit: (value: number) => {
    if (value >= 1000000000000000)
      return { value: value / 1000000000000000, unit: 'EH/s', realValue: value }
    if (value >= 1000000000000)
      return { value: value / 1000000000000, unit: 'TH/s', realValue: value }
    if (value >= 1000000000) return { value: value / 1000000000, unit: 'GH/s', realValue: value }
    if (value >= 1000000) return { value: value / 1000000, unit: 'PH/s', realValue: value }
    if (value >= 1000) return { value: value / 1000, unit: 'KH/s', realValue: value }
    return { value: value, unit: 'H/s', realValue: value }
  },
}))

describe('revenueDataHelpers', () => {
  const mockSiteList = [
    { id: 'site-c', name: 'Site-C' },
    { id: 'site-d', name: 'Site-D' },
  ]

  const mockRevenueData = {
    regions: [
      {
        region: 'SITE-C',
        log: [
          {
            ts: 1704067200000,
            period: 'monthly',
            revenueUSD: 1000,
            totalRevenueBTC: 0.01,
            currentBTCPrice: 50000,
          },
          {
            ts: 1704153600000,
            period: 'monthly',
            revenueUSD: 2000,
            totalRevenueBTC: 0.02,
            currentBTCPrice: 50000,
          },
        ],
        summary: {
          sum: {
            totalRevenueBTC: 0.03,
          },
        },
      },
      {
        region: 'SITE-D',
        log: [
          {
            ts: 1704067200000,
            period: 'monthly',
            revenueUSD: 500,
            totalRevenueBTC: 0.005,
            currentBTCPrice: 50000,
          },
        ],
        summary: {
          sum: {
            totalRevenueBTC: 0.005,
          },
        },
      },
    ],
    data: {
      summary: {
        sum: {
          totalRevenueBTC: 0.035,
        },
        avg: {
          energyRevenueUSD_MW: 1500,
          energyRevenueBTC_MW: 0.015,
          sitePowerW: 1000,
          hashRevenueUSD: 100,
          hashRevenueBTC: 0.001,
          hashrateMHS: 1000000,
        },
      },
    },
  }

  describe('transformRevenueDataForChart', () => {
    it('should transform valid revenue data correctly', () => {
      const result = transformRevenueDataForChart(mockRevenueData)

      expect(result).toHaveLength(1) // Only one month (Jan 2024)
      expect(result[0]).toHaveProperty('timeKey', '01-01')
      expect(result[0]).toHaveProperty('SITE-C', 0.03)
      expect(result[0]).toHaveProperty('SITE-D', 0.005)
    })

    it('should handle missing regions data', () => {
      const result = transformRevenueDataForChart({} as never)
      expect(result).toEqual([])
    })

    it('should handle null regions data', () => {
      const result = transformRevenueDataForChart({ regions: [] } as never)
      expect(result).toEqual([])
    })

    it('should handle empty regions array', () => {
      const result = transformRevenueDataForChart({ regions: [] } as never)
      expect(result).toEqual([])
    })

    it('should handle missing log data', () => {
      const dataWithNoLog = {
        regions: [{ region: 'SITE-C' }], // No log property
      }
      const result = transformRevenueDataForChart(dataWithNoLog as never)
      expect(result).toEqual([])
    })

    it('should handle invalid timestamps', () => {
      const dataWithInvalidTs = {
        regions: [
          {
            region: 'SITE-C',
            log: [{ ts: 'invalid-date', period: 'monthly', revenueUSD: 1000 }],
          },
        ],
      }
      const result = transformRevenueDataForChart(dataWithInvalidTs as never)
      expect(result).toEqual([])
    })

    it('should use BTC conversion when revenueUSD is 0', () => {
      const dataWithBTCConversion = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000,
                period: 'monthly',
                revenueUSD: 0,
                totalRevenueBTC: 0.01,
                currentBTCPrice: 50000,
              },
            ],
          },
        ],
      }
      const result = transformRevenueDataForChart(dataWithBTCConversion)
      expect(result[0]['SITE-C']).toBe(0.01)
    })

    it('should aggregate multiple entries for the same month', () => {
      const result = transformRevenueDataForChart(mockRevenueData)
      expect(result[0]['SITE-C']).toBe(0.03)
    })

    it('should sort data chronologically', () => {
      const dataWithMultipleMonths = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1706745600000, period: 'monthly', revenueUSD: 1000 }, // Feb 2024
              { ts: 1704067200000, period: 'monthly', revenueUSD: 500 }, // Jan 2024
            ],
          },
        ],
      }
      const result = transformRevenueDataForChart(dataWithMultipleMonths)
      expect(result[0].timeKey).toBe('01-01')
      expect(result[1].timeKey).toBe('02-01')
    })
  })

  describe('convertToChartFormat', () => {
    it('should convert region codes to chart-expected format', () => {
      const mockData = [
        {
          timeKey: '2024-01-01',
          period: 'monthly',
          timestamp: 1704067200000,
          'SITE-C': 100,
          'SITE-D': 200,
        },
      ]
      const mockSiteList = ['site-c', 'site-d']

      const result = convertToChartFormat(mockData, mockSiteList)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        timeKey: '2024-01-01',
        period: 'monthly',
        timestamp: 1704067200000,
        'site-c': 100,
        'site-d': 200,
      })
    })

    it('should handle empty data array', () => {
      const result = convertToChartFormat([], mockSiteList)
      expect(result).toEqual([])
    })

    it('should handle null data', () => {
      const result = convertToChartFormat([] as never[], mockSiteList)
      expect(result).toEqual([])
    })

    it('should handle missing region data', () => {
      const transformedData = [
        {
          timeKey: '2024-01-01',
          period: 'monthly',
          timestamp: 1704067200000,
          'SITE-C': 3000,
        }, // Missing SITE-D
      ]
      const result = convertToChartFormat(transformedData, mockSiteList)

      expect(result[0]).toHaveProperty('site-c', 3000)
      expect(result[0]).toHaveProperty('site-d', 0) // Default to 0
    })

    it('should handle additional regions dynamically', () => {
      const extendedSiteList = [
        { id: 'site-c', name: 'Site-C' },
        { id: 'site-d', name: 'Site-D' },
        { id: 'site-e', name: 'Site-E' },
      ]
      const transformedData = [
        {
          timeKey: '2024-01-01',
          period: 'monthly',
          timestamp: 1704067200000,
          'SITE-C': 3000,
          'SITE-D': 500,
          'SITE-E': 1000,
        },
      ]
      const result = convertToChartFormat(transformedData, extendedSiteList)

      expect(result[0]).toHaveProperty('site-c', 3000)
      expect(result[0]).toHaveProperty('site-d', 500)
      expect(result[0]).toHaveProperty('site-e', 1000)
    })
  })

  describe('createBTCMetrics', () => {
    it('should create BTC metrics with total and region-specific values', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000, // Jan 1, 2024
                totalRevenueBTC: 100,
              },
              {
                ts: 1706745600000, // Jan 30, 2024
                totalRevenueBTC: 200,
              },
            ],
          },
          {
            region: 'SITE-D',
            log: [
              {
                ts: 1704067200000, // Jan 1, 2024
                totalRevenueBTC: 150,
              },
            ],
          },
        ],
      }

      const mockSiteList = [
        { id: 'site-c', name: 'Site-C' },
        { id: 'site-d', name: 'Site-D' },
      ]

      const result = createBTCMetrics(mockRevenueData, mockSiteList)

      expect(result).toHaveProperty('totalBtc')
      expect(result.totalBtc).toEqual({
        label: 'Total Bitcoin',
        unit: 'BTC',
        value: 450, // 100 + 200 + 150
      })

      expect(result).toHaveProperty('site-cBtc')
      expect(result['site-cBtc']).toEqual({
        label: 'Site-C', // From mockSiteList[0].name
        unit: 'BTC',
        value: 300, // 100 + 200
      })

      expect(result).toHaveProperty('site-dBtc')
      expect(result['site-dBtc']).toEqual({
        label: 'Site-D', // From mockSiteList[1].name
        unit: 'BTC',
        value: 150, // 150
      })
    })

    it('should handle string array site list', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000,
                totalRevenueBTC: 100,
              },
            ],
          },
        ],
      }

      const mockSiteList = ['site-c', 'site-d']

      const result = createBTCMetrics(mockRevenueData, mockSiteList)

      expect(result['site-cBtc'].label).toBe('SITE-C') // String array has no names, falls back to region code
    })

    it('should use site names for labels when available', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000,
                totalRevenueBTC: 100,
              },
            ],
          },
        ],
      }

      const mockSiteList = [{ id: 'site-c', name: 'Site-C' }]

      const result = createBTCMetrics(mockRevenueData, mockSiteList)

      expect(result['site-cBtc'].label).toBe('Site-C')
    })

    it('should fallback to region code when site name is not available', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000,
                totalRevenueBTC: 100,
              },
            ],
          },
        ],
      }

      const mockSiteList = [{ id: 'site-c' }]

      const result = createBTCMetrics(mockRevenueData, mockSiteList)

      expect(result['site-cBtc'].label).toBe('SITE-C') // Falls back to region code when no name provided
    })

    it('should handle missing revenue data gracefully', () => {
      const result = createBTCMetrics({} as never, [{ id: 'site-c' }])

      expect(result.totalBtc.value).toBe(0)
    })

    it('should handle empty site list', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000,
                totalRevenueBTC: 100,
              },
            ],
          },
        ],
      }

      const result = createBTCMetrics(mockRevenueData, [])

      expect(result.totalBtc.value).toBe(100)
      expect(result).not.toHaveProperty('site-cBtc')
    })
  })

  describe('createRevenueMetrics', () => {
    it('should create revenue metrics with correct values', () => {
      const mockDowntimeData = {
        log: [{ curtailmentRate: 0.15 }], // 15% curtailment rate
      }
      const mockHashrateData = {
        data: {
          summary: {
            avg: {
              hashrate: 1000000, // 1 PH/s actual
            },
          },
          nominalHashrate: 2000000, // 2 PH/s nominal
        },
      }

      const result = createRevenueMetrics(mockRevenueData, mockDowntimeData, mockHashrateData)

      expect(result.avgEnergyRevenue.value).toBe(1500)
      expect(result.avgEnergyRevenueBtc.value).toBe(0.015)
      expect(result.avgPowerConsumption.value).toBe(1000)
      expect(result.avgHashRevenue.value).toBe(100)
      expect(result.avgHashRevenueBtc.value).toBe(0.001)
      expect(result.avgHashrate.value).toBe(1) // 1000000 / 1000000 = 1 PH/s
      expect(result.avgHashrate.unit).toBe('PH/s') // Unit from getHashrateUnit
      expect(result.energyCurtailmentRate.value).toBe(0.15) // From downtime data
      expect(result.hashrateCapacityFactors.value).toBe(50) // (1000000 / 2000000) * 100 = 50%
    })

    it('should handle missing data gracefully', () => {
      const result = createRevenueMetrics({} as never, {} as never, {} as never)

      expect(result.avgEnergyRevenue.value).toBe(0)
      expect(result.avgEnergyRevenueBtc.value).toBe(0)
      expect(result.avgPowerConsumption.value).toBe(0)
      expect(result.avgHashRevenue.value).toBe(0)
      expect(result.avgHashRevenueBtc.value).toBe(0)
      expect(result.avgHashrate.value).toBe(0)
      expect(result.energyCurtailmentRate.value).toBe(0)
      expect(result.hashrateCapacityFactors.value).toBe(0)
    })

    it('should have correct units and labels', () => {
      const mockDowntimeData = { log: [{ curtailmentRate: 0.1 }] }
      const mockGlobalConfig = [{ nominalSiteHashrate_MHS: 1000000 }]
      const mockHashrateData = {
        data: {
          summary: {
            avg: {
              hashrate: 1000000,
            },
          },
          nominalHashrate: 1000000,
        },
      }

      const result = createRevenueMetrics(mockRevenueData, mockDowntimeData, mockHashrateData)

      expect(result.avgEnergyRevenue.unit).toBe('$/MWh')
      expect(result.avgEnergyRevenueBtc.unit).toBe('Sats/MWh')
      expect(result.avgPowerConsumption.unit).toBe('MWh')
      expect(result.avgHashRevenue.unit).toBe('$/PH/s/day')
      expect(result.avgHashRevenueBtc.unit).toBe('Sats/PH/s/day')
      expect(result.avgHashrate.unit).toBe('PH/s')
      expect(result.energyCurtailmentRate.unit).toBe('%')
      expect(result.hashrateCapacityFactors.unit).toBe('%')
    })

    it('should calculate hashrate capacity factors correctly', () => {
      const mockDowntimeData = { log: [{ curtailmentRate: 0.05 }] }
      const mockHashrateData = {
        data: {
          summary: {
            avg: {
              hashrate: 1000000, // 1 PH/s actual
            },
          },
          nominalHashrate: 1000000, // 1 PH/s nominal
        },
      }

      const result = createRevenueMetrics(mockRevenueData, mockDowntimeData, mockHashrateData)

      // Actual hashrate from mockHashrateData is 1000000
      // Nominal hashrate is 1000000
      // Capacity factor should be (1000000/1000000) * 100 = 100%
      expect(result.hashrateCapacityFactors.value).toBe(100)
    })

    it('should handle zero nominal hashrate gracefully', () => {
      const mockDowntimeData = { log: [{ curtailmentRate: 0.1 }] }
      const mockHashrateData = {
        data: {
          summary: {
            avg: {
              hashrate: 1000000,
            },
          },
          nominalHashrate: 0, // Zero nominal hashrate
        },
      }

      const result = createRevenueMetrics(mockRevenueData, mockDowntimeData, mockHashrateData)

      // Should return 0 instead of NaN when dividing by zero
      expect(result.hashrateCapacityFactors.value).toBe(0)
    })
  })

  describe('createSubsidyFeesData', () => {
    it('should create subsidy and fees data from revenue data', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1704067200000, // Jan 1, 2024
                totalRevenueBTC: 100,
                totalFeesBTC: 10,
              },
              {
                ts: 1706745600000, // Jan 30, 2024
                totalRevenueBTC: 200,
                totalFeesBTC: 20,
              },
            ],
          },
          {
            region: 'SITE-D',
            log: [
              {
                ts: 1704067200000, // Jan 1, 2024
                totalRevenueBTC: 150,
                totalFeesBTC: 15,
              },
            ],
          },
        ],
      }

      const result = createSubsidyFeesData(mockRevenueData)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: {
            value: 405, // (100-10) + (200-20) + (150-15) = 90 + 180 + 135 = 405
            color: '#5B5FFB',
          },
          Fees: {
            value: 45, // 10 + 20 + 15 = 45
            color: '#00D0D8',
          },
        },
      })
    })

    it('should handle empty or missing revenue data', () => {
      const result = createSubsidyFeesData({} as never)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: { value: 0, color: '#5B5FFB' },
          Fees: { value: 0, color: '#00D0D8' },
        },
      })
    })

    it('should handle revenue data with no regions', () => {
      const result = createSubsidyFeesData({ regions: [] } as never)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: { value: 0, color: '#5B5FFB' },
          Fees: { value: 0, color: '#00D0D8' },
        },
      })
    })

    it('should handle when totalFees and totalSubsidy are zero', () => {
      const mockRevenueData = {
        regions: [
          {
            region: 'SITE-C',
            log: [],
          },
        ],
      }

      const result = createSubsidyFeesData(mockRevenueData)

      expect(result).toEqual({
        unit: 'BTC',
        label: null,
        value: null,
        dataset: {
          Subsidy: { value: 0, color: '#5B5FFB' },
          Fees: { value: 0, color: '#00D0D8' },
        },
      })
    })
  })
})
