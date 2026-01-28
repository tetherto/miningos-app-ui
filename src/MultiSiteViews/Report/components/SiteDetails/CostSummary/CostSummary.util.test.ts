import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildCostSummaryCharts } from './CostSummary.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

type CostLog = {
  period: string | undefined
  ts?: number
  currentBTCPrice?: number | null
  totalEnergyCostsUSD?: number | null
  totalOperationalCostsUSD?: number | null
  revenueUSD?: number | null
  hashRevenueBTC?: number
  totalRevenueBTC?: number
  curtailmentRate?: number | null
  downtimeRate?: number | null
}

type RegionLog = {
  region: string
  log: CostLog[]
}

type CostApi = {
  regions?: RegionLog[]
  period?: string
}

type ChartSeries = {
  label: string
  values: number[]
  color?: string
  stack?: string
  gradient?: { top: number; bottom: number }
  datalabels?: { display: boolean }
}

type ChartData = {
  labels: string[]
  series: ChartSeries[]
}

type CostSummaryResult = {
  btcProdCost: ChartData
  avgDowntime: ChartData
  powerCost: ChartData
  metrics: {
    id: string
    label: string
    value: number
    unit: string
    isHighlighted?: boolean
  }[]
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: CostApi | null | undefined) => ({ isValid: !!api }),
  safeNum: (val: unknown): number => (typeof val === 'number' && !Number.isNaN(val) ? val : 0),
  avg: (arr: number[]): number => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  processAggregatedData: (
    byLabel: Record<string, Record<string, number>>,
    allLabels: string[],
    _period: string,
    _startDate?: number,
    _endDate?: number,
    fallbackLimit?: number,
  ) => {
    const data = allLabels.map((label) => ({ label, ...byLabel[label] }))
    return fallbackLimit ? data.slice(-fallbackLimit) : data
  },
  buildBarChart: (labels: string[], seriesData: ChartSeries[]) => ({
    labels,
    series: seriesData.map((s) => ({
      color: s.color,
      gradient: { top: 0.3, bottom: 0.1 },
      datalabels: { display: true },
      ...s,
    })),
  }),
  EMPTY_STRUCTURES: {
    costSummary: {
      btcProdCost: { labels: [], series: [] },
      avgDowntime: { labels: [], series: [] },
      powerCost: { labels: [], series: [] },
      metrics: [],
    },
  },
  pickLogs: (api: CostApi | null | undefined, filter?: string[]) => {
    if (!api?.regions) {
      return { logsPerSource: [] as CostLog[][], period: 'daily' }
    }

    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions

    return {
      logsPerSource: _map(regions, ({ log }) => log ?? []),
      period: api.period ?? regions[0]?.log?.[0]?.period ?? 'daily',
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
  },
}))

describe('CostSummary.util', () => {
  describe('buildCostSummaryCharts', () => {
    it('should return empty structure when logsPerSource is empty', () => {
      const result = buildCostSummaryCharts({
        regions: [],
      } as unknown as ReportApiResponse) as CostSummaryResult

      expect(result).toEqual({
        btcProdCost: { labels: [], series: [] },
        avgDowntime: { labels: [], series: [] },
        powerCost: { labels: [], series: [] },
        metrics: [],
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
                currentBTCPrice: 50000,
                totalEnergyCostsUSD: 10000,
                totalOperationalCostsUSD: 5000,
                revenueUSD: 25000,
                hashRevenueBTC: 0.5,
                curtailmentRate: 0.1,
                downtimeRate: 0.15,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi, {
        regionFilter: [],
        buckets: 12,
      }) as CostSummaryResult

      expect(result.btcProdCost.labels).toHaveLength(1)
      expect(result.btcProdCost.series[0].values).toEqual([50000])
      expect(result.btcProdCost.series[1].values).toEqual([30000])
      expect(result.avgDowntime.series[0].values).toEqual([0.1])
      expect(result.avgDowntime.series[1].values[0]).toBeCloseTo(0.05)
      expect(result.powerCost.series[0].values).toEqual([15000])
      expect(result.powerCost.series[1].values).toEqual([25000])
    })
  })
})
