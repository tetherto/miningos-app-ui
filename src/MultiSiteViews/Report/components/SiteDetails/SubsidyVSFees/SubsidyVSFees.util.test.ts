import _filter from 'lodash/filter'
import _includes from 'lodash/includes'
import _map from 'lodash/map'
import { describe, expect, it, vi } from 'vitest'

import { buildSubsidyFeesCharts } from './SubsidyVSFees.util'

import { PERIOD } from '@/constants/ranges'
import { ReportApiResponse } from '@/MultiSiteViews/Report/Report.types'

interface LogEntry {
  ts: number
  period?: string
  totalFeesBTC?: number | null
  hashRevenueBTC?: number | null
  avgFeesSatsVByte?: number | null
}

interface Region {
  region: string
  log?: LogEntry[]
}

interface MockApi {
  regions?: Region[]
  period?: string
}

vi.mock('@/MultiSiteViews/Report/lib', () => ({
  validateApiData: (api: MockApi | null | undefined) => ({ isValid: !!api }),
  safeNum: (val?: number | null) => (typeof val === 'number' && !isNaN(val) ? val : 0),
  avg: (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0),
  buildBarChart: (
    labels: string[],
    seriesData: {
      label: string
      values: number[]
      color?: string
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
    lines: [],
  }),
  EMPTY_STRUCTURES: {
    subsidyVSFees: {
      subsidyFees: { labels: [] as string[], series: [], lines: [] },
      avgFeesSats: { labels: [] as string[], series: [] },
    },
  },
  pickLogs: (api: MockApi, filter?: string[]) => {
    if (!api?.regions) return { logsPerSource: [] as LogEntry[][], period: 'daily' }
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
    RED: '#EF4444',
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

describe('SubsidyVSFees.util', () => {
  describe('buildSubsidyFeesCharts', () => {
    it('should process single log entry correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalFeesBTC: 0.1, hashRevenueBTC: 1.0, avgFeesSatsVByte: 15.5 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      expect(result.subsidyFees.labels).toHaveLength(1)
      expect(result.subsidyFees.series).toHaveLength(2)
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      const feesSeries = result.subsidyFees.series.find((s) => s.label === 'Fees')
      expect(subsidySeries!.values).toEqual([0.9])
      expect(feesSeries!.values).toEqual([0.1])
      expect(result.subsidyFees.lines![0].values).toEqual([0.1])
      expect(result.avgFeesSats.series[0].values).toEqual([15.5])
    })

    it('should handle multiple log entries and aggregate correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalFeesBTC: 0.1, hashRevenueBTC: 1.0, avgFeesSatsVByte: 15.0 },
              { ts: 1641081600000, totalFeesBTC: 0.2, hashRevenueBTC: 1.5, avgFeesSatsVByte: 20.0 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      expect(result.subsidyFees.labels).toHaveLength(2)
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      const feesSeries = result.subsidyFees.series.find((s) => s.label === 'Fees')
      expect(subsidySeries!.values).toEqual([0.9, 1.3])
      expect(feesSeries!.values).toEqual([0.1, 0.2])
      expect(result.avgFeesSats.series[0].values).toEqual([15.0, 20.0])
    })

    it('should aggregate multiple log sources for same timestamp', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalFeesBTC: 0.1, hashRevenueBTC: 1.0, avgFeesSatsVByte: 15.0 },
            ],
          },
          {
            region: 'SITE-D',
            log: [
              {
                ts: 1640995200000,
                totalFeesBTC: 0.05,
                hashRevenueBTC: 0.5,
                avgFeesSatsVByte: 12.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      expect(result.subsidyFees.labels).toHaveLength(1)
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      const feesSeries = result.subsidyFees.series.find((s) => s.label === 'Fees')
      expect(subsidySeries!.values).toEqual([1.35])
      expect(feesSeries!.values[0]).toBeCloseTo(0.15, 10)
      expect(result.avgFeesSats.series[0].values).toEqual([13.5])
    })

    it('should limit results based on days parameter', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: Array.from({ length: 10 }, (_, i) => ({
              ts: 1640995200000 + i * 86400000,
              totalFeesBTC: 0.1,
              hashRevenueBTC: 1.0,
              avgFeesSatsVByte: 15.0,
            })),
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 5 })
      expect(result.subsidyFees.labels).toHaveLength(5)
      expect(result.subsidyFees.series[0].values).toHaveLength(5)
      expect(result.avgFeesSats.series[0].values).toHaveLength(5)
    })

    it('should handle missing or invalid numeric values', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                totalFeesBTC: null,
                hashRevenueBTC: undefined,
                avgFeesSatsVByte: null,
              },
              { ts: 1641081600000, totalFeesBTC: NaN, hashRevenueBTC: NaN, avgFeesSatsVByte: null },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      const feesSeries = result.subsidyFees.series.find((s) => s.label === 'Fees')
      expect(subsidySeries!.values).toEqual([0, 0])
      expect(feesSeries!.values).toEqual([0, 0])
      expect(result.avgFeesSats.series[0].values).toEqual([0, 0])
    })

    it('should handle negative hashRevenueBTC correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalFeesBTC: 0.5, hashRevenueBTC: 0.3, avgFeesSatsVByte: 15.0 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      expect(subsidySeries!.values).toEqual([0])
    })

    it('should apply region filtering correctly', () => {
      const mockApi = {
        regions: [
          { region: 'SITE-C', log: [] },
          { region: 'SITE-D', log: [] },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { regionFilter: ['SITE-C'], days: 15 })
      expect(result.subsidyFees.labels).toEqual([])
      expect(result.avgFeesSats.labels).toEqual([])
    })

    it('should use custom region colors and labels', () => {
      const mockApi = { regions: [{ region: 'SITE-C', log: [] }] } as unknown as ReportApiResponse
      const regionLabelMap = { 'SITE-C': 'Site-C' }
      const regionColors = { 'Site-C': '#FF0000' }

      const result = buildSubsidyFeesCharts(mockApi, {
        regionFilter: ['SITE-C'],
        regionLabelMap,
        regionColors,
        days: 15,
      })
      const subsidySeries = result.subsidyFees.series.find((s) => s.label === 'Subsidy')
      expect(subsidySeries!.color).toBe('#FF0000')
    })

    it('should calculate fee percentage correctly', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              {
                ts: 1640995200000,
                totalFeesBTC: 0.25,
                hashRevenueBTC: 1.0,
                avgFeesSatsVByte: 15.0,
              },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      expect(result.subsidyFees.lines![0].values).toEqual([0.25])
    })

    it('should handle zero denominator in fee percentage calculation', () => {
      const mockApi = {
        regions: [
          {
            region: 'SITE-C',
            log: [
              { ts: 1640995200000, totalFeesBTC: 0, hashRevenueBTC: 0, avgFeesSatsVByte: 15.0 },
            ],
          },
        ],
      } as unknown as ReportApiResponse

      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })
      expect(result.subsidyFees.lines![0].values).toEqual([0])
    })

    it('should have correct chart structure and styling properties', () => {
      const mockApi = { regions: [{ region: 'SITE-C', log: [] }] } as unknown as ReportApiResponse
      const result = buildSubsidyFeesCharts(mockApi, { days: 15 })

      expect(result.subsidyFees).toMatchObject({
        labels: expect.any(Array),
        series: expect.arrayContaining([
          expect.objectContaining({
            label: 'Subsidy',
            stack: 'rev',
            gradient: { top: 0.3, bottom: 0.1 },
          }),
          expect.objectContaining({
            label: 'Fees',
            stack: 'rev',
            gradient: { top: 0.3, bottom: 0.1 },
          }),
        ]),
        lines: expect.arrayContaining([expect.objectContaining({ label: 'Fee %', yAxisID: 'y1' })]),
      })

      expect(result.avgFeesSats).toMatchObject({
        labels: expect.any(Array),
        series: expect.arrayContaining([
          expect.objectContaining({ label: 'Avg Fee', gradient: { top: 0.3, bottom: 0.1 } }),
        ]),
      })

      expect(result.subsidyFees.series).toHaveLength(2)
      expect(result.subsidyFees.lines).toHaveLength(1)
      expect(result.avgFeesSats.series).toHaveLength(1)
    })
  })
})
