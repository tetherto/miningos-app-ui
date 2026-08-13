import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildOperationsCharts } from './Operations.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts?: number
  period?: string
  hashrateMHS?: number
  efficiencyWThs?: number
  sitePowerW?: number
  downtimeRate?: number
}

interface Region {
  region: string
  nominalHashrate?: number
  nominalEfficiency?: number
  nominalMinerCapacity?: number
  log?: LogEntry[]
}

interface MockApi {
  regions?: Region[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: MockApi | null | undefined) => ({ isValid: !!api }),
  validateLogs: (logs?: LogEntry[]) => ({ isValid: !!logs && logs.length > 0 }),
  safeNum: (val?: number) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  mhsToPhs: (mhs?: number) => (typeof mhs === 'number' && !isNaN(mhs) ? mhs / 1e9 : 0),
  buildLineChart: (
    seriesData: { label: string; data: { ts?: number; value: number }[]; color: string }[],
    constants?: { label: string; value: number; color: string }[],
  ) => ({
    series: seriesData.map((s) => ({
      label: s.label,
      points: s.data.map((d) => ({ ts: new Date(d.ts || 0).toISOString(), value: d.value })),
      color: s.color,
    })),
    constants: constants || [],
  }),
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
  EMPTY_STRUCTURES: {
    operations: {
      hashrate: { series: [], constants: [] },
      efficiency: { series: [], constants: [] },
      workers: { series: [], constants: [] },
      powerConsumption: { series: [] },
    },
  },
  findRegionBySite: (api: MockApi, siteCode: string) =>
    api?.regions?.find((r) => r.region === siteCode) || {
      nominalHashrate: 0,
      nominalEfficiency: 0,
      nominalMinerCapacity: 0,
    },
  extractNominalValues: (region?: Region) => ({
    nominalHashrate: region?.nominalHashrate || 0,
    nominalEfficiency: region?.nominalEfficiency || 0,
    nominalMinerCapacity: region?.nominalMinerCapacity || 0,
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

describe('Operations.util', () => {
  describe('buildOperationsCharts', () => {
    it('returns empty structure when no logs available', () => {
      const mockApi = { regions: [] } as unknown as ReportApiResponse
      const result = buildOperationsCharts(mockApi)
      expect(result).toEqual({
        hashrate: { series: [], constants: [] },
        efficiency: { series: [], constants: [] },
        workers: { series: [], constants: [] },
        powerConsumption: { series: [] },
      })
    })

    it('processes single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            nominalEfficiency: 30.5,
            nominalHashrate: 50000000000000000,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: 45000000000,
                efficiencyWThs: 32.0,
                sitePowerW: 45000000,
                downtimeRate: 0.1,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildOperationsCharts(mockApi, { days: 30 })
      expect(result.hashrate.series[0].points[0].value).toBe(45)
      expect(result.hashrate.constants[0].value).toBe(50)
      expect(result.efficiency.series[0].points[0].value).toBe(32.0)
      expect(result.efficiency.constants[0].value).toBe(30.5)
      expect(result.workers.series[0].points[0].value).toBe(900)
      expect(result.workers.constants[0].value).toBe(1000)
      expect(result.powerConsumption.series[0].points[0].value).toBe(45)
      expect(result.powerConsumption.series[1].points[0].value).toBe(40.5)
    })

    it('aggregates multiple logs and multiple regions', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 500,
            nominalEfficiency: 28,
            nominalHashrate: 25000000000000000,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: 20000000000,
                efficiencyWThs: 28,
                sitePowerW: 20000000,
                downtimeRate: 0.05,
              },
              {
                ts: 1640995200000,
                hashrateMHS: 25000000000,
                efficiencyWThs: 32,
                sitePowerW: 25000000,
                downtimeRate: 0.1,
              },
            ],
          },
          {
            region: 'SITE-D',
            nominalMinerCapacity: 300,
            nominalEfficiency: 32,
            nominalHashrate: 15000000000000000,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: 12000000000,
                efficiencyWThs: 31,
                sitePowerW: 12000000,
                downtimeRate: 0.08,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildOperationsCharts(mockApi, { days: 30 })
      expect(result.hashrate.series[0].points[0].value).toBe(57) // 20 + 25 + 12 PH/s
      expect(result.workers.series[0].points[0].value).toBe(2216) // active miners sum
      expect(result.hashrate.constants[0].value).toBe(40) // sum nominal PH/s
    })

    it('handles invalid numeric values gracefully', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: null,
            nominalEfficiency: 'invalid' as unknown as number,
            nominalHashrate: undefined,
            log: [
              {
                ts: 1640995200000,
                hashrateMHS: NaN,
                efficiencyWThs: null,
                sitePowerW: 'invalid' as unknown as number,
                downtimeRate: undefined,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildOperationsCharts(mockApi, { days: 30 })
      expect(result.hashrate.series[0].points[0].value).toBe(0)
      expect(result.efficiency.series[0].points[0].value).toBe(0)
      expect(result.workers.series[0].points[0].value).toBe(0)
      expect(result.powerConsumption.series[0].points[0].value).toBe(0)
      expect(result.powerConsumption.series[1].points[0].value).toBe(0)
      expect(result.hashrate.constants[0].value).toBe(0)
      expect(result.efficiency.constants[0].value).toBe(0)
      expect(result.workers.constants[0].value).toBe(0)
    })
  })
})
