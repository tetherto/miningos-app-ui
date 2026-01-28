import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildPowerConsumptionChart } from './PowerConsumption.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

type PowerLog = {
  ts: number
  sitePowerW?: number | null
  downtimeRate?: number | string | null
  period?: string
}

type Region = {
  region: string
  log?: PowerLog[]
}

type PowerConsumptionApi = {
  regions?: Region[]
  period?: string
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

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: PowerConsumptionApi | null | undefined) => ({
    isValid: Boolean(api),
  }),

  validateLogs: (logs: PowerLog[] | undefined) => ({
    isValid: Array.isArray(logs) && logs.length > 0,
  }),

  safeNum: (val: unknown): number => (typeof val === 'number' && !Number.isNaN(val) ? val : 0),

  buildLineChart: (
    seriesData: {
      label: string
      data: { ts: number; value: number }[]
      color: string
    }[],
  ): { series: LineSeries[] } => ({
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
    powerConsumption: { series: [] as LineSeries[] },
  },

  pickLogs: (api: PowerConsumptionApi | null | undefined, filter?: string[]) => {
    if (!api?.regions) {
      return { logsPerSource: [] as PowerLog[][], period: 'daily' }
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
    orange: '#FF6A00',
  },
  COLOR: {
    MINT_GREEN: '#6EE7B7',
  },
}))

describe('PowerConsumption.util', () => {
  describe('buildPowerConsumptionChart', () => {
    it('should return empty structure when no logs available', () => {
      const mockApi = { regions: [] } as unknown as ReportApiResponse

      const result = buildPowerConsumptionChart(mockApi)

      expect(result).toEqual({ series: [] })
    })

    it('should process valid data correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: 50_000_000,
                downtimeRate: 0.1,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildPowerConsumptionChart(mockApi, {
        siteCode: 'SITE-C',
        days: 30,
      })

      expect(result.series).toHaveLength(2)

      expect(result.series[0].label).toBe('Daily Avg Power Consumption')
      expect(result.series[0].points[0].value).toBe(50)

      expect(result.series[1].label).toBe('Daily Avg Power Availability')
      expect(result.series[1].points[0].value).toBe(45)
    })

    it('should handle invalid numeric values gracefully', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: null,
                downtimeRate: 'invalid',
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildPowerConsumptionChart(mockApi)

      expect(result.series[0].points[0].value).toBe(0)
      expect(result.series[1].points[0].value).toBe(0)
    })

    it('should aggregate multiple samples correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                sitePowerW: 30_000_000,
                downtimeRate: 0.05,
              },
              {
                ts: 1640995200000,
                sitePowerW: 70_000_000,
                downtimeRate: 0.15,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildPowerConsumptionChart(mockApi, { days: 30 })

      expect(result.series[0].points[0].value).toBe(50)
      expect(result.series[1].points[0].value).toBe(44)
    })
  })
})
