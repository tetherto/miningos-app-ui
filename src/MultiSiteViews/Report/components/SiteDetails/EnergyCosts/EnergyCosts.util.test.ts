import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildEnergyCostsCharts } from './EnergyCosts.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts?: number
  period?: string
  sitePowerW?: number
  downtimeRate?: number
  totalEnergyCostsUSD?: number
  totalOperationalCostsUSD?: number
  energyRevenueUSD_MW?: number
  revenueUSD?: number
}

interface Region {
  region: string
  log?: LogEntry[]
}

interface MockApi {
  regions?: Region[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: MockApi | null | undefined) => ({ isValid: !!api }),
  safeNum: (val?: number) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  buildBarChart: (
    labels: string[],
    seriesData: { label: string; values: number[]; color: string; options?: object }[],
  ) => ({
    labels,
    series: seriesData.map((s) => ({
      label: s.label,
      values: s.values,
      color: s.color,
      gradient: { top: 0.3, bottom: 0.1 },
      datalabels: { display: true },
      ...s.options,
    })),
  }),
  buildLineChart: (
    seriesData: { label: string; data: { ts?: number; value: number }[]; color: string }[],
  ) => ({
    series: seriesData.map((s) => ({
      label: s.label,
      points: s.data.map((d) => ({ ts: new Date(d.ts || 0).toISOString(), value: d.value })),
      color: s.color,
    })),
  }),
  EMPTY_STRUCTURES: {
    energyCosts: {
      energyMetrics: [],
      revenueVsCost: { labels: [], series: [] },
      powerSeries: { series: [] },
      units: { revenueCostUnit: '$/bucket' },
    },
  },
  pickLogs: (api: MockApi, filter?: string[]) => {
    if (!api?.regions) return { logsPerSource: [], period: 'daily' }
    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions
    return {
      logsPerSource: _map(regions, ({ log }) => log ?? []),
      period: api.period ?? regions[0]?.log?.[0]?.period ?? 'daily',
    }
  },
  makeLabelFormatter: (period?: string) =>
    period === PERIOD.MONTHLY
      ? (ts: number) => `${ts}-monthly-label`
      : (ts: number) => `${ts}-daily-label`,
  getPeriod: (api: MockApi) => api.period ?? api.regions?.[0]?.log?.[0]?.period ?? 'daily',
}))

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

describe('EnergyCosts.util', () => {
  describe('buildEnergyCostsCharts', () => {
    it('should return empty structure when logsPerSource is empty', () => {
      const result = buildEnergyCostsCharts({ regions: [] } as unknown as ReportApiResponse)
      expect(result).toEqual({
        energyMetrics: [],
        revenueVsCost: { labels: [], series: [] },
        powerSeries: { series: [] },
        units: { revenueCostUnit: '$/bucket' },
      })
    })

    it('should return empty structure when flattened logs is empty', () => {
      const result = buildEnergyCostsCharts({
        regions: [{ region: 'SITE-C', log: [] }],
      } as unknown as ReportApiResponse)
      expect(result).toEqual({
        energyMetrics: [],
        revenueVsCost: { labels: [], series: [] },
        powerSeries: { series: [] },
        units: { revenueCostUnit: '$/bucket' },
      })
    })

    it('should process single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                period: 'daily',
                sitePowerW: 50000000,
                downtimeRate: 0.1,
                totalEnergyCostsUSD: 80000,
                totalOperationalCostsUSD: 20000,
                energyRevenueUSD_MW: 150000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyCostsCharts(mockApi, { siteCode: 'SITE-C', buckets: 30 })
      expect(result.revenueVsCost.labels).toHaveLength(1)
      expect(result.revenueVsCost.series).toHaveLength(2)
      expect(result.revenueVsCost.series[0].values).toEqual([100000])
      expect(result.revenueVsCost.series[1].values).toEqual([150000])
      expect(result.powerSeries.series[0].points[0].value).toBe(50)
      expect(result.powerSeries.series[1].points[0].value).toBe(45)
      expect(result.energyMetrics[0].value).toBe(50)
      expect(result.energyMetrics[1].value).toBe(45)
      expect(result.energyMetrics[2].value).toBe(80000)
    })

    it('should handle multiple log entries correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: 40000000,
                downtimeRate: 0.05,
                totalEnergyCostsUSD: 60000,
                totalOperationalCostsUSD: 15000,
                energyRevenueUSD_MW: 120000,
              },
              {
                ts: 1641081600000,
                sitePowerW: 60000000,
                downtimeRate: 0.15,
                totalEnergyCostsUSD: 100000,
                totalOperationalCostsUSD: 25000,
                energyRevenueUSD_MW: 180000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyCostsCharts(mockApi, { siteCode: 'SITE-C', buckets: 30 })
      expect(result.revenueVsCost.labels).toHaveLength(2)
      expect(result.revenueVsCost.series[0].values).toEqual([75000, 125000])
      expect(result.revenueVsCost.series[1].values).toEqual([120000, 180000])
      expect(result.powerSeries.series[0].points[0].value).toBe(40)
      expect(result.powerSeries.series[0].points[1].value).toBe(60)
      expect(result.powerSeries.series[1].points[0].value).toBe(38)
      expect(result.powerSeries.series[1].points[1].value).toBe(51)
    })

    it('should handle missing or invalid numeric values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: null,
                downtimeRate: undefined,
                totalEnergyCostsUSD: 'invalid' as unknown as number,
                totalOperationalCostsUSD: NaN,
                energyRevenueUSD_MW: [] as unknown as number,
                revenueUSD: {} as unknown as number,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyCostsCharts(mockApi, { siteCode: 'SITE-C', buckets: 30 })
      expect(result.revenueVsCost.series[0].values).toEqual([0])
      expect(result.revenueVsCost.series[1].values).toEqual([0])
      expect(result.powerSeries.series[0].points[0].value).toBe(0)
      expect(result.powerSeries.series[1].points[0].value).toBe(0)
      expect(result.energyMetrics[0].value).toBe(0)
      expect(result.energyMetrics[1].value).toBe(0)
      expect(result.energyMetrics[2].value).toBe(0)
    })

    it('should limit results based on buckets parameter', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: Array.from({ length: 10 }, (_, i) => ({
              ts: 1640995200000 + i * 86400000,
              sitePowerW: 50000000,
              downtimeRate: 0.1,
              totalEnergyCostsUSD: 80000,
              totalOperationalCostsUSD: 20000,
              energyRevenueUSD_MW: 150000,
            })),
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyCostsCharts(mockApi, { siteCode: 'SITE-C', buckets: 5 })
      expect(result.revenueVsCost.labels).toHaveLength(5)
      expect(result.powerSeries.series[0].points).toHaveLength(5)
      expect(result.powerSeries.series[1].points).toHaveLength(5)
    })

    it('should generate ISO timestamps for chart points', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: 50000000,
                downtimeRate: 0.1,
                totalEnergyCostsUSD: 80000,
                totalOperationalCostsUSD: 20000,
                energyRevenueUSD_MW: 150000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyCostsCharts(mockApi, { siteCode: 'SITE-C', buckets: 30 })
      const timestamp = 1640995200000
      const expectedTimestamp = new Date(timestamp).toISOString()
      expect(result.powerSeries.series[0].points[0].ts).toBe(expectedTimestamp)
      expect(result.powerSeries.series[1].points[0].ts).toBe(expectedTimestamp)
    })
  })
})
