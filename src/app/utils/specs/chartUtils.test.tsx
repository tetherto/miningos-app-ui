import type { Chart, ChartDataset, LegendItem } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import _isFunction from 'lodash/isFunction'

import { Miners } from '../../../Components/Farms/FarmCard/StatBox/Icons/Miners'
import {
  generateChartLegendLabels,
  getChartBuilderData,
  getChartBuilderDatasetLines,
  getLineChartBuilderDataset,
  handleLegendClick,
  hasDataValues,
  hasNonZeroLineSeriesValues,
  hasNonZeroSeriesValues,
  SafeChartDataLabels,
} from '../chartUtils'
import { formatBalance } from '../format'

// Test types that match the actual chartUtils types
interface TestChartLine {
  label: string
  backendAttribute: string
  yValueOperator?: (value: number) => number
  borderColor: string
  borderWidth?: number
  legendIcon?: React.ReactElement
}

interface TestChartDataPayload {
  lines: TestChartLine[]
  formatter?: (value: number) => { value: string | number; unit: string; realValue: number }
  currentValueLabel?: { backendAttribute: string }
  isMuliplePoolChart?: boolean
  legendIcon?: React.ReactElement
  multiplePoolBEAttribute?: string
  totalPoolBEAttribute?: string
  yValueOperator?: (value: number) => number
  labelSuffix?: string
}

interface TestDataEntry {
  ts: number
  [key: string]: unknown
}

type TestDataPoint = { x: number; y: number }
type TestDatasetLinesData = TestDataPoint[][]

describe('getChartBuilderDatasetLines', () => {
  it('returns an empty array if data is empty', () => {
    const chartDataPayload = { lines: [] } as unknown as TestChartDataPayload
    const data: TestDataEntry[] = []
    const result = getChartBuilderDatasetLines(chartDataPayload as never, data as never)

    expect(result).toEqual([])
  })

  it('correctly formats data for a single line', () => {
    const chartDataPayload = {
      lines: [{ label: 'Value', backendAttribute: 'value', borderColor: '#000' }],
    } as unknown as TestChartDataPayload
    const data: TestDataEntry[] = [{ ts: 123, value: 456 }]
    const result = getChartBuilderDatasetLines(chartDataPayload as never, data as never)

    expect(result).toEqual([[{ x: 123, y: 456 }]])
  })

  it('correctly formats data for multiple lines', () => {
    const chartDataPayload = {
      lines: [
        { label: 'Sum', backendAttribute: 'hashrate_mhs_1m_sum_aggr', borderColor: '#111' },
        { label: 'Avg', backendAttribute: 'hashrate_mhs_1m_avg_aggr', borderColor: '#222' },
      ],
    } as unknown as TestChartDataPayload
    const data: TestDataEntry[] = [
      {
        ts: 1700052900000,
        hashrate_mhs_1m_sum_aggr: 10,
        hashrate_mhs_1m_group_sum_aggr: {
          'bitdeer-10a': 0,
        },
        hashrate_mhs_1m_avg_aggr: 11,
      },
      {
        ts: 1700053200000,
        hashrate_mhs_1m_sum_aggr: 0,
        hashrate_mhs_1m_group_sum_aggr: {
          'bitdeer-10a': 0,
        },
        hashrate_mhs_1m_avg_aggr: 0,
      },
    ]
    const result = getChartBuilderDatasetLines(chartDataPayload as never, data as never)

    expect(result).toEqual([
      [
        { x: 1700052900000, y: 10 },
        { x: 1700053200000, y: 0 },
      ],
      [
        { x: 1700052900000, y: 11 },
        { x: 1700053200000, y: 0 },
      ],
    ])
  })
})

