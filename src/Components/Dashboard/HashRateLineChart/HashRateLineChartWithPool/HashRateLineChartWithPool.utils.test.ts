import { vi } from 'vitest'

import type { HashRateLogEntry, HashRateDataPoint } from '../HashRateLineChart.types'

import { SITE_OPERATION_CHART_COLORS } from './HashRateLineChartWithPool.const'
import type { Legend, MinerPoolDataItem } from './HashRateLineChartWithPool.types'
import {
  buildChartData,
  buildLegends,
  calculateAggrPoolData,
  calculateMinMaxAvg,
  calculateTimeRange,
  downsampleToTimeline,
  extractUniquePoolTypes,
  filterAndDownsampleMinerPoolData,
  getHashRateTimeRange,
  getMajorDatasetItems,
  getThresholdKey,
  normalizeDatasets,
  transformHashRateData,
} from './HashRateLineChartWithPool.utils'

import { DATE_RANGE, WEBAPP_DISPLAY_NAME } from '@/constants'
import { CHART_COLORS } from '@/constants/colors'

vi.mock('@/app/utils/deviceUtils', () => ({
  getHashrateString: vi.fn((value: number) => `${value} MH/s`),
}))

vi.mock('@/app/utils/getTimeRange', () => ({
  getTimeRange: vi.fn((latest: number, oldest: number) => {
    const range = latest - oldest
    return range <= 24 * 60 * 60 * 1000 ? 'minute' : 'day'
  }),
  TimeRangeTypes: {
    DAY: 'day',
    MINUTE: 'minute',
  },
}))

vi.mock('@/app/utils/numberUtils', () => ({
  decimalToMegaNumber: vi.fn((value: number) => value / 1_000_000),
}))

