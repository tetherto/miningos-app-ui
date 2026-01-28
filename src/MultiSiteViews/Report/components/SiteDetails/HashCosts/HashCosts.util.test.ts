import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildHashCostsCharts } from './HashCosts.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts?: number
  period?: string
  hashrateMHS?: number
  totalEnergyCostsUSD?: number
  totalOperationalCostsUSD?: number
  hashRevenueBTC?: number
  currentBTCPrice?: number
  hashRevenueUSD?: number
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
  safeNum: (val?: number) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  toPerPh: (value: number, phs: number) => (phs > 0 ? value / phs : 0),
  calculateHashRevenueUSD: (btc?: number, price?: number, usd?: number) =>
    usd || (btc && price ? btc * price : 0),
  mhsToPhs: (mhs?: number) => (mhs || 0) / 1e12,
  tsToISO: (ts?: number) => new Date(ts || 0).toISOString(),
  buildRevenueChart: (
    labels: string[],
    seriesConfig: { allInCost?: number[]; hashRevenue?: number[]; networkHashprice?: number[] },
  ) => ({
    labels,
    series: [
      { label: 'All-in Hash Cost', values: seriesConfig.allInCost || [], color: '#1890FF' },
      { label: 'Hash Revenue', values: seriesConfig.hashRevenue || [], color: '#F5222D' },
      { label: 'Network Hashprice', values: seriesConfig.networkHashprice || [], color: '#52C41A' },
    ],
  }),
  buildHashrateChart: (hashrateData: { ts?: number; value: number }[], nominalPHs?: number) => ({
    series: [
      {
        label: 'Daily Average Hashrate',
        points: hashrateData.map((d) => ({
          ts: new Date(d.ts || 0).toISOString(),
          value: d.value,
        })),
        color: '#1890FF',
      },
    ],
    constants: [
      {
        label: 'Installed Nominal Hashrate',
        value: nominalPHs || 0,
        color: '#F5222D',
      },
    ],
  }),
  EMPTY_STRUCTURES: {
    hashCosts: {
      revCostHashprice: { labels: [], series: [] },
      hashrate: { series: [], constants: [] },
      hashCostMetrics: [],
    },
  },
  processSortedLogs: (logs: LogEntry[][], buckets: number) => {
    if (!logs || !logs.length) return []
    const allLogs = logs.flat()
    return allLogs.slice(-buckets).map((log) => ({
      ts: log.ts || 0,
      hashrateMHS: log.hashrateMHS || 0,
      totalEnergyCostsUSD: log.totalEnergyCostsUSD || 0,
      totalOperationalCostsUSD: log.totalOperationalCostsUSD || 0,
      hashRevenueBTC: log.hashRevenueBTC || 0,
      currentBTCPrice: log.currentBTCPrice || 0,
      hashRevenueUSD: log.hashRevenueUSD || 0,
    }))
  },
  processNetworkData: (logs: LogEntry[]) => {
    const data: Record<number, { phs: number; usd: number }> = {}
    logs.forEach((log) => {
      const ts = log.ts || 0
      const phs = (log.hashrateMHS || 0) / 1e12
      const usd = log.hashRevenueUSD || (log.hashRevenueBTC || 0) * (log.currentBTCPrice || 0)
      if (data[ts]) {
        data[ts].phs += phs
        data[ts].usd += usd
      } else {
        data[ts] = { phs, usd }
      }
    })
    return data
  },
  findRegionBySite: (api: MockApi, siteCode: string) => {
    if (!api?.regions) return null
    return api.regions.find((r) => r.region === siteCode) || api.regions[0]
  },
  extractNominalValues: (region?: Region) => ({
    hashratePHs: region?.nominalHashrate ? region.nominalHashrate / 1e15 : 0,
  }),
  pickLogs: (api: MockApi, filter?: string[]) => {
    if (!api?.regions) return { logsPerSource: [], period: 'daily' }
    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions
    return {
      logsPerSource: _map(regions, ({ log }) => log || []),
      period: api.period || regions[0]?.log?.[0]?.period || 'daily',
    }
  },
  makeLabelFormatter: (period?: string) =>
    period === PERIOD.MONTHLY
      ? (ts: number) => `${ts}-monthly-label`
      : (ts: number) => `${ts}-daily-label`,
  getPeriod: (api: MockApi) => api?.period || 'daily',
}))

describe('HashCosts.util', () => {
  describe('buildHashCostsCharts', () => {
    it('should process valid data correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalHashrate: 50000000000000000,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: 45000000000000,
                totalEnergyCostsUSD: 80000,
                totalOperationalCostsUSD: 20000,
                hashRevenueBTC: 0.02,
                currentBTCPrice: 50000,
                hashRevenueUSD: 1000,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildHashCostsCharts(mockApi, { siteCode: 'SITE-C' })
      expect(result.revCostHashprice.labels).toHaveLength(1)
      expect(result.revCostHashprice.series).toHaveLength(3)
      expect(result.hashrate.series[0].points).toHaveLength(1)
      expect(result.hashCostMetrics).toHaveLength(3)
      expect(result.revCostHashprice.series[0].values[0]).toBeGreaterThan(0)
      expect(result.revCostHashprice.series[1].values[0]).toBeGreaterThan(0)
      expect(result.hashrate.constants[0].value).toBe(50)
    })

    it('should handle invalid numeric values gracefully', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: null,
                totalEnergyCostsUSD: 'invalid' as unknown as number,
                totalOperationalCostsUSD: undefined,
                hashRevenueBTC: NaN,
                currentBTCPrice: {} as unknown as number,
                hashRevenueUSD: [] as unknown as number,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildHashCostsCharts(mockApi, { siteCode: 'SITE-C' })
      expect(result.revCostHashprice.series[0].values[0]).toBe(0)
      expect(result.revCostHashprice.series[1].values[0]).toBe(0)
      expect(result.hashrate.series[0].points[0].value).toBe(0)
    })
  })
})