describe('getLineChartBuilderDataset', () => {
  it('returns an empty array if lines and datasetLinesData are empty', () => {
    const chartDataPayload = { lines: [] } as unknown as TestChartDataPayload
    const datasetLinesData: TestDatasetLinesData = []
    const result = getLineChartBuilderDataset(chartDataPayload as never, datasetLinesData)

    expect(result).toEqual([])
  })

  it('correctly formats dataset for a single line', () => {
    const chartDataPayload = {
      lines: [
        { label: 'Line 1', borderColor: '#000', backendAttribute: 'value', legendIcon: <Miners /> },
      ],
    } as unknown as TestChartDataPayload
    const datasetLinesData: TestDatasetLinesData = [
      [
        { x: 123, y: 456 },
        { x: 456, y: 789 },
      ],
    ]
    const result = getLineChartBuilderDataset(chartDataPayload as never, datasetLinesData)
    expect(result).toEqual([
      {
        type: 'line',
        label: 'Line 1',
        data: [
          { x: 123, y: 456 },
          { x: 456, y: 789 },
        ],
        borderColor: '#000',
        borderWidth: 2,
        currentValue: {
          unit: '',
          value: '789',
          realValue: 789,
        },
        legendIcon: <Miners />,
        pointRadius: 1,
        yesterdayAvg: undefined,
      },
    ])
  })

  it('correctly formats dataset for multiple lines', () => {
    const chartDataPayload = {
      lines: [
        {
          label: 'Line 1',
          borderColor: '#111',
          backendAttribute: 'value1',
          legendIcon: <Miners />,
        },
        {
          label: 'Line 2',
          borderColor: '#222',
          backendAttribute: 'value2',
          legendIcon: <Miners />,
        },
      ],
    } as unknown as TestChartDataPayload
    const datasetLinesData: TestDatasetLinesData = [
      [
        { x: 123, y: 456 },
        { x: 456, y: 789 },
      ],
      [
        { x: 789, y: 111 },
        { x: 101, y: 222 },
      ],
    ]

    const result = getLineChartBuilderDataset(chartDataPayload as never, datasetLinesData)

    expect(result).toEqual([
      {
        type: 'line',
        label: 'Line 1',
        data: [
          { x: 123, y: 456 },
          { x: 456, y: 789 },
        ],
        borderColor: '#111',
        borderWidth: 2,
        currentValue: {
          unit: '',
          value: '789',
          realValue: 789,
        },
        legendIcon: <Miners />,
        pointRadius: 1,
        yesterdayAvg: undefined,
      },
      {
        type: 'line',
        label: 'Line 2',
        data: [
          { x: 789, y: 111 },
          { x: 101, y: 222 },
        ],
        borderColor: '#222',
        borderWidth: 2,
        currentValue: {
          unit: '',
          value: '222',
          realValue: 222,
        },
        legendIcon: <Miners />,
        pointRadius: 1,
        yesterdayAvg: undefined,
      },
    ])
  })
})

describe('getChartBuilderData', () => {
  const REVENUE_CHART_PAYLOAD = {
    lines: [
      {
        label: 'Revenue 24 hrs',
        backendAttribute: 'revenue_24h',
        borderColor: 'green',
        legendIcon: <Miners />,
      },
    ],
    formatter: formatBalance,
    currentValueLabel: {
      backendAttribute: 'revenue_24h',
    },
  } as unknown as TestChartDataPayload

  it('correctly gets dataset for chart', () => {
    const data = [
      {
        ts: 1700052900000,
        revenue_24h: 10,
      },
      {
        ts: 1700053200000,
        revenue_24h: 0,
      },
    ]
    const yestedayAggr = {
      ts: 1700052900000,
      revenue_24h: 10,
    }

    const result = getChartBuilderData(REVENUE_CHART_PAYLOAD as never)
    const response = result(data as never, yestedayAggr)

    expect(response.datasets).toEqual([
      {
        borderColor: 'green',
        borderWidth: 2,
        currentValue: {
          value: 0,
          unit: 'BTC',
          realValue: 0,
        },
        data: [
          { x: 1700052900000, y: 10 },
          { x: 1700053200000, y: 0 },
        ],
        label: 'Revenue 24 hrs',
        legendIcon: <Miners />,
        pointRadius: 1,
        type: 'line',
        yesterdayAvg: {
          value: 0.034722222222222224,
          unit: 'BTC',
          realValue: 10 / 288,
        },
      },
    ])
    expect(response.currentValueLabel).toEqual({ unit: 'BTC', value: 0, realValue: 0 })
    expect(response.timeRange).toEqual('minute')
    expect(response.skipRound).toEqual(true)
  })
})

