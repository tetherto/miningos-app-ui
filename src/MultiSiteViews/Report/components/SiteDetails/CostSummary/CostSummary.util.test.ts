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

    it('should return empty structure when api is null/undefined (validation fails)', () => {
      const result = buildCostSummaryCharts(null as unknown as ReportApiResponse)
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

    it('btcPriceVals should be 0 when currentBTCPrice is 0 (no price sample added)', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-A',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 0, // price = 0 → not added to priceSamples
                totalEnergyCostsUSD: 5000,
                totalOperationalCostsUSD: 1000,
                revenueUSD: 10000,
                hashRevenueBTC: 0.3,
                curtailmentRate: 0,
                downtimeRate: 0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi) as CostSummaryResult

      // priceSamples is empty → btcPriceVals[0] = 0
      expect(result.btcProdCost.series[0].values[0]).toBe(0)
      // prodCostDenominatorBTC > 0 → normal division
      expect(result.btcProdCost.series[1].values[0]).toBeGreaterThan(0)
    })

    it('prodCostPerBTCVals should be 0 when denominator is 0', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-B',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 40000,
                totalEnergyCostsUSD: 5000,
                totalOperationalCostsUSD: 1000,
                revenueUSD: 8000,
                hashRevenueBTC: 0, // 0 BTC revenue
                totalRevenueBTC: 0, // also 0 → den = 0
                curtailmentRate: 0.05,
                downtimeRate: 0.05, // equal → opIssues = Math.max(0, 0) = 0
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi) as CostSummaryResult

      // den = 0 → prodCostPerBTCVals[0] = 0
      expect(result.btcProdCost.series[1].values[0]).toBe(0)
    })

    it('uses totalRevenueBTC when hashRevenueBTC is 0', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-D',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 45000,
                totalEnergyCostsUSD: 3000,
                totalOperationalCostsUSD: 500,
                revenueUSD: 7000,
                hashRevenueBTC: 0, // 0 → falls through to totalRevenueBTC
                totalRevenueBTC: 0.2,
                curtailmentRate: 0.2,
                downtimeRate: 0.1, // curtail > downtime → opIssues = Math.max(0, -0.1) = 0
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi) as CostSummaryResult

      // totalRevBTC = totalRevenueBTC = 0.2 → den = 0.2 → production cost should be positive
      expect(result.btcProdCost.series[1].values[0]).toBeGreaterThan(0)
      // opIssues = Math.max(0, 0.1 - 0.2) = Math.max(0, -0.1) = 0
      expect(result.avgDowntime.series[1].values[0]).toBe(0)
    })

    it('applies region filter to limit data to matching regions', () => {
      const mockApi = {
        regions: [
          { region: 'SITE-A', log: [{ ts: 1000, currentBTCPrice: 50000, totalEnergyCostsUSD: 1000 }] },
          { region: 'SITE-B', log: [{ ts: 2000, currentBTCPrice: 40000, totalEnergyCostsUSD: 2000 }] },
        ],
      } as unknown as ReportApiResponse

      const resultAll = buildCostSummaryCharts(mockApi, { regionFilter: [] }) as CostSummaryResult
      const resultFiltered = buildCostSummaryCharts(mockApi, { regionFilter: ['SITE-A'] }) as CostSummaryResult

      expect(resultAll.btcProdCost.labels.length).toBeGreaterThanOrEqual(resultFiltered.btcProdCost.labels.length)
    })

    it('processes multiple log entries in same bucket by accumulating values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-E',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 50000,
                totalEnergyCostsUSD: 1000,
                totalOperationalCostsUSD: 500,
                revenueUSD: 3000,
                hashRevenueBTC: 0.1,
                curtailmentRate: 0.1,
                downtimeRate: 0.2,
              },
              {
                ts: 1640995200000, // same ts = same bucket
                currentBTCPrice: 60000,
                totalEnergyCostsUSD: 2000,
                totalOperationalCostsUSD: 700,
                revenueUSD: 5000,
                hashRevenueBTC: 0.2,
                curtailmentRate: 0.2,
                downtimeRate: 0.3,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi) as CostSummaryResult

      // Should have 1 bucket (same ts, same label)
      expect(result.btcProdCost.labels).toHaveLength(1)
      // Energy costs should be accumulated: 1000 + 2000 = 3000
      expect(result.powerCost.series[0].values[0]).toBe(4200) // (1000+500) + (2000+700)
    })

    it('returns correct metrics structure', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-F',
            log: [
              {
                ts: 1640995200000,
                currentBTCPrice: 50000,
                totalEnergyCostsUSD: 8000,
                totalOperationalCostsUSD: 2000,
                revenueUSD: 20000,
                hashRevenueBTC: 0.4,
                curtailmentRate: 0,
                downtimeRate: 0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildCostSummaryCharts(mockApi) as CostSummaryResult

      expect(result.metrics).toHaveLength(3)
      expect(result.metrics.find((m) => m.id === 'all_in_cost')?.isHighlighted).toBe(true)
      expect(result.metrics.find((m) => m.id === 'ene')?.unit).toBe('$')
      expect(result.metrics.find((m) => m.id === 'ops')?.unit).toBe('$')
      // all_in_cost = energyUSD + opsUSD = 8000 + 2000 = 10000
      expect(result.metrics.find((m) => m.id === 'all_in_cost')?.value).toBe(10000)
    })
  })
})
