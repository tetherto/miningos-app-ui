import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildEfficiencyChart } from './Efficiency.util'

import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

vi.mock('@/constants/colors', () => ({
  COLOR: {
    WHITE_ALPHA_01: '#FFFFFF1A',
    WHITE_ALPHA_07: '#ffffffb3',
    COLD_ORANGE: '#F7931A',
    WHITE: '#FFFFFF',
    MINT_GREEN: '#6EE7B7',
  },
  CHART_COLORS: {
    blue: '#1890FF',
    red: '#F5222D',
    green: '#72F59E',
    yellow: '#FFC107',
    orange: '#FF6A00',
  },
}))

describe('Efficiency.util', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildEfficiencyChart', () => {
    it('should return empty structure when api.regions is not an array', () => {
      const mockApi = {
        regions: null,
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result).toEqual({
        series: [],
        constants: [],
      })
    })

    it('should return empty structure when api.regions is missing', () => {
      const mockApi = {} as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result).toEqual({
        series: [],
        constants: [],
      })
    })

    it('should return empty structure when region not found', () => {
      const mockApi = {
        regions: [{ region: 'SITE-D', nominalEfficiency: 28.0 }],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result).toEqual({
        series: [],
        constants: [],
      })
    })

    it('should process single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.5,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series).toHaveLength(1)
      expect(result.series[0].points).toHaveLength(1)
      expect(result.series[0].points[0]).toEqual({
        ts: '2022-01-01T00:00:00.000Z',
        value: 32.5,
      })
      expect(result.series[0].label).toBe('Actual Sites Efficiency')
      expect(result.series[0].color).toBe('#1890FF')

      expect(result.constants).toHaveLength(1)
      expect(result.constants[0]).toEqual({
        label: 'Nominal Miners Efficiency',
        value: 30.0,
        color: '#F5222D',
      })
    })

    it('should handle multiple log entries correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
              {
                ts: 1641081600000,
                efficiencyWThs: 28.5,
              },
              {
                ts: 1641168000000,
                efficiencyWThs: 31.2,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points).toHaveLength(3)
      expect(result.series[0].points[0].value).toBe(32.0)
      expect(result.series[0].points[1].value).toBe(28.5)
      expect(result.series[0].points[2].value).toBe(31.2)

      expect(result.series[0].points[0].ts).toBe('2022-01-01T00:00:00.000Z')
      expect(result.series[0].points[1].ts).toBe('2022-01-02T00:00:00.000Z')
      expect(result.series[0].points[2].ts).toBe('2022-01-03T00:00:00.000Z')
    })

    it('should limit results based on buckets parameter', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: Array.from({ length: 10 }, (_, i) => ({
              ts: 1640995200000 + i * 86400000,
              efficiencyWThs: 30.0 + i,
            })),
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 5 })

      expect(result.series[0].points).toHaveLength(5)
      // Should take the last 5 entries
      expect(result.series[0].points[0].value).toBe(35.0) // 30.0 + 5
      expect(result.series[0].points[4].value).toBe(39.0) // 30.0 + 9
    })

    it('should handle missing or invalid efficiency values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: null,
              },
              {
                ts: 1641081600000,
                efficiencyWThs: undefined,
              },
              {
                ts: 1641168000000,
                efficiencyWThs: 'invalid',
              },
              {
                ts: 1641254400000,
                // efficiencyWThs missing
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points).toHaveLength(4)
      // All should default to 0
      expect(result.series[0].points[0].value).toBe(0)
      expect(result.series[0].points[1].value).toBe(0)
      expect(result.series[0].points[2].value).toBe(0)
      expect(result.series[0].points[3].value).toBe(0)
    })

    it('should handle missing or invalid nominal efficiency', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: null,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.constants[0].value).toBe(0)
    })

    it('should handle empty log array', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points).toHaveLength(0)
      expect(result.constants[0].value).toBe(30.0)
    })

    it('should handle missing log array', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points).toHaveLength(0)
      expect(result.constants[0].value).toBe(30.0)
    })

    it('should sort log entries by timestamp', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1641168000000, // Later timestamp
                efficiencyWThs: 31.2,
              },
              {
                ts: 1640995200000, // Earlier timestamp
                efficiencyWThs: 32.0,
              },
              {
                ts: 1641081600000, // Middle timestamp
                efficiencyWThs: 28.5,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points).toHaveLength(3)
      // Should be sorted by timestamp
      expect(result.series[0].points[0].value).toBe(32.0) // Earliest
      expect(result.series[0].points[1].value).toBe(28.5) // Middle
      expect(result.series[0].points[2].value).toBe(31.2) // Latest
    })

    it('should use default parameters when not provided', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      // Call without parameters
      const result = buildEfficiencyChart(mockApi)

      expect(result.series).toHaveLength(0) // No siteCode, no region found
      expect(result.constants).toHaveLength(0)
    })

    it('should handle numeric timestamp strings correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: '1640995200000', // String timestamp
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points[0].ts).toBe('2022-01-01T00:00:00.000Z')
      expect(result.series[0].points[0].value).toBe(32.0)
    })

    it('should handle missing timestamp values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                // ts missing
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      expect(result.series[0].points[0].ts).toBe('1970-01-01T00:00:00.000Z')
      expect(result.series[0].points[0].value).toBe(32.0)
    })

    it('should have correct chart structure and styling properties', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 30 })

      // Check series structure
      expect(result.series).toEqual([
        expect.objectContaining({
          label: 'Actual Sites Efficiency',
          color: '#1890FF',
          points: expect.any(Array),
        }),
      ])

      // Check constants structure
      expect(result.constants).toEqual([
        expect.objectContaining({
          label: 'Nominal Miners Efficiency',
          value: 30.0,
          color: '#F5222D',
        }),
      ])
    })

    it('should handle zero buckets parameter', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 0 })

      // slice(-0) returns all elements, not zero elements
      expect(result.series[0].points).toHaveLength(1)
      expect(result.constants[0].value).toBe(30.0)
    })

    it('should handle buckets larger than available data', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalEfficiency: 30.0,
            log: [
              {
                ts: 1640995200000,
                efficiencyWThs: 32.0,
              },
              {
                ts: 1641081600000,
                efficiencyWThs: 28.5,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEfficiencyChart(mockApi, { siteCode: 'SITE-C', buckets: 10 })

      // Should return all available data (2 entries)
      expect(result.series[0].points).toHaveLength(2)
      expect(result.series[0].points[0].value).toBe(32.0)
      expect(result.series[0].points[1].value).toBe(28.5)
    })
  })
})