describe('hasDataValues', () => {
  describe('edge cases', () => {
    it('should return false for null input', () => {
      expect(hasDataValues(null)).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(hasDataValues(undefined)).toBe(false)
    })

    it('should return false for empty object', () => {
      expect(hasDataValues({})).toBe(false)
    })

    it('should return false for empty array', () => {
      expect(hasDataValues([])).toBe(false)
    })
  })

  describe('simple values', () => {
    it('should return true for object with non-null values', () => {
      expect(hasDataValues({ key1: 'value1', key2: 123 })).toBe(true)
    })

    it('should return false for object with only null values', () => {
      expect(hasDataValues({ key1: null, key2: null })).toBe(false)
    })

    it('should return false for object with only undefined values', () => {
      expect(hasDataValues({ key1: undefined, key2: undefined })).toBe(false)
    })

    it('should return false for object with only label keys', () => {
      expect(hasDataValues({ label: 'some label' })).toBe(false)
    })

    it('should return true for object with label and data keys', () => {
      expect(hasDataValues({ label: 'some label', data: 123 })).toBe(true)
    })
  })

  describe('nested objects', () => {
    it('should return true for nested object with value property', () => {
      expect(
        hasDataValues({
          key1: { value: 123 },
          key2: { value: 'test' },
        }),
      ).toBe(true)
    })

    it('should return false for nested object without value property', () => {
      expect(
        hasDataValues({
          key1: { other: 123 },
          key2: { other: 'test' },
        }),
      ).toBe(false)
    })

    it('should return false for nested object with null value property', () => {
      expect(
        hasDataValues({
          key1: { value: null },
          key2: { value: undefined },
        }),
      ).toBe(false)
    })

    it('should return true for mixed nested objects', () => {
      expect(
        hasDataValues({
          key1: { value: 123 },
          key2: 'direct value',
          key3: { other: 'ignored' },
        }),
      ).toBe(true)
    })
  })

  describe('arrays', () => {
    it('should return true for array with data values', () => {
      expect(hasDataValues([{ value: 123 }, { value: 'test' }])).toBe(true)
    })

    it('should return true for array with objects containing non-null values', () => {
      expect(hasDataValues([{ other: 123 }, { other: 'test' }])).toBe(true)
    })

    it('should return true for array with mixed data', () => {
      expect(hasDataValues([{ value: 123 }, { other: 'ignored' }])).toBe(true)
    })

    it('should handle nested arrays', () => {
      expect(hasDataValues([[{ value: 123 }], [{ other: 'ignored' }]])).toBe(true)
    })

    it('should handle deeply nested arrays', () => {
      expect(hasDataValues([[[[{ value: 123 }]]], [[[{ other: 'ignored' }]]]])).toBe(true)
    })
  })

  describe('mixed data structures', () => {
    it('should handle complex nested structures', () => {
      const complexData = {
        datasets: [
          { label: 'Dataset 1', data: [1, 2, 3] },
          { label: 'Dataset 2', data: [4, 5, 6] },
        ],
        metadata: {
          timestamp: '2023-01-01',
          version: 1.0,
        },
      }
      expect(hasDataValues(complexData)).toBe(true)
    })

    it('should handle chart.js style data structure', () => {
      const chartData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Sales',
            data: [10, 20, 30],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      }
      expect(hasDataValues(chartData)).toBe(true)
    })
  })

  describe('API data structures', () => {
    it('should handle API response with primitive values', () => {
      const apiData = {
        totalRevenueBTC: 0,
        hashrateMHS: 84192407842.03128,
        sitePowerW: 0,
        currentBTCPrice: 113518,
        energyRevenueBTC: null,
        region: 'SITE-C',
      }
      expect(hasDataValues(apiData)).toBe(true)
    })

    it('should handle API response with all null/zero values', () => {
      const emptyApiData = {
        totalRevenueBTC: 0,
        hashrateMHS: 0,
        sitePowerW: 0,
        currentBTCPrice: 0,
        energyRevenueBTC: null,
        energyRevenueUSD: null,
      }
      expect(hasDataValues(emptyApiData)).toBe(true) // 0 is still data
    })
  })

  describe('real-world scenarios', () => {
    it('should work with truly empty data', () => {
      const emptyData = {
        labels: [],
        datasets: [
          {
            label: 'Sales',
            data: [],
          },
        ],
      }
      expect(hasDataValues(emptyData)).toBe(false)
    })

    it('should work with partial data', () => {
      const partialData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Sales',
            data: [10, null, 30],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      }
      expect(hasDataValues(partialData)).toBe(true)
    })
  })
})

