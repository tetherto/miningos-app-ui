import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildEbitdaCharts } from './Ebitda.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

type MockLog = {
  ts?: number
  hashRevenueBTC?: number | null
  totalRevenueBTC?: number
  ebidtaSellingBTC?: number
  ebidtaNotSellingBTC?: number
  totalEnergyCostsUSD?: number
  totalOperationalCostsUSD?: number
  currentBTCPrice?: number
}

type MockRegion = {
  region: string
  log?: MockLog[]
}

type MockApi = {
  regions?: MockRegion[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: unknown) => ({ isValid: Boolean(api) }),
  validateLogs: (logs: unknown[]) => ({ isValid: Array.isArray(logs) && logs.length > 0 }),
  safeNum: (val: unknown) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),

  processAggregatedData: (
    byLabel: Record<
      string,
      {
        ts: number
        producedBTC: number
        ebitdaSell: number
        ebitdaHodl: number
        energyUSD: number
        opsUSD: number
        priceSamples: number[]
      }
    >,
    allLabels: string[],
    period: string,
    startDate?: string,
    endDate?: string,
    fallbackLimit?: number,
  ) => {
    let data = allLabels.map((label) => ({ label, ...byLabel[label] }))

    if (startDate && endDate && period === 'monthly') {
      const existingLabels = new Set(data.map((item) => item.label))

      if (
        existingLabels.has('01-01') &&
        existingLabels.has('02-01') &&
        !existingLabels.has('03-01')
      ) {
        data.push({
          label: '03-01',
          ts: new Date('2024-03-01').getTime(),
          producedBTC: 0,
          ebitdaSell: 0,
          ebitdaHodl: 0,
          energyUSD: 0,
          opsUSD: 0,
          priceSamples: [],
        })
      }

      data.sort((a, b) => a.ts - b.ts)
    }

    return fallbackLimit ? data.slice(-fallbackLimit) : data
  },

  buildBarChart: (
    labels: string[],
    seriesData: {
      label: string
      values: number[]
      color: string
      options?: Record<string, unknown>
    }[],
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

  EMPTY_STRUCTURES: {
    ebitda: {
      ebitdaChart: { labels: [], series: [] },
      btcProducedChart: { labels: [], series: [] },
      ebitdaMetrics: [],
    },
  },

  pickLogs: (api: MockApi, filter?: string[]) => {
    if (!api?.regions) return { logsPerSource: [], period: 'monthly' }

    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions

    return {
      logsPerSource: _map(regions, ({ log }) => log || []),
      period: api.period || 'monthly',
    }
  },

  makeLabelFormatter: (period: string) => {
    if (period === PERIOD.MONTHLY) {
      return (ts: number) => {
        const d = new Date(ts)
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }
    }

    return (ts: number) => {
      const d = new Date(ts)
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
  },
}))

vi.mock('@/constants/colors', () => ({
  CHART_COLORS: {
    blue: '#1890FF',
    red: '#F5222D',
    green: '#72F59E',
    orange: '#FF6A00',
  },
}))

describe('Ebitda.util', () => {
  describe('buildEbitdaCharts', () => {
    it('processes single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: 2.5,
                ebidtaSellingBTC: 150000,
                ebidtaNotSellingBTC: 200000,
                totalEnergyCostsUSD: 80000,
                totalOperationalCostsUSD: 20000,
                currentBTCPrice: 50000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)

      expect(result.ebitdaChart.labels).toHaveLength(1)
      expect(result.ebitdaChart.series[0].values).toEqual([150000])
      expect(result.btcProducedChart.series[0].values).toEqual([2.5])
    })

    it('handles negative EBITDA values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: 1,
                ebidtaSellingBTC: -50000,
                ebidtaNotSellingBTC: -25000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)

      expect(result.ebitdaChart.series[0].values).toEqual([-50000])
      expect(result.ebitdaChart.series[1].values).toEqual([-25000])
    })

    it('falls back to totalRevenueBTC when hashRevenueBTC is null', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: null,
                totalRevenueBTC: 3.0,
                ebidtaSellingBTC: 100000,
                ebidtaNotSellingBTC: 80000,
                totalEnergyCostsUSD: 50000,
                totalOperationalCostsUSD: 10000,
                currentBTCPrice: 48000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)

      // Should use totalRevenueBTC = 3.0 since hashRevenueBTC is null
      expect(result.btcProducedChart.series[0].values).toEqual([3.0])
    })

    it('produces zero avgPrice when currentBTCPrice is 0 or missing', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: 1.0,
                ebidtaSellingBTC: 50000,
                totalEnergyCostsUSD: 10000,
                currentBTCPrice: 0, // zero price — should NOT be added to priceSamples
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)
      // With no price samples, avgPrice should be 0
      const priceMetric = result.ebitdaMetrics.find((m) => m.id === 'bitcoin_price')
      expect(priceMetric?.value).toBe(0)
    })

    it('produces zero prodCostPerBTC when no BTC was produced', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: null,
                totalRevenueBTC: 0, // zero BTC produced
                totalEnergyCostsUSD: 30000,
                totalOperationalCostsUSD: 10000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)
      const costMetric = result.ebitdaMetrics.find((m) => m.id === 'bitcoin_production_cost')
      expect(costMetric?.value).toBe(0)
    })

    it('uses M unit for values >= 1,000,000', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: 1.0,
                ebidtaSellingBTC: 2_000_000,
                totalEnergyCostsUSD: 100000,
                currentBTCPrice: 45000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)
      const sellingMetric = result.ebitdaMetrics.find((m) => m.id === 'ebitda_selling_bitcoin')
      expect(sellingMetric?.unit).toBe('M')
    })

    it('uses $ unit for small values (< 1,000)', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashRevenueBTC: 1.0,
                ebidtaSellingBTC: 500,
                totalEnergyCostsUSD: 100,
                currentBTCPrice: 45000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildEbitdaCharts(mockApi)
      const sellingMetric = result.ebitdaMetrics.find((m) => m.id === 'ebitda_selling_bitcoin')
      expect(sellingMetric?.unit).toBe('$')
    })
  })
})