describe('HashRateLineChartWithPool.utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHashRateTimeRange', () => {
    it('should return null for undefined data', () => {
      expect(getHashRateTimeRange([])).toBeNull()
    })

    it('should return null for empty array', () => {
      expect(getHashRateTimeRange([])).toBeNull()
    })

    it('should return null if all timestamps are 0 or missing', () => {
      const data: HashRateLogEntry[] = [{ ts: 0 }, { ts: 0 }]
      expect(getHashRateTimeRange(data)).toBeNull()
    })

    it('should return correct time range for valid data', () => {
      const data: HashRateLogEntry[] = [
        { ts: 1000, hashrate_mhs_1m_sum_aggr: 100 },
        { ts: 2000, hashrate_mhs_1m_sum_aggr: 200 },
        { ts: 3000, hashrate_mhs_1m_sum_aggr: 150 },
      ]
      const result = getHashRateTimeRange(data)
      expect(result).toEqual({ start: 1000, end: 3000 })
    })

    it('should filter out zero timestamps', () => {
      const data: HashRateLogEntry[] = [{ ts: 0 }, { ts: 1000 }, { ts: 2000 }, { ts: 0 }]
      const result = getHashRateTimeRange(data)
      expect(result).toEqual({ start: 1000, end: 2000 })
    })
  })

  describe('transformHashRateData', () => {
    it('should return empty array for undefined data', () => {
      expect(transformHashRateData([])).toEqual([])
    })

    it('should return empty array for empty data', () => {
      expect(transformHashRateData([])).toEqual([])
    })

    it('should transform data correctly', () => {
      const data: HashRateLogEntry[] = [
        { ts: 1000, hashrate_mhs_1m_sum_aggr: 100 },
        { ts: 2000, hashrate_mhs_1m_sum_aggr: 200 },
      ]
      const result = transformHashRateData(data)
      expect(result).toEqual([
        { x: 1000, y: 100 },
        { x: 2000, y: 200 },
      ])
    })

    it('should handle missing values with defaults', () => {
      const data: HashRateLogEntry[] = [
        { ts: 0 },
        { ts: 1000, hashrate_mhs_1m_sum_aggr: undefined },
      ]
      const result = transformHashRateData(data)
      expect(result).toEqual([
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
      ])
    })
  })

  describe('calculateAggrPoolData', () => {
    it('should return empty array for undefined data', () => {
      expect(calculateAggrPoolData(undefined)).toEqual([])
    })

    it('should return empty array for empty data', () => {
      expect(calculateAggrPoolData([])).toEqual([])
    })

    it('should aggregate pool hashrates correctly', () => {
      const data: MinerPoolDataItem[] = [
        {
          ts: 1000,
          stats: [
            { poolType: 'ocean', hashrate: 1_000_000 },
            { poolType: 'f2pool', hashrate: 2_000_000 },
          ],
        },
        {
          ts: 2000,
          stats: [{ poolType: 'ocean', hashrate: 3_000_000 }],
        },
      ]
      const result = calculateAggrPoolData(data)
      expect(result).toEqual([
        { x: 1000, y: 3 }, // (1M + 2M) / 1M = 3
        { x: 2000, y: 3 }, // 3M / 1M = 3
      ])
    })

    it('should handle missing hashrate values', () => {
      const data: MinerPoolDataItem[] = [
        {
          ts: 1000,
          stats: [{ poolType: 'ocean', hashrate: 0 }],
        },
      ]
      const result = calculateAggrPoolData(data)
      expect(result).toEqual([{ x: 1000, y: 0 }])
    })
  })

  describe('calculateMinMaxAvg', () => {
    it('should return empty object for empty data', () => {
      expect(calculateMinMaxAvg([])).toEqual({})
    })

    it('should calculate min, max, avg correctly', () => {
      const data: HashRateDataPoint[] = [
        { x: 1000, y: 100 },
        { x: 2000, y: 200 },
        { x: 3000, y: 300 },
      ]
      const result = calculateMinMaxAvg(data)
      expect(result).toEqual({
        min: '100 MH/s',
        max: '300 MH/s',
        avg: '200 MH/s',
      })
    })

    it('should handle single data point', () => {
      const data: HashRateDataPoint[] = [{ x: 1000, y: 150 }]
      const result = calculateMinMaxAvg(data)
      expect(result).toEqual({
        min: '150 MH/s',
        max: '150 MH/s',
        avg: '150 MH/s',
      })
    })

    it('should handle zero values', () => {
      const data: HashRateDataPoint[] = [
        { x: 1000, y: 0 },
        { x: 2000, y: 0 },
      ]
      const result = calculateMinMaxAvg(data)
      expect(result).toEqual({
        min: '0 MH/s',
        max: '0 MH/s',
        avg: '0 MH/s',
      })
    })
  })

  describe('calculateTimeRange', () => {
    it('should call getTimeRange with correct parameters for empty data', () => {
      const result = calculateTimeRange([])
      // Empty array: _last([])?.x ?? 0 = 0, _head([])?.x ?? 0 = 0
      // Mock returns 'minute' for range <= 24h (0 - 0 = 0 <= 24h)
      expect(result).toBe('minute')
    })

    it('should return minute for short time range', () => {
      const data: HashRateDataPoint[] = [
        { x: 1000, y: 100 },
        { x: 1000 + 60 * 60 * 1000, y: 200 }, // 1 hour later
      ]
      const result = calculateTimeRange(data)
      expect(result).toBe('minute')
    })

    it('should return day for long time range', () => {
      const data: HashRateDataPoint[] = [
        { x: 1000, y: 100 },
        { x: 1000 + 48 * 60 * 60 * 1000, y: 200 }, // 48 hours later
      ]
      const result = calculateTimeRange(data)
      expect(result).toBe('day')
    })
  })

  describe('extractUniquePoolTypes', () => {
    it('should return empty array for undefined data', () => {
      expect(extractUniquePoolTypes(undefined)).toEqual([])
    })

    it('should return empty array for empty data', () => {
      expect(extractUniquePoolTypes([])).toEqual([])
    })

    it('should extract unique pool types', () => {
      const data: MinerPoolDataItem[] = [
        {
          ts: 1000,
          stats: [
            { poolType: 'ocean', hashrate: 100 },
            { poolType: 'f2pool', hashrate: 200 },
          ],
        },
        {
          ts: 2000,
          stats: [
            { poolType: 'ocean', hashrate: 150 },
            { poolType: 'viabtc', hashrate: 250 },
          ],
        },
      ]
      const result = extractUniquePoolTypes(data)
      expect(result).toEqual(['ocean', 'f2pool', 'viabtc'])
    })

    it('should filter out falsy pool types', () => {
      const data: MinerPoolDataItem[] = [
        {
          ts: 1000,
          stats: [
            { poolType: '', hashrate: 100 },
            { poolType: 'ocean', hashrate: 200 },
          ],
        },
      ]
      const result = extractUniquePoolTypes(data)
      expect(result).toEqual(['ocean'])
    })
  })

  describe('buildLegends', () => {
    it('should return empty array when hasData is false', () => {
      expect(buildLegends(['ocean', 'f2pool'], false)).toEqual([])
    })

    it('should return default legend only when no pool types', () => {
      const result = buildLegends([], true)
      expect(result).toEqual([
        { label: `${WEBAPP_DISPLAY_NAME} Hash Rate`, color: CHART_COLORS.SKY_BLUE },
      ])
    })

    it('should include pool type legends', () => {
      const result = buildLegends(['ocean', 'f2pool'], true)
      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        label: `${WEBAPP_DISPLAY_NAME} Hash Rate`,
        color: CHART_COLORS.SKY_BLUE,
      })
      expect(result[1]).toEqual({
        label: 'Aggr Pool Hash Rate',
        color: CHART_COLORS.METALLIC_BLUE,
      })
      expect(result[2]).toEqual({
        poolType: 'ocean',
        label: 'Ocean Hash Rate',
        color: SITE_OPERATION_CHART_COLORS[1],
      })
      expect(result[3]).toEqual({
        poolType: 'f2pool',
        label: 'F2pool Hash Rate',
        color: SITE_OPERATION_CHART_COLORS[2],
      })
    })
  })

  describe('downsampleToTimeline', () => {
    it('should return empty array for empty data', () => {
      expect(downsampleToTimeline([], DATE_RANGE.M5)).toEqual([])
    })

    it('should return sorted unique data for M5 timeline', () => {
      const data: MinerPoolDataItem[] = [
        { ts: 2000, stats: [{ poolType: 'ocean', hashrate: 200 }] },
        { ts: 1000, stats: [{ poolType: 'ocean', hashrate: 100 }] },
        { ts: 1000, stats: [{ poolType: 'ocean', hashrate: 100 }] }, // duplicate
      ]
      const result = downsampleToTimeline(data, DATE_RANGE.M5)
      expect(result).toHaveLength(2)
      expect(result[0].ts).toBe(1000)
      expect(result[1].ts).toBe(2000)
    })

    it('should bucket data for other timelines', () => {
      const msPerHour = 60 * 60 * 1000
      const data: MinerPoolDataItem[] = [
        { ts: 0, stats: [{ poolType: 'ocean', hashrate: 100 }] },
        { ts: msPerHour, stats: [{ poolType: 'ocean', hashrate: 200 }] },
        { ts: msPerHour * 2, stats: [{ poolType: 'ocean', hashrate: 300 }] },
        { ts: msPerHour * 3, stats: [{ poolType: 'ocean', hashrate: 400 }] },
      ]
      const result = downsampleToTimeline(data, DATE_RANGE.H3)
      // 3-hour buckets: [0, 1h, 2h] in first bucket, [3h] in second
      expect(result).toHaveLength(2)
    })
  })

  describe('getMajorDatasetItems', () => {
    it('should return undefined for undefined data', () => {
      const legend: Legend = { label: 'Ocean', color: '#fff', poolType: 'ocean' }
      expect(getMajorDatasetItems(undefined, legend)).toEqual([])
    })

    it('should map data correctly', () => {
      const data: MinerPoolDataItem[] = [
        { ts: 1000, stats: [{ poolType: 'ocean', hashrate: 1_000_000 }] },
        { ts: 2000, stats: [{ poolType: 'f2pool', hashrate: 2_000_000 }] },
      ]
      const legend: Legend = { label: 'Ocean', color: '#fff', poolType: 'ocean' }
      const result = getMajorDatasetItems(data, legend)
      expect(result).toHaveLength(2)
      expect(result?.[0].x).toBe(1000)
      expect(result?.[0].y).toBe(1) // 1M / 1M = 1
      expect(result?.[1].x).toBe(2000)
      expect(result?.[1].y).toBe(0) // no ocean pool in second item
    })
  })

  describe('normalizeDatasets', () => {
    it('should normalize datasets correctly', () => {
      const datasets = [
        {
          label: 'Test',
          color: '#fff',
          data: [
            { x: 2000, y: 200 },
            { x: 1000, y: 100 },
          ],
        },
      ]
      const legendHidden = { Test: false }
      const result = normalizeDatasets(datasets, legendHidden)
      expect(result[0].visible).toBe(true)
      expect(result[0].borderColor).toBe('#fff')
      // Data should be sorted by x
      expect(result[0].data[0].x).toBe(1000)
      expect(result[0].data[1].x).toBe(2000)
    })

    it('should handle hidden legends', () => {
      const datasets = [{ label: 'Hidden', color: '#fff', data: [] }]
      const legendHidden = { Hidden: true }
      const result = normalizeDatasets(datasets, legendHidden)
      expect(result[0].visible).toBe(false)
    })

    it('should deduplicate by x value', () => {
      const datasets = [
        {
          label: 'Test',
          color: '#fff',
          data: [
            { x: 1000, y: 100 },
            { x: 1000, y: 150 }, // duplicate x
          ],
        },
      ]
      const result = normalizeDatasets(datasets, {})
      expect(result[0].data).toHaveLength(1)
    })
  })

  describe('getThresholdKey', () => {
    it('should return correct threshold key for M5', () => {
      expect(getThresholdKey(DATE_RANGE.M5)).toBe('M5')
    })

    it('should return correct threshold key for M30', () => {
      expect(getThresholdKey(DATE_RANGE.M30)).toBe('M30')
    })

    it('should return correct threshold key for H3', () => {
      expect(getThresholdKey(DATE_RANGE.H3)).toBe('H3')
    })

    it('should return correct threshold key for D1', () => {
      expect(getThresholdKey(DATE_RANGE.D1)).toBe('D1')
    })
  })

  describe('filterAndDownsampleMinerPoolData', () => {
    it('should return undefined for undefined data', () => {
      expect(filterAndDownsampleMinerPoolData(undefined, null, DATE_RANGE.M5)).toBeUndefined()
    })

    it('should filter data based on time range', () => {
      const data: MinerPoolDataItem[] = [
        { ts: 500, stats: [] },
        { ts: 1000, stats: [] },
        { ts: 1500, stats: [] },
        { ts: 2500, stats: [] },
      ]
      const timeRange = { start: 1000, end: 2000 }
      const result = filterAndDownsampleMinerPoolData(data, timeRange, DATE_RANGE.M5)
      expect(result).toHaveLength(2)
    })

    it('should return all data when time range is null', () => {
      const data: MinerPoolDataItem[] = [
        { ts: 1000, stats: [] },
        { ts: 2000, stats: [] },
      ]
      const result = filterAndDownsampleMinerPoolData(data, null, DATE_RANGE.M5)
      expect(result).toHaveLength(2)
    })
  })

  describe('buildChartData', () => {
    const mockLegends: Legend[] = [
      { label: 'Mining OS Hash Rate', color: CHART_COLORS.SKY_BLUE },
      { label: 'Aggr Pool Hash Rate', color: CHART_COLORS.METALLIC_BLUE },
    ]

    it('should build chart data correctly', () => {
      const hashRateData: HashRateDataPoint[] = [{ x: 1000, y: 100 }]
      const aggrPoolData: HashRateDataPoint[] = [{ x: 1000, y: 50 }]

      const result = buildChartData({
        legends: mockLegends,
        hashRateData,
        aggrPoolData,
        minerPoolData: undefined,
        legendHidden: {},
        timeRange: 'minute',
      })

      expect(result.datasets).toHaveLength(2)
      expect(result.timeRange).toBe('minute')
      expect(result.datasets[0].data).toHaveLength(1)
      expect(result.datasets[1].data).toHaveLength(1)
    })

    it('should handle pool type legends', () => {
      const legends: Legend[] = [
        { label: 'Mining OS Hash Rate', color: CHART_COLORS.SKY_BLUE },
        { label: 'Aggr Pool Hash Rate', color: CHART_COLORS.METALLIC_BLUE },
        { label: 'Ocean Hash Rate', color: CHART_COLORS.purple, poolType: 'ocean' },
      ]

      const minerPoolData: MinerPoolDataItem[] = [
        { ts: 1000, stats: [{ poolType: 'ocean', hashrate: 1_000_000 }] },
      ]

      const result = buildChartData({
        legends,
        hashRateData: [{ x: 1000, y: 100 }],
        aggrPoolData: [{ x: 1000, y: 1 }],
        minerPoolData,
        legendHidden: {},
        timeRange: 'minute',
      })

      expect(result.datasets).toHaveLength(3)
      expect(result.datasets[2].data).toHaveLength(1)
    })
  })
})