describe('hasNonZeroSeriesValues', () => {
  describe('empty/null cases', () => {
    it('should return false for empty array', () => {
      expect(hasNonZeroSeriesValues([])).toBe(false)
    })

    it('should return false for series with empty values array', () => {
      expect(hasNonZeroSeriesValues([{ values: [] }])).toBe(false)
    })

    it('should return false for series with undefined values', () => {
      expect(hasNonZeroSeriesValues([{ values: undefined }])).toBe(false)
    })
  })

  describe('zero value cases', () => {
    it('should return false when all values are zero', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, 0, 0] }])).toBe(false)
    })

    it('should return false when multiple series all have zero values', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, 0, 0] }, { values: [0, 0, 0] }])).toBe(false)
    })

    it('should return false when values contain null and zero', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, null, 0, undefined] }])).toBe(false)
    })
  })

  describe('non-zero value cases', () => {
    it('should return true when at least one value is non-zero', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, 1, 0] }])).toBe(true)
    })

    it('should return true when one series has non-zero values', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, 0, 0] }, { values: [0, 5, 0] }])).toBe(true)
    })

    it('should return true for negative values', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, -5, 0] }])).toBe(true)
    })

    it('should return true for decimal values', () => {
      expect(hasNonZeroSeriesValues([{ values: [0, 0.001, 0] }])).toBe(true)
    })
  })

  describe('real-world bar chart data', () => {
    it('should detect empty "Avg All-in Power Cost" chart', () => {
      const powerCostData = [
        { label: 'Cost', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: '#867DF9' },
        { label: 'Revenue', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: '#34C759' },
      ]
      expect(hasNonZeroSeriesValues(powerCostData)).toBe(false)
    })

    it('should detect chart with actual data', () => {
      const revenueData = [
        { label: 'Cost', values: [100, 200, 150, 180], color: '#867DF9' },
        { label: 'Revenue', values: [120, 250, 180, 200], color: '#34C759' },
      ]
      expect(hasNonZeroSeriesValues(revenueData)).toBe(true)
    })
  })
})

describe('hasNonZeroLineSeriesValues', () => {
  describe('empty/null cases', () => {
    it('should return false for empty array', () => {
      expect(hasNonZeroLineSeriesValues([])).toBe(false)
    })

    it('should return false for series with empty points array', () => {
      expect(hasNonZeroLineSeriesValues([{ points: [] }])).toBe(false)
    })

    it('should return false for series with undefined points', () => {
      expect(hasNonZeroLineSeriesValues([{ points: undefined }])).toBe(false)
    })
  })

  describe('zero value cases', () => {
    it('should return false when all point values are zero', () => {
      expect(
        hasNonZeroLineSeriesValues([
          {
            points: [{ value: 0 }, { value: 0 }, { value: 0 }],
          },
        ]),
      ).toBe(false)
    })

    it('should return false when multiple series all have zero values', () => {
      expect(
        hasNonZeroLineSeriesValues([{ points: [{ value: 0 }] }, { points: [{ value: 0 }] }]),
      ).toBe(false)
    })
  })

  describe('non-zero value cases', () => {
    it('should return true when at least one point value is non-zero', () => {
      expect(
        hasNonZeroLineSeriesValues([
          {
            points: [{ value: 0 }, { value: 100 }, { value: 0 }],
          },
        ]),
      ).toBe(true)
    })

    it('should return true when one series has non-zero values', () => {
      expect(
        hasNonZeroLineSeriesValues([{ points: [{ value: 0 }] }, { points: [{ value: 50 }] }]),
      ).toBe(true)
    })

    it('should return true for negative values', () => {
      expect(hasNonZeroLineSeriesValues([{ points: [{ value: -10 }] }])).toBe(true)
    })

    it('should return true for decimal values', () => {
      expect(hasNonZeroLineSeriesValues([{ points: [{ value: 0.0001 }] }])).toBe(true)
    })
  })

  describe('real-world line chart data', () => {
    it('should detect empty hashrate chart', () => {
      const emptyHashrate = [
        {
          label: 'Daily Average Hashrate',
          points: [{ value: 0 }, { value: 0 }, { value: 0 }],
        },
      ]
      expect(hasNonZeroLineSeriesValues(emptyHashrate)).toBe(false)
    })

    it('should detect chart with actual hashrate data', () => {
      const hashrateData = [
        {
          label: 'Daily Average Hashrate',
          points: [{ value: 84192407842 }, { value: 85000000000 }, { value: 83500000000 }],
        },
      ]
      expect(hasNonZeroLineSeriesValues(hashrateData)).toBe(true)
    })
  })
})

