import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildWorkersChart } from './Workers.util'

import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

type WorkerLog = {
  ts?: number
  downtimeRate?: number | null
}

type WorkerRegion = {
  region: string
  nominalMinerCapacity?: number | null
  log?: WorkerLog[]
}

type WorkersApi = {
  regions?: WorkerRegion[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: unknown) => ({ isValid: Boolean(api) }),

  safeNum: (val: unknown) => (typeof val === 'number' && !isNaN(val) ? val : 0),

  buildLineChart: (
    seriesData: Array<{
      label: string
      data: Array<{ ts?: number; value: number }>
      color: string
    }>,
    constants?: unknown[],
  ) => ({
    series: seriesData.map((s) => ({
      label: s.label,
      points: s.data.map((d) => ({
        ts: new Date(d.ts || 0).toISOString(),
        value: d.value,
      })),
      color: s.color,
    })),
    constants: constants || [],
  }),

  EMPTY_STRUCTURES: {
    workers: {
      series: [],
      constants: [],
    },
  },

  findRegionBySite: (api: WorkersApi, siteCode: string) =>
    api?.regions?.find((r) => r.region === siteCode) || { nominalMinerCapacity: 0 },

  extractNominalValues: (region: WorkerRegion) => ({
    minerCapacity: region?.nominalMinerCapacity ?? 0,
  }),

  pickLogs: (api: WorkersApi, filter?: string[]) => {
    if (!api?.regions) {
      return { logsPerSource: [], period: 'daily' }
    }

    const regions = filter?.length
      ? _filter(api.regions, ({ region }) => _includes(filter, region))
      : api.regions

    return {
      logsPerSource: _map(regions, ({ log }) => log || []),
      period: api.period || 'daily',
    }
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
  },
}))

describe('Workers.util', () => {
  describe('buildWorkersChart', () => {
    it('returns empty structure when logsPerSource is empty', () => {
      const mockApi = { regions: [] } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result).toEqual({ series: [], constants: [] })
    })

    it('processes a single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            log: [{ ts: 1640995200000, downtimeRate: 0.1 }],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result.series[0].points).toHaveLength(1)
      expect(result.series[0].points[0].value).toBe(900)
      expect(result.series[0].points[0].ts).toBe(new Date(1640995200000).toISOString())

      expect(result.constants[0].value).toBe(1000)
      expect(result.series[0]).toMatchObject({
        label: 'Daily Avg Active Miners',
        color: '#6EE7B7',
      })
      expect(result.constants[0]).toMatchObject({
        label: 'Total Miner Capacity',
        color: '#F5222D',
      })
    })

    it('handles multiple log entries correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            log: [
              { ts: 1640995200000, downtimeRate: 0.05 },
              { ts: 1641081600000, downtimeRate: 0.15 },
              { ts: 1641168000000, downtimeRate: 0.08 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result.series[0].points).toHaveLength(3)
      expect(result.series[0].points[0].value).toBe(950)
      expect(result.series[0].points[1].value).toBe(850)
      expect(result.series[0].points[2].value).toBe(920)
    })

    it('limits results based on days parameter', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            log: Array.from({ length: 10 }, (_, i) => ({
              ts: 1640995200000 + i * 86400000,
              downtimeRate: 0.1,
            })),
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 5 })

      expect(result.series[0].points).toHaveLength(5)
    })

    it('handles missing or invalid downtime values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            log: [
              { ts: 1640995200000, downtimeRate: null },
              { ts: 1641081600000, downtimeRate: undefined },
              { ts: 1641168000000, downtimeRate: 'invalid' as unknown as number },
              { ts: 1641254400000 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result.series[0].points).toHaveLength(4)
      result.series[0].points.forEach((p) => {
        expect(p.value).toBe(1000)
      })
    })

    it('handles negative downtime rates correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: 1000,
            log: [{ ts: 1640995200000, downtimeRate: -0.1 }],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result.series[0].points[0].value).toBe(1100)
    })

    it('returns empty structure when region not found', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-D',
            nominalMinerCapacity: 500,
            log: [{ ts: 1640995200000, downtimeRate: 0.1 }],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result).toEqual({ series: [], constants: [] })
    })

    it('handles invalid capacity values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            nominalMinerCapacity: null,
            log: [{ ts: 1640995200000, downtimeRate: 0.1 }],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi, { siteCode: 'SITE-C', days: 30 })

      expect(result.constants[0].value).toBe(0)
      expect(result.series[0].points[0].value).toBe(0)
    })

    it('uses default parameters when not provided', () => {
      const mockApi = {
        regions: [{ region: 'SITE-C', nominalMinerCapacity: 1000, log: [] }],
      } as unknown as ReportApiResponse

      const result = buildWorkersChart(mockApi)

      expect(result.series).toBeDefined()
      expect(result.constants).toBeDefined()
    })
  })
})
