import _constant from 'lodash/constant'
import { describe, expect, it, vi } from 'vitest'

import type { ReportApiResponse } from '../../Report.types'

import { buildAllSitesCharts } from './AllSites.util'

type ApiLog = {
  ts: number
  totalRevenueBTC?: number | null
  revenueUSD?: number | string | null
  energyRevenueUSD_MW?: number | null
  hashrateMHS?: number | null
  sitePowerW?: number | null
  totalEnergyCostsUSD?: number | null
  totalCostsUSD?: number | null
  downtimeRate?: number | string | null
  curtailmentRate?: number | null
  currentBTCPrice?: number | null
  efficiencyWThs?: number | string | null
}

type Region = {
  region: string
  log?: ApiLog[]
}

type MockApi = {
  data?: {
    log?: ApiLog[]
  }
  regions?: Region[]
  period?: string
  testLogs?: ApiLog[][]
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: unknown) => ({ isValid: Boolean(api) }),
  safeNum: (val: unknown): number => (typeof val === 'number' && !Number.isNaN(val) ? val : 0),
  avg: (arr: number[]): number => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  mhsToPhs: (mhs: number | null | undefined): number => (mhs || 0) / 1e12,

  buildBarChart: (
    labels: string[],
    seriesData: {
      label: string
      values: number[]
      color?: string
      options?: { stack?: string }
    }[],
  ) => ({
    labels,
    series: seriesData.map((s) => ({
      label: s.label,
      values: s.values,
      color: s.color,
      gradient: { top: 0.3, bottom: 0.1 },
      datalabels: { display: true },
      stack: s.options?.stack,
      ...s.options,
    })),
  }),

  buildLineChart: (
    seriesData: {
      label: string
      data: { ts: number; value: number }[]
      color?: string
    }[],
  ) => ({
    series: seriesData.map((s) => ({
      label: s.label,
      points: s.data.map((d) => ({
        ts: new Date(d.ts || 0).toISOString(),
        value: d.value,
      })),
      color: s.color,
    })),
  }),

  EMPTY_STRUCTURES: {
    allSites: {
      allSitesMetrics: {},
      siteMetrics: {},
      revenueChart: { labels: [], series: [] },
      hashrateChart: { series: [] },
      downtimeChart: { labels: [], series: [] },
      productionCostChart: null,
    },
  },

  pickLogs: (api: MockApi) => ({
    logsPerSource: api?.testLogs || [],
    period: 'daily',
  }),

  makeLabelFormatter: _constant((ts: number) => `${ts}-label`),
  getPeriod: _constant('daily'),
}))

vi.mock('@/constants/colors', () => ({
  CHART_COLORS: {
    blue: '#1890FF',
    red: '#F5222D',
    green: '#72F59E',
    VIOLET: '#867DF9',
  },
  COLOR: {
    DARK_TEXT_GREEN: '#00FF00',
    ORANGE_WARNING: '#FFA500',
    BRICK_RED: '#FF0000',
  },
}))

vi.mock('@/constants/units', () => ({
  CURRENCY: {
    BTC: '₿',
    USD: '$',
  },
  UNITS: {
    ENERGY_MW: 'MW',
  },
}))

vi.mock('@/app/utils/format', () => ({
  getEfficiencyString: (value: number): string => `${value} J/TH`,
}))

vi.mock('@/app/utils/deviceUtils', () => ({
  getHashrateString: (value: number): string => `${value} H/s`,
  getConsumptionString: (value: number): string => `${value} W`,
}))

