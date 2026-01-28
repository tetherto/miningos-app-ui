import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildEnergyRevenuesCharts } from './EnergyRevenues.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts?: number
  period?: string
  curtailmentRate?: number
  downtimeRate?: number
  energyRevenueUSD_MW?: number
  energyRevenueBTC_MW?: number
  revenueUSD?: number
  totalRevenueBTC?: number
  sitePowerW?: number
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
  validateLogs: (logs?: LogEntry[]) => ({ isValid: logs && logs.length > 0 }),
  safeNum: (val?: number) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  processAggregatedData: (
    byLabel: Record<string, object>,
    allLabels: string[],
    period?: string,
    startDate?: number,
    endDate?: number,
    fallbackLimit?: number,
  ) => {
    const data = allLabels.map((label) => ({ label, ...byLabel[label] }))
    return fallbackLimit ? data.slice(-fallbackLimit) : data
  },
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
    energyRevenues: {
      siteRevenueUSD: { labels: [], series: [] },
      siteRevenueBTC: { labels: [], series: [] },
      dailyAvgDowntime: { labels: [], series: [] },
      powerSeries: { series: [] },
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
    VIOLET: '#867DF9',
    SKY_BLUE: '#59E8E8',
  },
}))

describe('EnergyRevenues.util', () => {
  describe('buildEnergyRevenuesCharts', () => {
    it('should return empty structure when logsPerSource is empty', () => {
      const mockApi = { regions: [] } as unknown as ReportApiResponse

      const result = buildEnergyRevenuesCharts(mockApi)
      expect(result).toEqual({
        siteRevenueUSD: { labels: [], series: [] },
        siteRevenueBTC: { labels: [], series: [] },
        dailyAvgDowntime: { labels: [], series: [] },
        powerSeries: { series: [] },
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
                curtailmentRate: 0.1,
                downtimeRate: 0.15,
                energyRevenueUSD_MW: 1000,
                energyRevenueBTC_MW: 0.02,
                sitePowerW: 50000000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyRevenuesCharts(mockApi, { days: 30, powerDays: 30 })
      expect(result.siteRevenueUSD.labels).toHaveLength(1)
      expect(result.siteRevenueUSD.series[0].values).toEqual([1000])
      expect(result.siteRevenueBTC.series[0].values).toEqual([0.02])
      expect(result.dailyAvgDowntime.series[0].values[0]).toEqual(0.1)
      expect(result.dailyAvgDowntime.series[1].values[0]).toBeCloseTo(0.05, 10)
      expect(result.powerSeries.series[0].points[0].value).toEqual(50)
      expect(result.powerSeries.series[1].points[0].value).toEqual(42.5)
    })

    it('should aggregate multiple log entries for same timestamp', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                curtailmentRate: 0.1,
                downtimeRate: 0.15,
                energyRevenueUSD_MW: 500,
                energyRevenueBTC_MW: 0.01,
                sitePowerW: 25000000,
              },
              {
                ts: 1640995200000,
                curtailmentRate: 0.2,
                downtimeRate: 0.25,
                energyRevenueUSD_MW: 700,
                energyRevenueBTC_MW: 0.015,
                sitePowerW: 35000000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyRevenuesCharts(mockApi, { days: 30, powerDays: 30 })
      expect(result.siteRevenueUSD.series[0].values).toEqual([1200])
      expect(result.siteRevenueBTC.series[0].values).toEqual([0.025])
      expect(result.dailyAvgDowntime.series[0].values[0]).toBeCloseTo(0.15, 10)
      expect(result.dailyAvgDowntime.series[1].values[0]).toBeCloseTo(0.05, 10)
    })

    it('should handle multiple regions correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                energyRevenueUSD_MW: 1000,
                energyRevenueBTC_MW: 0.02,
                curtailmentRate: 0.1,
                downtimeRate: 0.15,
                sitePowerW: 50000000,
              },
            ],
          },
          {
            region: 'SITE-D',
            log: [
              {
                ts: 1640995200000,
                energyRevenueUSD_MW: 800,
                energyRevenueBTC_MW: 0.016,
                curtailmentRate: 0.05,
                downtimeRate: 0.1,
                sitePowerW: 40000000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyRevenuesCharts(mockApi, { days: 30, powerDays: 30 })
      expect(result.siteRevenueUSD.series).toHaveLength(2)
      expect(result.siteRevenueUSD.series[0].values).toEqual([1000])
      expect(result.siteRevenueUSD.series[1].values).toEqual([800])
      expect(result.siteRevenueBTC.series[0].values).toEqual([0.02])
      expect(result.siteRevenueBTC.series[1].values).toEqual([0.016])
    })

    it('should apply custom powerUnitDivisor correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                curtailmentRate: 0.1,
                downtimeRate: 0.15,
                energyRevenueUSD_MW: 1000,
                energyRevenueBTC_MW: 0.02,
                sitePowerW: 50000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEnergyRevenuesCharts(mockApi, {
        days: 30,
        powerDays: 30,
        powerUnitDivisor: 1000,
      })
      expect(result.powerSeries.series[0].points[0].value).toEqual(50)
      expect(result.powerSeries.series[1].points[0].value).toEqual(42.5)
    })
  })
})
