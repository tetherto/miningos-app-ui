import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildHashRevenuesCharts } from './HashRevenues.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

type HashRevenueLog = {
  ts: number
  currentBTCPrice?: number | null
  hashRevenueBTC?: number | string | null
  hashRevenueUSD?: number | null
  hashrateMHS?: number | null
  period?: string
}

type Region = {
  region: string
  log?: HashRevenueLog[]
}

type HashRevenueApi = {
  regions?: Region[]
  period?: string
}

type BarSeries = {
  label: string
  values: number[]
  color: string
  gradient?: { top: number; bottom: number }
  datalabels?: { display: boolean }
}

type BarChart = {
  labels: string[]
  series: BarSeries[]
}

type LinePoint = {
  ts: string
  value: number
}

type LineSeries = {
  label: string
  points: LinePoint[]
  color: string
}

type LineChart = {
  series: LineSeries[]
}

type HashRevenuesEmpty = {
  siteHashUSD: BarChart
  siteHashBTC: BarChart
  networkHashrate: LineChart
  networkHashprice: BarChart
  hashMetrics: Array<{
    label: string
    value: number
  }>
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: HashRevenueApi | null | undefined) => ({
    isValid: Boolean(api),
  }),

  validateLogs: (logs: HashRevenueLog[] | undefined) => ({
    isValid: Array.isArray(logs) && logs.length > 0,
  }),

  safeNum: (val: number | null | undefined): number =>
    typeof val === 'number' && !Number.isNaN(val) ? val : 0,

  mhsToPhs: (mhs: number | null | undefined): number =>
    (typeof mhs === 'number' ? mhs : 0) / 1_000_000,

  calculateHashRevenueUSD: (
    btc: number | null | undefined,
    price: number | null | undefined,
    usd: number | null | undefined,
  ): number => usd ?? (btc ?? 0) * (price ?? 0),

  processAggregatedData: (
    byLabel: Record<string, Record<string, number>>,
    allLabels: string[],
    _period: string,
    _startDate?: number,
    _endDate?: number,
    fallbackLimit?: number,
  ): Array<Record<string, number | string>> => {
    const data = allLabels.map((label) => ({
      label,
      ...byLabel[label],
    }))

    return fallbackLimit ? data.slice(-fallbackLimit) : data
  },

  buildBarChart: (
    labels: string[],
    seriesData: {
      label: string
      values: number[]
      color: string
      options?: { datalabels?: { display: boolean } }
    }[],
  ): BarChart => ({
    labels,
    series: seriesData.map((s) => ({
      label: s.label,
      values: s.values,
      color: s.color,
      gradient: { top: 0.3, bottom: 0.1 },
      datalabels: s.options?.datalabels ?? { display: true },
    })),
  }),

  buildLineChart: (
    seriesData: {
      label: string
      data: { ts: number; value: number }[]
      color: string
    }[],
  ): LineChart => ({
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
    hashRevenues: {
      siteHashUSD: { labels: [], series: [] },
      siteHashBTC: { labels: [], series: [] },
      networkHashrate: { series: [] },
      networkHashprice: { labels: [], series: [] },
      hashMetrics: [],
    } satisfies HashRevenuesEmpty,
  },

  pickLogs: (api: HashRevenueApi | null | undefined, filter?: string[]) => {
    if (!api?.regions) {
      return { logsPerSource: [] as HashRevenueLog[][], period: 'daily' }
    }

    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions

    return {
      logsPerSource: _map(regions, ({ log }) => log || []),
      period: api.period || regions[0]?.log?.[0]?.period || 'daily',
    }
  },

  makeLabelFormatter: (period: string) => {
    if (period === PERIOD.MONTHLY) {
      return (ts: number) => `${ts}-monthly-label`
    }
    return (ts: number) => `${ts}-daily-label`
  },
}))

vi.mock('@/constants/colors', () => ({
  CHART_COLORS: {
    blue: '#1890FF',
    red: '#F5222D',
    green: '#72F59E',
    orange: '#FF6A00',
    VIOLET: '#867DF9',
  },
}))

describe('HashRevenues.util', () => {
  describe('buildHashRevenuesCharts', () => {
    it('should return empty structure when no logs available', () => {
      const mockApi = { regions: [] } as unknown as ReportApiResponse

      const result = buildHashRevenuesCharts(mockApi)

      expect(result.siteHashUSD.series).toHaveLength(0)
      expect(result.hashMetrics).toHaveLength(0)
    })

    it('should process valid data correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 50_000,
                hashRevenueBTC: 0.02,
                hashRevenueUSD: 1000,
                hashrateMHS: 50_000_000_000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildHashRevenuesCharts(mockApi, { days: 30 })

      expect(result.siteHashUSD.series[0].values[0]).toBe(1000)
      expect(result.siteHashBTC.series[0].values[0]).toBe(0.02)
      expect(result.networkHashrate.series[0].points[0].value).toBeGreaterThan(0)
      expect(result.hashMetrics).toHaveLength(2)
    })

    it('should handle invalid numeric values gracefully', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: null,
                hashRevenueBTC: 'invalid',
                hashRevenueUSD: undefined,
                hashrateMHS: NaN,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildHashRevenuesCharts(mockApi, { days: 30 })

      expect(result.siteHashUSD.series[0].values[0]).toBe(0)
      expect(result.siteHashBTC.series[0].values[0]).toBe(0)
      expect(result.networkHashrate.series[0].points[0].value).toBe(0)
      expect(result.networkHashprice.series[0].values[0]).toBe(0)
    })
  })
})