describe('handleLegendClick', () => {
  it('should toggle dataset visibility when legend item is clicked', () => {
    const meta: { hidden?: boolean } = { hidden: false }
    const chart = {
      getDatasetMeta: vi.fn().mockReturnValue(meta),
      update: vi.fn(),
    } as unknown as Chart
    const legend = { chart }
    const legendItem = { datasetIndex: 1, text: 'Test Legend' } as LegendItem
    const event = {}

    handleLegendClick(event, legendItem, legend)

    expect(chart.getDatasetMeta).toHaveBeenCalledWith(1)
    expect(meta.hidden).toBe(true)
    expect(chart.update).toHaveBeenCalled()
  })

  it('should toggle from hidden to visible', () => {
    const meta: { hidden?: boolean } = { hidden: true }
    const chart = {
      getDatasetMeta: vi.fn().mockReturnValue(meta),
      update: vi.fn(),
    } as unknown as Chart
    const legend = { chart }
    const legendItem = { datasetIndex: 0, text: 'Test Legend' } as LegendItem
    const event = {}

    handleLegendClick(event, legendItem, legend)

    expect(meta.hidden).toBe(false)
    expect(chart.update).toHaveBeenCalled()
  })

  it('should handle undefined hidden state', () => {
    const meta: { hidden?: boolean } = {}
    const chart = {
      getDatasetMeta: vi.fn().mockReturnValue(meta),
      update: vi.fn(),
    } as unknown as Chart
    const legend = { chart }
    const legendItem = { datasetIndex: 2, text: 'Test Legend' } as LegendItem
    const event = {}

    handleLegendClick(event, legendItem, legend)

    expect(meta.hidden).toBe(true)
    expect(chart.update).toHaveBeenCalled()
  })
})