describe('AllSites.util', () => {
  describe('buildAllSitesCharts', () => {
    it('returns empty structure when no logs available', () => {
      const api = { data: { log: [] } } as unknown as ReportApiResponse

      expect(buildAllSitesCharts(api)).toEqual({
        allSitesMetrics: {},
        siteMetrics: {},
        revenueChart: { labels: [], series: [] },
        hashrateChart: { labels: [], series: [] },
        downtimeChart: { labels: [], series: [] },
        productionCostChart: null,
      })
    })

    it('processes valid data for weekly report', () => {
      const api = {
        data: {
          log: [
            {
              ts: 1640995200000,
              totalRevenueBTC: 0.5,
              revenueUSD: 25000,
              hashrateMHS: 5e13,
              sitePowerW: 1e8,
              downtimeRate: 0.05,
              currentBTCPrice: 50000,
            },
            {
              ts: 1641081600000,
              totalRevenueBTC: 0.3,
              revenueUSD: 15000,
              hashrateMHS: 3e13,
              sitePowerW: 6e7,
              downtimeRate: 0.03,
              currentBTCPrice: 50000,
            },
          ],
          summary: {
            sum: { totalRevenueBTC: 0.8 },
            avg: {
              hashrateMHS: 4e13,
              sitePowerW: 8e7,
              downtimeRate: 0.04,
              currentBTCPrice: 50000,
              totalEnergyCostsUSD: 1000,
              efficiencyWThs: 30,
              energyRevenueUSD_MW: 500,
            },
          },
        },
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalRevenueBTC: 0.3 },
              { ts: 1641081600000, totalRevenueBTC: 0.2 },
            ],
            summary: {
              sum: { totalRevenueBTC: 0.5 },
              avg: {
                hashrateMHS: 2e13,
                sitePowerW: 5e7,
                downtimeRate: 0.03,
                currentBTCPrice: 50000,
                totalEnergyCostsUSD: 500,
                efficiencyWThs: 30,
                energyRevenueUSD_MW: 250,
              },
            },
          },
          {
            region: 'SITE-D',
            log: [
              { ts: 1640995200000, totalRevenueBTC: 0.2 },
              { ts: 1641081600000, totalRevenueBTC: 0.1 },
            ],
            summary: {
              sum: { totalRevenueBTC: 0.3 },
              avg: {
                hashrateMHS: 2e13,
                sitePowerW: 3e7,
                downtimeRate: 0.05,
                currentBTCPrice: 50000,
                totalEnergyCostsUSD: 500,
                efficiencyWThs: 30,
                energyRevenueUSD_MW: 250,
              },
            },
          },
        ],
        period: 'daily',
      } as unknown as ReportApiResponse

      const result = buildAllSitesCharts(api, { reportType: 'weekly' })

      expect(result.revenueChart.labels).toHaveLength(2)
      expect(result.revenueChart.series).toHaveLength(2)
      expect((result.allSitesMetrics as { btcMined: { value: number } }).btcMined.value).toBe(0.8)
      expect(
        (result.siteMetrics as Record<string, { btcMined: { value: number } }>)['SITE-C'].btcMined
          .value,
      ).toBe(0.5)
      expect(
        (result.siteMetrics as Record<string, { btcMined: { value: number } }>)['SITE-D'].btcMined
          .value,
      ).toBeCloseTo(0.3)
      expect(result.productionCostChart).toBeNull()
    })

    it('creates production cost chart for yearly report', () => {
      const api = {
        data: {
          log: [
            {
              ts: 1640995200000,
              totalRevenueBTC: 1,
              currentBTCPrice: 50000,
            },
          ],
        },
        regions: [{ region: 'SITE-C' }],
        period: 'daily',
      } as unknown as ReportApiResponse

      const result = buildAllSitesCharts(api, { reportType: 'yearly' })

      expect(result.productionCostChart).not.toBeNull()
      expect(result.productionCostChart?.series).toHaveLength(2)
      expect(result.productionCostChart?.series[0].label).toBe('Bitcoin Price')
      expect(result.productionCostChart?.series[1].label).toBe('SITE-C')
    })

    it('handles invalid numeric values gracefully', () => {
      const api = {
        data: {
          log: [
            {
              ts: 1640995200000,
              totalRevenueBTC: null,
              revenueUSD: 'invalid',
              hashrateMHS: NaN,
              sitePowerW: null,
              downtimeRate: 'high',
            },
          ],
          summary: {
            sum: { totalRevenueBTC: 0 },
            avg: {
              hashrateMHS: 0,
              sitePowerW: 0,
              downtimeRate: 0,
              currentBTCPrice: 0,
              totalEnergyCostsUSD: 0,
              efficiencyWThs: 0,
              energyRevenueUSD_MW: 0,
            },
          },
        },
        regions: [
          {
            region: 'SITE-C',
            summary: {
              sum: { totalRevenueBTC: 0 },
              avg: {
                hashrateMHS: 0,
                sitePowerW: 0,
                downtimeRate: 0,
                currentBTCPrice: 0,
                totalEnergyCostsUSD: 0,
                efficiencyWThs: 0,
                energyRevenueUSD_MW: 0,
              },
            },
          },
        ],
        period: 'daily',
      } as unknown as ReportApiResponse

      const result = buildAllSitesCharts(api)

      expect((result.allSitesMetrics as { btcMined: { value: number } }).btcMined.value).toBe(0)
      expect((result.allSitesMetrics as { avgHashrate: { value: number } }).avgHashrate.value).toBe(
        0,
      )
      expect(result.revenueChart.series[0].values[0]).toBe(0)
    })

    it('splits data correctly between sites', () => {
      const api = {
        data: {
          log: [
            {
              ts: 1640995200000,
              totalRevenueBTC: 1,
            },
          ],
        },
        regions: [
          {
            region: 'SITE-C',
            log: [{ ts: 1640995200000, totalRevenueBTC: 0.6 }],
          },
          {
            region: 'SITE-D',
            log: [{ ts: 1640995200000, totalRevenueBTC: 0.4 }],
          },
        ],
        period: 'daily',
      } as unknown as ReportApiResponse

      const result = buildAllSitesCharts(api)

      expect(result.revenueChart.series[0].label).toBe('SITE-C')
      expect(result.revenueChart.series[1].label).toBe('SITE-D')
      expect(result.revenueChart.series[0].values[0]).toBe(0.6)
      expect(result.revenueChart.series[1].values[0]).toBe(0.4)
    })
  })
})
