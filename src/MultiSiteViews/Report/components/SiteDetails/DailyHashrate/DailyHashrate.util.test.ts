import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildDailyHashratesCharts } from './DailyHashrate.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts: number
  hashrateMHS?: number
  currentBTCPrice?: number
  hashRevenueBTC?: number
  hashRevenueUSD?: number
  totalRevenueBTC?: number
  period?: string
}

interface Region {
  region: string
  nominalHashrate?: number
  log?: LogEntry[]
}

interface MockApi {
  regions?: Region[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: MockApi | null | undefined) => ({ isValid: !!api }),
  validateLogs: (logs: LogEntry[] | LogEntry[][]) => ({
    isValid: Array.isArray(logs) && logs.length > 0,
  }),
  safeNum: (val?: number) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  createHashrateAggregator: () => ({
    aggregate: (row: LogEntry) => ({
      hashratePHS: (row.hashrateMHS || 0) / 1_000_000,
      hashRevenueUSD:
        row.hashRevenueUSD ??
        (row.hashRevenueBTC ?? row.totalRevenueBTC ?? 0) * (row.currentBTCPrice ?? 0),
    }),
  }),
  groupLogsByPeriod: (
    logsPerSource: LogEntry[][],
    labelFormatter: (ts: number) => string,
    aggregator: { aggregate: (row: LogEntry) => { hashratePHS: number; hashRevenueUSD: number } },
  ) => {
    const allLogs = logsPerSource.flat()
    const buckets: Record<string, { ts: number; phsSum: number; usdSum: number }> = {}
    allLogs.forEach((log) => {
      const label = labelFormatter(log.ts)
      const aggregated = aggregator.aggregate(log)
      if (!buckets[label]) {
        buckets[label] = { ts: log.ts, phsSum: 0, usdSum: 0 }
      }
      buckets[label].phsSum += aggregated.hashratePHS
      buckets[label].usdSum += aggregated.hashRevenueUSD
      buckets[label].ts = Math.max(buckets[label].ts, log.ts)
    })
    return buckets
  },
  applyDayLimit: (buckets: Record<string, unknown>, days?: number) => {
    if (!days) return Object.keys(buckets)
    return Object.keys(buckets).slice(-days)
  },
  toPerPh: (usdSum: number, phsSum: number) => (phsSum > 0 ? usdSum / phsSum : 0),
  findRegionBySite: (api: MockApi, siteCode?: string) =>
    api.regions?.find((r) => r.region === siteCode) ?? { nominalHashrate: 0 },
  extractNominalValues: (region: { nominalHashrate?: number }) => ({
    nominalHashrate: region.nominalHashrate ?? 0,
    hashratePHs: (region.nominalHashrate ?? 0) / 1_000_000,
  }),
  mhsToPhs: (mhs?: number) => (mhs ?? 0) / 1_000_000,
  buildLineChart: (
    seriesData: { label: string; data: { ts: number; value: number }[]; color: string }[],
    constants?: { label: string; value: number; color: string }[],
  ) => ({
    series: seriesData.map((s) => ({
      label: s.label,
      points: s.data.map((d) => ({ ts: new Date(d.ts || 0).toISOString(), value: d.value })),
      color: s.color,
    })),
    constants: constants ?? [],
  }),
  EMPTY_STRUCTURES: {
    dailyHashrate: { hashpriceChart: { series: [] }, dailyHashrateChart: null, metrics: [] },
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
  makeLabelFormatter: (period: string | undefined) =>
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
  },
}))

describe('DailyHashrate.util', () => {
  describe('buildDailyHashratesCharts', () => {
    it('should return expected structure when logsPerSource is empty', () => {
      const mockApi = {
        regions: [{ region: 'SITE-C', nominalHashrate: 50_000_000_000_000_000, log: [] }],
      } as unknown as ReportApiResponse

      const result = buildDailyHashratesCharts(mockApi, { siteCode: 'SITE-C', days: 30 })
      expect(result.hashpriceChart.series).toHaveLength(1)
      expect(result.dailyHashrateChart.series).toHaveLength(1)
      expect(result.metrics).toHaveLength(3)
      expect(result.dailyHashrateChart.series[0].points).toHaveLength(0)
      expect(result.hashpriceChart.series[0].points).toHaveLength(0)
    })

    it('should process single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalHashrate: 50_000_000_000_000_000,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: 45_000_000_000,
                currentBTCPrice: 50_000,
                hashRevenueBTC: 0.02,
                hashRevenueUSD: 1000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildDailyHashratesCharts(mockApi, { siteCode: 'SITE-C', days: 30 })
      expect(result.dailyHashrateChart.series[0].points).toHaveLength(1)
      expect(result.dailyHashrateChart.series[0].points[0].value).toBe(45_000)
      expect(result.dailyHashrateChart.constants[0].value).toBe(50_000_000_000)
      expect(result.hashpriceChart.series[0].points[0].value).toBeCloseTo(0.022, 3)
      expect(result.metrics[0].value).toBe(45)
      expect(result.metrics[1].value).toBe(45_000)
      expect(result.metrics[2].value).toBeCloseTo(0.02, 3)
    })
  })
})