describe('generateChartLegendLabels', () => {
  it('should generate labels for visible datasets with default options', () => {
    const chart = {
      data: {
        datasets: [
          { label: 'Dataset 1', borderColor: '#FF0000', data: [] },
          { label: 'Dataset 2', borderColor: '#00FF00', data: [] },
        ] as ChartDataset[],
      },
      isDatasetVisible: vi.fn().mockReturnValue(true),
    } as unknown as Chart

    const result = generateChartLegendLabels(chart)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      text: 'Dataset 1',
      cursor: 'pointer',
      fontColor: '#FFFFFF',
      fillStyle: 'rgba(255, 0, 0, 0.2)',
      strokeStyle: 'rgba(255, 0, 0, 1)',
      index: 0,
      datasetIndex: 0,
      textDecoration: 'none',
    })
    expect(result[1]).toEqual({
      text: 'Dataset 2',
      cursor: 'pointer',
      fontColor: '#FFFFFF',
      fillStyle: 'rgba(0, 255, 0, 0.2)',
      strokeStyle: 'rgba(0, 255, 0, 1)',
      index: 1,
      datasetIndex: 1,
      textDecoration: 'none',
    })
  })

  it('should handle hidden datasets with proper opacity', () => {
    const chart = {
      data: {
        datasets: [
          { label: 'Visible Dataset', borderColor: '#FF0000', data: [] },
          { label: 'Hidden Dataset', borderColor: '#00FF00', data: [] },
        ] as ChartDataset[],
      },
      isDatasetVisible: vi.fn((index: number) => index === 0),
    } as unknown as Chart

    const result = generateChartLegendLabels(chart)

    expect(result[0]).toMatchObject({
      text: 'Visible Dataset',
      fontColor: '#FFFFFF',
      fillStyle: 'rgba(255, 0, 0, 0.2)',
      strokeStyle: 'rgba(255, 0, 0, 1)',
    })

    expect(result[1]).toMatchObject({
      text: 'Hidden Dataset',
      fontColor: 'rgba(255, 255, 255, 0.2)',
      fillStyle: 'rgba(0, 255, 0, 0.1)',
      strokeStyle: 'rgba(0, 255, 0, 0.2)',
    })
  })
})

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {
    id: 'datalabels',
    defaults: {},
    beforeInit: vi.fn(),
    beforeUpdate: vi.fn(),
    afterDatasetUpdate: vi.fn(),
    afterUpdate: vi.fn(),
    afterDatasetsDraw: vi.fn(),
  },
}))

describe('SafeChartDataLabels', () => {
  let chart: { data?: { labels?: unknown[]; datasets: ChartDataset[] } }

  beforeEach(() => {
    vi.clearAllMocks()
    chart = { data: { labels: ['A'], datasets: [] } }
  })

  it('should initialize chart.data if missing', () => {
    const emptyChart: { data?: { labels?: unknown[]; datasets: ChartDataset[] } } = {}
    if (SafeChartDataLabels.beforeInit) {
      SafeChartDataLabels.beforeInit(emptyChart as Chart, {}, {})
    }
    expect(emptyChart.data).toEqual({ labels: [], datasets: [] })
  })

  it('should call ChartDataLabels.afterDatasetsDraw when chart has labels', () => {
    const afterDatasetsDraw = SafeChartDataLabels.afterDatasetsDraw
    if (afterDatasetsDraw && _isFunction(afterDatasetsDraw)) {
      afterDatasetsDraw.call(SafeChartDataLabels, chart as Chart, {}, {}, false)
    }
    if (ChartDataLabels.afterDatasetsDraw) {
      expect(ChartDataLabels.afterDatasetsDraw).toHaveBeenCalled()
    }
  })

  it('should not call ChartDataLabels.afterDatasetsDraw when chart has no labels', () => {
    if (chart.data) {
      chart.data.labels = []
    }
    const afterDatasetsDraw = SafeChartDataLabels.afterDatasetsDraw
    if (afterDatasetsDraw && _isFunction(afterDatasetsDraw)) {
      afterDatasetsDraw.call(SafeChartDataLabels, chart as Chart, {}, {}, false)
    }
    if (ChartDataLabels.afterDatasetsDraw) {
      expect(ChartDataLabels.afterDatasetsDraw).not.toHaveBeenCalled()
    }
  })

  it('should handle error safely without throwing', async () => {
    const { Logger } = await import('@/app/services/logger')
    Logger.init(true) // Enable development mode for console logging

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    if (ChartDataLabels.afterDatasetsDraw) {
      const mockAfterDatasetsDraw = vi.mocked(ChartDataLabels.afterDatasetsDraw)
      mockAfterDatasetsDraw.mockImplementation(() => {
        throw new Error('Test Error')
      })
    }

    const afterDatasetsDraw = SafeChartDataLabels.afterDatasetsDraw
    if (afterDatasetsDraw && _isFunction(afterDatasetsDraw)) {
      expect(() =>
        afterDatasetsDraw.call(SafeChartDataLabels, chart as Chart, {}, {}, false),
      ).not.toThrow()
    }

    expect(warnSpy).toHaveBeenCalledWith(
      'SafeChartDataLabels prevented crash in afterDatasetsDraw',
      expect.any(Error),
    )

    warnSpy.mockRestore()
  })
})
